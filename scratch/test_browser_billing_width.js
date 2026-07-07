const { chromium } = require('playwright');

(async () => {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to http://localhost:8080/#billing...");
  await page.goto('http://localhost:8080/#billing');
  await page.waitForTimeout(1500);

  // 1. Verify grid columns layout widths
  const widths = await page.evaluate(() => {
    const grid = document.querySelector('.dashboard-body-grid');
    if (!grid) return null;
    
    const children = Array.from(grid.children);
    const firstWidth = children[0] ? children[0].getBoundingClientRect().width : 0;
    const secondWidth = children[1] ? children[1].getBoundingClientRect().width : 0;

    return { firstWidth, secondWidth };
  });

  console.log("Grid Column Widths in DOM:", JSON.stringify(widths));

  if (!widths) {
    console.error("❌ FAILED: .dashboard-body-grid not found.");
    process.exit(1);
  }

  // Expect second column width to be around 21% of the total width
  const total = widths.firstWidth + widths.secondWidth;
  const secondRatio = widths.secondWidth / total;
  console.log("Second column ratio:", secondRatio);

  if (secondRatio >= 0.18 && secondRatio <= 0.23) {
    console.log("✅ SUCCESS: The second column width is successfully reduced by 40% (occupying ~21% of grid total)!");
  } else {
    console.error("❌ FAILED: The second column width ratio is incorrect. Expected ~0.21, got:", secondRatio);
    process.exit(1);
  }

  await browser.close();
  console.log("\nFinished billing layout width verification.");
})();
