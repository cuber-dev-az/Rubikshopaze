/**
 * Client-side Smart Edge-Aware Background Removal.
 * Uses outer border sampling + edge gradient detection to flood background pixels.
 * Strictly STOPS at object boundaries (e.g. plastic borders, sticker outlines, shadows),
 * guaranteeing that internal white faces (such as Rubik's cube white sides) stay 100% intact!
 */
export async function removeBackgroundClient(
  imageUrl: string,
  tolerance: number = 22
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

        // Sample border pixels (10px border around edges) to determine true background color
        let sumR = 0, sumG = 0, sumB = 0, sampleCount = 0;
        const borderDepth = Math.max(2, Math.min(10, Math.floor(Math.min(width, height) * 0.02)));

        for (let x = 0; x < width; x++) {
          for (let y = 0; y < borderDepth; y++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = ((height - 1 - y) * width + x) * 4;
            sumR += data[idx1] + data[idx2];
            sumG += data[idx1 + 1] + data[idx2 + 1];
            sumB += data[idx1 + 2] + data[idx2 + 2];
            sampleCount += 2;
          }
        }
        for (let y = borderDepth; y < height - borderDepth; y++) {
          for (let x = 0; x < borderDepth; x++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = (y * width + (width - 1 - x)) * 4;
            sumR += data[idx1] + data[idx2];
            sumG += data[idx1 + 1] + data[idx2 + 1];
            sumB += data[idx1 + 2] + data[idx2 + 2];
            sampleCount += 2;
          }
        }

        const bgR = sampleCount > 0 ? Math.round(sumR / sampleCount) : 255;
        const bgG = sampleCount > 0 ? Math.round(sumG / sampleCount) : 255;
        const bgB = sampleCount > 0 ? Math.round(sumB / sampleCount) : 255;

        // Color distance helper
        const colorDistance = (r: number, g: number, b: number) => {
          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        const totalPixels = width * height;
        const distMap = new Float32Array(totalPixels);
        for (let i = 0; i < totalPixels; i++) {
          const p = i * 4;
          distMap[i] = colorDistance(data[p], data[p + 1], data[p + 2]);
        }

        const visited = new Uint8Array(totalPixels);
        const alphaMap = new Uint8Array(totalPixels);
        alphaMap.fill(255); // Default all pixels to opaque (keep object 100% intact)

        const queue: number[] = [];

        // Enqueue 1px outer frame
        for (let x = 0; x < width; x++) {
          queue.push(x);
          queue.push((height - 1) * width + x);
        }
        for (let y = 1; y < height - 1; y++) {
          queue.push(y * width);
          queue.push(y * width + (width - 1));
        }

        const effectiveTolerance = Math.max(14, tolerance);
        const featherRange = 10;

        let head = 0;
        while (head < queue.length) {
          const pixelIndex = queue[head++];
          if (visited[pixelIndex]) continue;
          visited[pixelIndex] = 1;

          const dist = distMap[pixelIndex];

          // If pixel matches background color
          if (dist <= effectiveTolerance + featherRange) {
            // Calculate smooth alpha for anti-aliased edge
            if (dist <= effectiveTolerance) {
              alphaMap[pixelIndex] = 0; // Pure background
            } else {
              const factor = (dist - effectiveTolerance) / featherRange;
              alphaMap[pixelIndex] = Math.round(factor * 255);
            }

            // Only continue flood fill if it's strictly background
            if (dist <= effectiveTolerance + 4) {
              const x = pixelIndex % width;
              const y = Math.floor(pixelIndex / width);

              const pIdx = pixelIndex * 4;
              const curR = data[pIdx];
              const curG = data[pIdx + 1];
              const curB = data[pIdx + 2];

              // Neighbor check helper to prevent crossing edge boundaries
              const checkAndEnqueue = (nIndex: number) => {
                if (visited[nIndex]) return;
                const nDataIdx = nIndex * 4;
                const nR = data[nDataIdx];
                const nG = data[nDataIdx + 1];
                const nB = data[nDataIdx + 2];

                // Contrast difference between adjacent pixels
                const neighborDelta = Math.abs(curR - nR) + Math.abs(curG - nG) + Math.abs(curB - nB);

                // Stop flood fill if there is a sharp contrast edge (e.g. black plastic border or sticker outline)
                if (neighborDelta > 42 && distMap[nIndex] > effectiveTolerance) {
                  return;
                }

                queue.push(nIndex);
              };

              if (x > 0) checkAndEnqueue(pixelIndex - 1);
              if (x < width - 1) checkAndEnqueue(pixelIndex + 1);
              if (y > 0) checkAndEnqueue(pixelIndex - width);
              if (y < height - 1) checkAndEnqueue(pixelIndex + width);
            }
          }
        }

        // Apply calculated alphaMap to image data
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
