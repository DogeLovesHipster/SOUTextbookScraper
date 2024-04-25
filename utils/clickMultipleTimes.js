/**
 * Clicks on a specified selector multiple times with an optional delay between each click.
 *
 * @param {Page} page - The Puppeteer page object.
 * @param {string} selector - The CSS selector to click on.
 * @param {number} times - The number of times to click on the selector.
 * @param {number} [delayMs] - Optional delay in milliseconds between each click.
 * @returns {Promise<void>} - A Promise that resolves when all clicks are completed.
 */
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