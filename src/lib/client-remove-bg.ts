/**
 * Client-side Neural AI Background Removal Engine using @imgly/background-removal.
 * Dynamically imported on the client side to avoid Next.js SSR build bundling issues with ONNX WASM.
 */
export async function removeBackgroundClient(
  imageUrl: string,
  _tolerance: number = 30
): Promise<string> {
  try {
    if (typeof window === "undefined") {
      throw new Error("Fon silmə yalnız brauzerdə dəstəklənir.");
    }

    // Dynamic client-side import of @imgly/background-removal
    const { removeBackground } = await import("@imgly/background-removal");

    let targetSrc = imageUrl;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      targetSrc = `/api/admin/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }

    const blob = await removeBackground(targetSrc, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          console.log(`[AI Model] ${key}: ${Math.round((current / total) * 100)}%`);
        }
      },
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Şəkil konvertasiyası alınmadı."));
        }
      };
      reader.onerror = () => reject(new Error("Şəkil oxunarkən xəta baş verdi."));
      reader.readAsDataURL(blob);
    });
  } catch (err: any) {
    console.error("Client background removal error:", err);
    throw new Error(err?.message || "AI Fon Silmə zamanı xəta baş verdi.");
  }
}
