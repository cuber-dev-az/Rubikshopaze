import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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

    // 1. Fetch source image
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
          error: "Şəkil adresi brauzer tərəfindən bloklandı və ya mövcud deyil. Brauzer daxili modula keçid edilir...",
          use_fallback: true,
        },
        { status: 200 }
      );
    }

    // 2. Check Hugging Face API Key
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey || hfApiKey.trim() === "") {
      return NextResponse.json(
        {
          error: "HUGGINGFACE_API_KEY təyin edilməyib. Avtomatik olaraq brauzer daxili rejimi işə salınır...",
          use_fallback: true,
        },
        { status: 200 }
      );
    }

    // 3. Request raw background removal from ZhengPeng7/BiRefNet
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
            error: `Hugging Face AI modeli məşğuldur və ya açar yanlışdır (${hfResponse.status}). Brauzer daxili modula keçid edilir...`,
            use_fallback: true,
          },
          { status: 200 }
        );
      }

      const rawTransparentArrayBuffer = await hfResponse.arrayBuffer();
      const rawTransparentBuffer = Buffer.from(rawTransparentArrayBuffer);
      const base64DataUri = `data:image/png;base64,${rawTransparentBuffer.toString("base64")}`;

      // 4. Upload to Cloudinary if configured
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
          method: "AI (BiRefNet HD)",
        });
      } else {
        return NextResponse.json({
          success: true,
          transparentUrl: base64DataUri,
          method: "AI (BiRefNet HD)",
        });
      }
    } catch (hfErr: any) {
      console.warn("Hugging Face bağlantı xətası:", hfErr);
      return NextResponse.json(
        {
          error: "Hugging Face AI serverinə qoşulmaq mümkün olmadı. Brauzer daxili modula keçid edilir...",
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
