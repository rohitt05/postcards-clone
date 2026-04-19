import { postcards, Postcard } from "@/data/postcards";

export interface PostcardPayload {
  cardId: string;
  message: string;
  senderName: string;
  image: string | null;
}

/**
 * Compress image to max 320px wide, JPEG at 40% quality.
 * This keeps the base64 output under ~30KB for most photos,
 * preventing 431 Request Header Fields Too Large errors.
 */
export async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 320;
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
      resolve(canvas.toDataURL("image/jpeg", 0.4));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Encode payload → URL-safe base64 string */
export function encodePayload(payload: PostcardPayload): string {
  const json = JSON.stringify(payload);
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
