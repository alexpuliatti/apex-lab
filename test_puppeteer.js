const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:8080/zine.html?v=8', { waitUntil: 'networkidle0' });
  
  // Wait a moment for graph to initialize
  await new Promise(r => setTimeout(r, 2000));
  
  const globals = await page.evaluate(() => {
    return {
      graphElementExists: !!document.querySelector('canvas')
    };
  });
  console.log('DOM STATE:', globals);
  
  await browser.close();
})();
