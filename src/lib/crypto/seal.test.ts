import { describe, expect, test } from "vitest";
import { sealString, unsealString, sha256Hex } from "@/lib/crypto/seal";

describe("seal", () => {
  test("seal/unseal roundtrip", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test_anon_key";
    process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef";
    const sealed = sealString("hello");
    expect(sealed.startsWith("v1:")).toBe(true);
    expect(unsealString(sealed)).toBe("hello");
  });

  test("sha256Hex is stable", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

