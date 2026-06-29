import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { getCorsHeaders } from "./cors.ts";

Deno.test("getCorsHeaders allows exact app match", () => {
  Deno.env.set("APP_BASE_URL", "https://rc-crm.vibepreview.com");
  const headers = getCorsHeaders("https://rc-crm.vibepreview.com");
  assertEquals(headers["Access-Control-Allow-Origin"], "https://rc-crm.vibepreview.com");
});

Deno.test("getCorsHeaders allows subdomains", () => {
  Deno.env.set("APP_BASE_URL", "https://rc-crm.vibepreview.com");
  const headers = getCorsHeaders("https://rc-v03.vibepreview.com");
  assertEquals(headers["Access-Control-Allow-Origin"], "https://rc-v03.vibepreview.com");
});

Deno.test("getCorsHeaders allows localhost", () => {
  Deno.env.set("APP_BASE_URL", "https://rc-crm.vibepreview.com");
  const headers = getCorsHeaders("http://localhost:3000");
  assertEquals(headers["Access-Control-Allow-Origin"], "http://localhost:3000");
});

Deno.test("getCorsHeaders defaults to app base url for unknown origins", () => {
  Deno.env.set("APP_BASE_URL", "https://rc-crm.vibepreview.com");
  const headers = getCorsHeaders("https://malicious.com");
  assertEquals(headers["Access-Control-Allow-Origin"], "https://rc-crm.vibepreview.com");
});
