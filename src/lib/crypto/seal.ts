import crypto from "crypto";
import { env } from "@/lib/config/env";

function getKey() {
  const key = env().ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is required");
  const buf = Buffer.from(key, "utf8");
  if (buf.length === 32) return buf;
  return crypto.createHash("sha256").update(buf).digest();
}

export function sealString(plaintext: string) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function unsealString(sealed: string) {
  const [version, ivB64, tagB64, ctB64] = sealed.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !ctB64) throw new Error("Invalid sealed value");
  const key = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function tokenPrefix(token: string, len = 8) {
  return token.slice(0, len);
}

