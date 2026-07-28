/**
 * Client-side Background Removal Fallback.
 * Performs clean background transparency mapping with smooth antialiased edges.
 * Does not perform destructive flood-filling or hard binarization on white product parts.
 */
export async function removeBackgroundClient(
  imageUrl: string,
  tolerance: number = 30
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

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
        const totalPixels = width * height;

        // Sample 4 corners to estimate outer background color
        const corners = [
          0,
          (width - 1) * 4,
          (height - 1) * width * 4,
          ((height - 1) * width + (width - 1)) * 4,
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        // Smooth alpha feathering based on distance to background color
        const maxDist = Math.max(1, tolerance * 2.2);

        for (let i = 0; i < totalPixels; i++) {
          const idx = i * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);

          if (dist <= tolerance) {
            // Pure background -> transparent
            data[idx + 3] = 0;
          } else if (dist <= maxDist) {
            // Smooth edge transition (antialiasing)
            const alphaFactor = (dist - tolerance) / (maxDist - tolerance);
            data[idx + 3] = Math.round(alphaFactor * 255);
          }
          // Otherwise, product pixels remain completely untouched (Alpha = 255)
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
