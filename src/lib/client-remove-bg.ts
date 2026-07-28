/**
 * Client-side Smart Edge-Connected Flood Fill Background Removal.
 * Starts from outer borders and floods inward along matching background pixels.
 * STOPS at product borders (e.g., black lines, colored plastic), preserving internal
 * white faces (such as Rubik's cube white sides) completely intact!
 */
export async function removeBackgroundClient(
  imageUrl: string,
  tolerance: number = 35
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

        // Sample 4 corners to determine background color
        const corners = [
          0, // Top-Left
          (width - 1) * 4, // Top-Right
          (height - 1) * width * 4, // Bottom-Left
          ((height - 1) * width + (width - 1)) * 4, // Bottom-Right
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

        // Helper function to test if pixel (r,g,b) matches background
        const isBackground = (r: number, g: number, b: number): boolean => {
          const diffR = Math.abs(r - bgR);
          const diffG = Math.abs(g - bgG);
          const diffB = Math.abs(b - bgB);
          const maxDiff = Math.max(diffR, diffG, diffB);

          // Near background color OR studio white/light gray
          if (maxDiff <= tolerance) return true;
          if (bgR >= 210 && bgG >= 210 && bgB >= 210 && r >= 235 && g >= 235 && b >= 235) {
            return true;
          }
          return false;
        };

        const totalPixels = width * height;
        const visited = new Uint8Array(totalPixels);
        const queue: number[] = [];

        // Add all border pixels to queue (top, bottom, left, right)
        for (let x = 0; x < width; x++) {
          // Top row (y = 0)
          queue.push(x); // index = 0 * width + x
          // Bottom row (y = height - 1)
          queue.push((height - 1) * width + x);
        }
        for (let y = 1; y < height - 1; y++) {
          // Left col (x = 0)
          queue.push(y * width);
          // Right col (x = width - 1)
          queue.push(y * width + (width - 1));
        }

        let head = 0;
        while (head < queue.length) {
          const pixelIndex = queue[head++];
          if (visited[pixelIndex]) continue;
          visited[pixelIndex] = 1;

          const dataIdx = pixelIndex * 4;
          const r = data[dataIdx];
          const g = data[dataIdx + 1];
          const b = data[dataIdx + 2];

          if (isBackground(r, g, b)) {
            // Make background pixel transparent
            data[dataIdx + 3] = 0;

            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            // Enqueue 4 neighbors
            if (x > 0 && !visited[pixelIndex - 1]) queue.push(pixelIndex - 1);
            if (x < width - 1 && !visited[pixelIndex + 1]) queue.push(pixelIndex + 1);
            if (y > 0 && !visited[pixelIndex - width]) queue.push(pixelIndex - width);
            if (y < height - 1 && !visited[pixelIndex + width]) queue.push(pixelIndex + width);
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
