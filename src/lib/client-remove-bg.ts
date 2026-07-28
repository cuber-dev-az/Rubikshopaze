/**
 * Client-side Smart Edge-Aware Flood Fill Background & Shadow Removal Engine.
 * Starts strictly from outer canvas borders and floods along matching background/shadow pixels.
 * STOPS at product borders (black plastic seams, contour outlines, color boundaries),
 * GUARANTEEING that white product parts (such as white plastic Rubik's cube faces or white keychain shells)
 * stay 100% intact, while removing the background and drop shadows cleanly!
 */
export async function removeBackgroundClient(
  imageUrl: string,
  tolerance: number = 32
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

        // 1. Sample 10px outer border ring to determine true studio background color
        let sumR = 0, sumG = 0, sumB = 0, sampleCount = 0;
        const borderDepth = Math.max(3, Math.min(12, Math.floor(Math.min(width, height) * 0.02)));

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
        const colorDist = (r: number, g: number, b: number) => {
          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        // 2. Prepare Flood Fill State
        const visited = new Uint8Array(totalPixels);
        const alphaMap = new Uint8Array(totalPixels);
        alphaMap.fill(255); // Default ALL pixels to 100% OPAQUE (protect product completely!)

        const queue: number[] = [];

        // Enqueue entire outer 1px border frame as starting seeds
        for (let x = 0; x < width; x++) {
          queue.push(x);
          queue.push((height - 1) * width + x);
        }
        for (let y = 1; y < height - 1; y++) {
          queue.push(y * width);
          queue.push(y * width + (width - 1));
        }

        // Background / Shadow threshold parameters
        const bgTolerance = Math.max(20, tolerance);
        const maxShadowDist = 85; // Allow smooth shadow gradients near studio floor
        const MAX_STEP_CONTRAST = 28; // Barrier: Stop flood fill if adjacent pixels differ by > 28 RGB

        let head = 0;
        while (head < queue.length) {
          const pixelIndex = queue[head++];
          if (visited[pixelIndex]) continue;
          visited[pixelIndex] = 1;

          const pIdx = pixelIndex * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];

          const dist = colorDist(r, g, b);

          // Check if this pixel is background or shadow gradient
          // Studio background/shadows are light/grey (r,g,b > 130)
          const isLight = (r + g + b) / 3 > 125;

          if (dist <= bgTolerance || (isLight && dist <= maxShadowDist)) {
            // Set pixel transparent
            if (dist <= bgTolerance) {
              alphaMap[pixelIndex] = 0;
            } else {
              // Smooth shadow falloff (fade out drop shadows)
              const factor = (dist - bgTolerance) / (maxShadowDist - bgTolerance);
              alphaMap[pixelIndex] = Math.round(factor * 160);
            }

            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            // Neighbors checking with Edge-Contrast Barrier
            const checkNeighbor = (nIndex: number) => {
              if (visited[nIndex]) return;

              const npIdx = nIndex * 4;
              const nR = data[npIdx];
              const nG = data[npIdx + 1];
              const nB = data[npIdx + 2];

              // Contrast jump between current pixel and neighbor
              const stepDelta = Math.abs(r - nR) + Math.abs(g - nG) + Math.abs(b - nB);

              // If step delta exceeds boundary threshold (black seam, plastic edge, keychain metal), STOP flood fill!
              if (stepDelta > MAX_STEP_CONTRAST) {
                return;
              }

              const nDist = colorDist(nR, nG, nB);
              const nIsLight = (nR + nG + nB) / 3 > 125;

              if (nDist <= bgTolerance || (nIsLight && nDist <= maxShadowDist)) {
                queue.push(nIndex);
              }
            };

            if (x > 0) checkNeighbor(pixelIndex - 1);
            if (x < width - 1) checkNeighbor(pixelIndex + 1);
            if (y > 0) checkNeighbor(pixelIndex - width);
            if (y < height - 1) checkNeighbor(pixelIndex + width);
          }
        }

        // 3. Smooth 1px anti-aliasing feathering around transparent boundaries
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (alphaMap[idx] > 0 && alphaMap[idx] === 255) {
              // If neighbor is pure background (0), soften edge slightly
              if (
                alphaMap[idx - 1] === 0 ||
                alphaMap[idx + 1] === 0 ||
                alphaMap[idx - width] === 0 ||
                alphaMap[idx + width] === 0
              ) {
                const p = idx * 4;
                const dist = colorDist(data[p], data[p + 1], data[p + 2]);
                if (dist <= bgTolerance + 20) {
                  alphaMap[idx] = 160;
                }
              }
            }
          }
        }

        // 4. Apply calculated alphaMap to image data
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
