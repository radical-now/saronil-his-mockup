const { chromium } = require('playwright');

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to http://localhost:8080/#registration...");
    await page.goto('http://localhost:8080/#registration', { waitUntil: 'networkidle' });

    console.log("Filling non-existing mobile number '9999999999'...");
    await page.fill('#gate-search-input', '9999999999');
    
    console.log("Clicking Check Registry...");
    await page.click('button:has-text("Check Registry")');
    await page.waitForTimeout(2000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("Full body text after non-existing lookup:\n", bodyText);

  } catch (err) {
    console.error("Automation error:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

main();
