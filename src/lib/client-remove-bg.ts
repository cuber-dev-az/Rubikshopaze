/**
 * Client-side Sobel Edge-Barrier Background Removal.
 * Uses Sobel gradient analysis + border flood-fill.
 * Stops dead at any object boundary/rim, completely protecting white product
 * faces (such as white plastic Rubik's cubes or white spherical keychains).
 */
export async function removeBackgroundClient(
  imageUrl: string,
  tolerance: number = 25
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

        // 1. Calculate border background color (sample 5px outer ring)
        let sumR = 0, sumG = 0, sumB = 0, samples = 0;
        const margin = Math.max(2, Math.min(8, Math.floor(Math.min(width, height) * 0.015)));

        for (let x = 0; x < width; x++) {
          for (let y = 0; y < margin; y++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = ((height - 1 - y) * width + x) * 4;
            sumR += data[idx1] + data[idx2];
            sumG += data[idx1 + 1] + data[idx2 + 1];
            sumB += data[idx1 + 2] + data[idx2 + 2];
            samples += 2;
          }
        }
        for (let y = margin; y < height - margin; y++) {
          for (let x = 0; x < margin; x++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = (y * width + (width - 1 - x)) * 4;
            sumR += data[idx1] + data[idx2];
            sumG += data[idx1 + 1] + data[idx2 + 1];
            sumB += data[idx1 + 2] + data[idx2 + 2];
            samples += 2;
          }
        }

        const bgR = samples > 0 ? Math.round(sumR / samples) : 255;
        const bgG = samples > 0 ? Math.round(sumG / samples) : 255;
        const bgB = samples > 0 ? Math.round(sumB / samples) : 255;

        // 2. Compute Sobel Edge Magnitude for every pixel
        const lum = new Float32Array(totalPixels);
        for (let i = 0; i < totalPixels; i++) {
          const p = i * 4;
          lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
        }

        const edgeMap = new Float32Array(totalPixels);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const gx =
              -lum[idx - width - 1] + lum[idx - width + 1]
              - 2 * lum[idx - 1] + 2 * lum[idx + 1]
              - lum[idx + width - 1] + lum[idx + width + 1];
            const gy =
              -lum[idx - width - 1] - 2 * lum[idx - width] - lum[idx - width + 1]
              + lum[idx + width - 1] + 2 * lum[idx + width] + lum[idx + width + 1];

            edgeMap[idx] = Math.sqrt(gx * gx + gy * gy);
          }
        }

        // 3. Flood Fill from Outer Edges
        const visited = new Uint8Array(totalPixels);
        const alphaMap = new Uint8Array(totalPixels);
        alphaMap.fill(255); // Default all pixels to 100% opaque (protect product completely!)

        const queue: number[] = [];

        // Enqueue 1px border
        for (let x = 0; x < width; x++) {
          queue.push(x);
          queue.push((height - 1) * width + x);
        }
        for (let y = 1; y < height - 1; y++) {
          queue.push(y * width);
          queue.push(y * width + (width - 1));
        }

        const EDGE_BARRIER_THRESHOLD = 18; // Any edge gradient >= 18 blocks the flood fill
        const COLOR_TOLERANCE = Math.max(16, tolerance);

        let head = 0;
        while (head < queue.length) {
          const idx = queue[head++];
          if (visited[idx]) continue;
          visited[idx] = 1;

          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];

          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);

          if (dist <= COLOR_TOLERANCE && edgeMap[idx] < EDGE_BARRIER_THRESHOLD) {
            alphaMap[idx] = 0; // Pure background

            const x = idx % width;
            const y = Math.floor(idx / width);

            if (x > 0 && !visited[idx - 1]) queue.push(idx - 1);
            if (x < width - 1 && !visited[idx + 1]) queue.push(idx + 1);
            if (y > 0 && !visited[idx - width]) queue.push(idx - width);
            if (y < height - 1 && !visited[idx + width]) queue.push(idx + width);
          }
        }

        // 4. Smooth Edge Feathering (1px anti-aliasing around transparent border)
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (alphaMap[idx] === 255) {
              if (
                alphaMap[idx - 1] === 0 ||
                alphaMap[idx + 1] === 0 ||
                alphaMap[idx - width] === 0 ||
                alphaMap[idx + width] === 0
              ) {
                const p = idx * 4;
                const dr = data[p] - bgR;
                const dg = data[p + 1] - bgG;
                const db = data[p + 2] - bgB;
                const dist = Math.sqrt(dr * dr + dg * dg + db * db);

                if (dist <= COLOR_TOLERANCE + 15) {
                  alphaMap[idx] = 128;
                }
              }
            }
          }
        }

        // 5. Apply Alpha Map to Image Data
        for (let i = 0; i < totalPixels; i++) {
          data[i * 4 + 3] = alphaMap[i];
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
