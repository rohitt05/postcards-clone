import { postcards, Postcard } from "@/data/postcards";

export interface PostcardPayload {
  cardId: string;
  message: string;
  senderName: string;
  image: string | null; // compressed base64 data URL or null
}

/**
 * Compress an image data-URL to a smaller JPEG base64 string.
 * Max width/height: 800px, quality: 0.65
 */
export async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.65));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Encode payload → URL-safe base64 string */
export function encodePayload(payload: PostcardPayload): string {
  const json = JSON.stringify(payload);
  // btoa needs latin1 — use encodeURIComponent trick for unicode
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/** Decode URL-safe base64 string → payload */
export function decodePayload(encoded: string): PostcardPayload | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as PostcardPayload;
  } catch {
    return null;
  }
}

/** Look up a Postcard by id */
export function getCardById(id: string): Postcard | undefined {
  return postcards.find((c) => c.id === id);
}
