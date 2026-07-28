import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

/**
 * Post-processes the AI-generated alpha mask using an Outer Flood-Fill algorithm.
 * Starts from outer canvas borders and floods along transparent/semi-transparent pixels.
 * Any transparent pixels inside the object (e.g., white faces of a Rubik's cube) that
 * are NOT reachable from the outer background flood are restored to 100% Opaque (Alpha = 255).
 */
async function postProcessMask(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    if (channels !== 4) return inputBuffer;

    const totalPixels = width * height;
    const isExteriorBg = new Uint8Array(totalPixels); // 0 = false, 1 = true
    const queue: number[] = [];

    // Alpha threshold level: below 200 is considered candidate for background
    const ALPHA_THRESHOLD = 200;

    const enqueueIfTransparent = (x: number, y: number) => {
      const idx = y * width + x;
      if (isExteriorBg[idx] === 0) {
        const alpha = data[idx * 4 + 3];
        if (alpha < ALPHA_THRESHOLD) {
          isExteriorBg[idx] = 1;
          queue.push(idx);
        }
      }
    };

    // 1. Enqueue all 4 corners and outer frame pixels (top, bottom, left, right borders)
    for (let x = 0; x < width; x++) {
      enqueueIfTransparent(x, 0);
      enqueueIfTransparent(x, height - 1);
    }
    for (let y = 1; y < height - 1; y++) {
      enqueueIfTransparent(0, y);
      enqueueIfTransparent(width - 1, y);
    }

    // 2. BFS Flood-Fill from outer borders inward
    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % width;
      const y = Math.floor(idx / width);

      if (x > 0) enqueueIfTransparent(x - 1, y);
      if (x < width - 1) enqueueIfTransparent(x + 1, y);
      if (y > 0) enqueueIfTransparent(x, y - 1);
      if (y < height - 1) enqueueIfTransparent(x, y + 1);
    }

    // 3. Re-evaluate pixels:
    // - Unreachable from exterior background = Internal object area -> Force 100% Opaque (Alpha = 255)
    // - Reachable from exterior background = True background / drop shadow -> Set Alpha = 0 if < ALPHA_THRESHOLD
    for (let i = 0; i < totalPixels; i++) {
      const pixelOffset = i * 4;
      const isExt = isExteriorBg[i] === 1;

      if (!isExt) {
        // Restore internal transparent holes (e.g. white Rubik's cube faces)
        data[pixelOffset + 3] = 255;
      } else {
        // Clear background and remove dark drop shadows under objects
        const alpha = data[pixelOffset + 3];
        if (alpha < ALPHA_THRESHOLD) {
          data[pixelOffset + 3] = 0;
        }
      }
    }

    return await sharp(data, {
      raw: { width, height, channels: 4 },
    })
      .png()
      .toBuffer();
  } catch (err) {
    console.warn("Mask post-processing warning:", err);
    return inputBuffer;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Şəkil URL-i (imageUrl) daxil edilməlidir." },
        { status: 400 }
      );
    }

    // 1. Mənbə şəklini User-Agent başlığı ilə yükləyirik
    let imageBuffer: Buffer;
    try {
      const imageFetchResponse = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });

      if (!imageFetchResponse.ok) {
        return NextResponse.json(
          {
            error: `Mənbə şəkil URL-dən yüklənə bilmədi (Status: ${imageFetchResponse.status}). Lütfən birbaşa görünən düzgün şəkil URL-i daxil edin.`,
            use_fallback: true,
          },
          { status: 400 }
        );
      }

      const imageArrayBuffer = await imageFetchResponse.arrayBuffer();
      imageBuffer = Buffer.from(imageArrayBuffer);
    } catch (fetchErr: any) {
      console.warn("Mənbə şəkil fetch xətası:", fetchErr);
      return NextResponse.json(
        {
          error: "Şəkil adresi brauzer tərəfindən bloklandı və ya mövcud deyil. İntellektual Brauzer rejimi sınanılır...",
          use_fallback: true,
        },
        { status: 200 }
      );
    }

    // 2. Hugging Face API key yoxlanılır
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey || hfApiKey.trim() === "") {
      return NextResponse.json(
        {
          error: "HUGGINGFACE_API_KEY təyin edilməyib. Avtomatik olaraq brauzer daxili anında Fon Silmə rejimi işə salınır...",
          use_fallback: true,
        },
        { status: 200 }
      );
    }

    // 3. Hugging Face ZhengPeng7/BiRefNet AI modelinə sorğu göndərilir
    try {
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/ZhengPeng7/BiRefNet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "application/octet-stream",
          },
          body: imageBuffer,
        }
      );

      if (!hfResponse.ok) {
        const errorText = await hfResponse.text();
        console.warn("Hugging Face API cavab xətası:", hfResponse.status, errorText);
        return NextResponse.json(
          {
            error: `Hugging Face AI modeli məşğuldur və ya açar yanlışdır (${hfResponse.status}). Brauzer daxili intellektual modula keçid edilir...`,
            use_fallback: true,
          },
          { status: 200 }
        );
      }

      const rawTransparentArrayBuffer = await hfResponse.arrayBuffer();
      const rawTransparentBuffer = Buffer.from(rawTransparentArrayBuffer);

      // 4. Outer Flood-Fill Post-Processing ilə daxili dəlikləri və ağ üzləri 100% bərpa edirik
      const processedBuffer = await postProcessMask(rawTransparentBuffer);
      const base64DataUri = `data:image/png;base64,${processedBuffer.toString("base64")}`;

      // 5. Cloudinary təyin edilibsə yükləyirik
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        const uploadResult = await cloudinary.uploader.upload(base64DataUri, {
          folder: "rubikshop_products_transparent",
          format: "png",
        });

        return NextResponse.json({
          success: true,
          transparentUrl: uploadResult.secure_url,
          method: "AI (BiRefNet + FloodFill)",
        });
      } else {
        return NextResponse.json({
          success: true,
          transparentUrl: base64DataUri,
          method: "AI (BiRefNet + FloodFill) - Base64 Data URI",
        });
      }
    } catch (hfErr: any) {
      console.warn("Hugging Face bağlantı xətası:", hfErr);
      return NextResponse.json(
        {
          error: "Hugging Face AI serverinə qoşulmaq münkün olmadı. Brauzer daxili intellektual modula keçid edilir...",
          use_fallback: true,
        },
        { status: 200 }
      );
    }
  } catch (err: any) {
    console.error("Fon silmə ümumi xətası:", err);
    return NextResponse.json(
      {
        error: err.message || "Gözlənilməz xəta baş verdi.",
        use_fallback: true,
      },
      { status: 200 }
    );
  }
}
