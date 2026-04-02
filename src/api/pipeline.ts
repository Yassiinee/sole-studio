import { removeBackground } from "@imgly/background-removal";

/**
 * Exact-Detail Studio Pipeline
 * Removes the background of the image and uses Canvas composition
 * to render a 4K-style grey sweep background with a natural drop shadow.
 */
export async function processStudioImage(
  dataUrl: string,
  bgColor: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  onProgress?.("Downloading WASM models (first load takes a moment)...");
  
  // Convert Data URL to Blob for @imgly
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  onProgress?.("Surgically extracting shoe via AI...");
  
  // We use the default unpkg WASM resolution and default model
  const transparentBlob = await removeBackground(blob, {
    output: { format: "image/png", quality: 1 },
    progress: (key, current, total) => {
      if (key === "compute:inference") {
        onProgress?.(`Processing image pixels...`);
      }
    }
  });

  onProgress?.("Compositing flawless studio background...");
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(transparentBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement("canvas");
      // Add padding around the shoe to give it that airy studio catalog look
      const paddingX = Math.floor(img.width * 0.15);
      const paddingY = Math.floor(img.height * 0.15);
      
      canvas.width = img.width + paddingX * 2;
      canvas.height = img.height + paddingY * 2;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Wait, canvas rendering is not supported on this browser."));
      
      // 1. Draw solid background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // (Optional) Draw subtle studio sweep gradient overlay (white to transparent to black overlay)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "rgba(255,255,255,0.4)"); 
      grad.addColorStop(0.5, "rgba(255,255,255,0)"); 
      grad.addColorStop(1, "rgba(0,0,0,0.1)"); 
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 2. Draw realistic physics-based drop shadow
      ctx.save();
      // Render shadow by drawing the shoe but with drop-shadow effects
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = Math.min(img.width, img.height) * 0.05;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.min(img.width, img.height) * 0.08; 
      
      // Apply shadow pass
      ctx.drawImage(img, paddingX, paddingY);
      ctx.restore();
      
      // 3. Draw the exact, pixel-perfect shoe cleanly over the shadow
      ctx.drawImage(img, paddingX, paddingY);
      
      // Resolve as high-quality JPEG to emulate a real photo export
      const finalImage = canvas.toDataURL("image/jpeg", 0.95);
      resolve(finalImage);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Engine failed to draw processed image."));
    };
    
    img.src = url;
  });
}
