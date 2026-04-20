/**
 * AES-256-GCM client-side encryption.
 * The decryption key is NEVER sent to the server — it lives only in the URL hash.
 * Even if the Supabase database is compromised, messages are unreadable without the key.
 */

function b64encode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function b64decode(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

export interface EncryptedMessage {
  ciphertext: string; // base64url
  iv: string;         // base64url
}

/**
 * Encrypt a plaintext string.
 * Returns { ciphertext, iv } to store in DB, and key (base64url) to put in URL hash.
 */
export async function encryptMessage(
  plaintext: string
): Promise<{ encrypted: EncryptedMessage; key: string }> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const ivBuffer = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivBuffer },
    key,
    encoded
  );

  const rawKey = await crypto.subtle.exportKey("raw", key);

  return {
    encrypted: {
      ciphertext: b64encode(cipherBuf),
      iv: b64encode(ivBuffer),
    },
    key: b64encode(rawKey),
  };
}

/**
 * Decrypt a message using the key from the URL hash.
 * Returns null if decryption fails (wrong key, tampered data, etc.)
 */
export async function decryptMessage(
  encrypted: EncryptedMessage,
  keyB64: string
): Promise<string | null> {
  try {
    const keyBuf = b64decode(keyB64);
    const ivBuf = b64decode(encrypted.iv);
    const ctBuf = b64decode(encrypted.ciphertext);

    const key = await crypto.subtle.importKey(
      "raw",
      keyBuf,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuf },
      key,
      ctBuf
    );

    return new TextDecoder().decode(plainBuf);
  } catch {
    return null;
  }
}
