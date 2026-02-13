import { test, expect } from "@playwright/test";

test("health: MCP endpoint", async ({ request }) => {
  const res = await request.get("/api/mcp");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBeTruthy();
});

