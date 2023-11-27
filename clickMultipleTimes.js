async function clickMultipleTimes(page, selector, times, delayMs) {
    for (let i = 0; i < times; i++) {
      await page.waitForSelector(selector);
      await page.click(selector);
      if (delayMs) {
        await page.waitForTimeout(delayMs);
      }
    }
  }
  
  module.exports = {
    clickMultipleTimes,
  };