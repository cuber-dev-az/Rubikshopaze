/**
 * Client-side Smart Background Removal for Product Photos
 * Auto-detects white/light studio background and turns it 100% transparent PNG.
 */
export async function removeBackgroundClient(
  imageUrl: string,
  tolerance: number = 32
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Use proxy route to bypass CORS restrictions
    const proxyUrl = `/api/admin/proxy-image?url=${encodeURIComponent(imageUrl)}`;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 800;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas konteksti dəstəklənmir."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Sample corner and edge pixels to determine background RGB
        const samplePoints = [
          0, // Top-Left
          (width - 1) * 4, // Top-Right
          (height - 1) * width * 4, // Bottom-Left
          ((height - 1) * width + (width - 1)) * 4, // Bottom-Right
          Math.floor(width / 2) * 4, // Top-Center
          (height - 1) * width * 4 + Math.floor(width / 2) * 4, // Bottom-Center
        ];

        let totalR = 0, totalG = 0, totalB = 0;
        let validSamples = 0;

        samplePoints.forEach((idx) => {
          if (idx < data.length - 3) {
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            validSamples++;
          }
        });

        const bgR = validSamples > 0 ? Math.round(totalR / validSamples) : 255;
        const bgG = validSamples > 0 ? Math.round(totalG / validSamples) : 255;
        const bgB = validSamples > 0 ? Math.round(totalB / validSamples) : 255;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Distance from detected background color
          const diffR = Math.abs(r - bgR);
          const diffG = Math.abs(g - bgG);
          const diffB = Math.abs(b - bgB);
          const dist = Math.max(diffR, diffG, diffB);

          // Near-white studio light check (e.g., RGB > 225)
          const isStudioWhite = r >= 225 && g >= 225 && b >= 225;

          if (dist <= tolerance || isStudioWhite) {
            if (dist <= tolerance / 2 || (r >= 240 && g >= 240 && b >= 240)) {
              data[i + 3] = 0; // Fully transparent
            } else {
              // Smooth edge feathering
              const alphaRatio = (dist - tolerance / 2) / (tolerance / 2);
              data[i + 3] = Math.min(data[i + 3], Math.floor(alphaRatio * 255));
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err: any) {
        reject(new Error("Şəkil emalı zamanı xəta: " + err.message));
      }
    };

    img.onerror = () => {
      reject(new Error("Şəkil yüklənə bilmədi. Lütfən URL-in aktiv olduğunu yoxlayın."));
    };

    img.src = proxyUrl;
  });
}
