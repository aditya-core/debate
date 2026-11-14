// node shot.mjs <url> <out.png> [width] [height] [clickText] [dark|light]
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const [url, out, w = "1440", h = "900", clickText = "", theme = "dark"] = process.argv.slice(2);
const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
  defaultViewport: { width: Number(w), height: Number(h), deviceScaleFactor: 2 },
});
const page = await browser.newPage();
// Headless Chromium throttles CSS animations on a backgrounded page, which pins
// entrance animations at their first frame. Reduced motion lands them settled —
// the same state a motion-sensitive learner sees.
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.goto(url, { waitUntil: "load" });
await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
await new Promise((r) => setTimeout(r, 900));
if (clickText) {
  await page.evaluate((txt) => {
    const el = [...document.querySelectorAll("button, a")].find((n) => n.textContent?.includes(txt));
    el?.click();
  }, clickText);
  await new Promise((r) => setTimeout(r, 900));
}
// fixed thumb bars would print at their scroll position mid-page
await page.evaluate(() => {
  document.querySelectorAll("nav.fixed").forEach((n) => (n.style.position = "static"));
});
await page.screenshot({ path: out, fullPage: true });
console.log("saved", out);
await browser.close();
