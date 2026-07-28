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

    // 1. Mənbə şəklini User-Agent başlığı ilə yükləyirik (403 Forbidden qarşısını almaq üçün)
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
          error: `Mənbə şəkil yüklənə bilmədi. Status: ${imageFetchResponse.status} ${imageFetchResponse.statusText}`,
        },
        { status: 400 }
      );
    }

    const imageArrayBuffer = await imageFetchResponse.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    // 2. Hugging Face API key yoxlanılır
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      return NextResponse.json(
        {
          error:
            "HUGGINGFACE_API_KEY mühit dəyişəni tapılmadı. .env faylınızda HUGGINGFACE_API_KEY təyin edin.",
        },
        { status: 500 }
      );
    }

    // 3. Hugging Face briaai/RMBG-2.0 AI modelinə sorğu göndərilir
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-2.0",
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
      return NextResponse.json(
        {
          error: `Hugging Face RMBG-2.0 fon silmə xətası (${hfResponse.status}): ${errorText}`,
        },
        { status: 502 }
      );
    }

    const transparentArrayBuffer = await hfResponse.arrayBuffer();
    const transparentBuffer = Buffer.from(transparentArrayBuffer);
    const base64DataUri = `data:image/png;base64,${transparentBuffer.toString("base64")}`;

    // 4. Cloudinary təyin edilibsə yükləyirik, əks halda Data URL qaytarırıq
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
      });
    } else {
      // Cloudinary ENV təyin edilməyibsə, birbaşa Şəffaf Base64 Data URI qaytarılır
      return NextResponse.json({
        success: true,
        transparentUrl: base64DataUri,
        note: "Cloudinary mühit dəyişənləri təyin edilmədiyi üçün şəkil birbaşa Data URI (Base64) olaraq təqdim edildi.",
      });
    }
  } catch (err: any) {
    console.error("Fon silmə xətası:", err);
    return NextResponse.json(
      { error: err.message || "Bilinməyən xəta baş verdi" },
      { status: 500 }
    );
  }
}
