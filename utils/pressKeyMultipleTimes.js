/**
 * Presses a key multiple times on a given page.
 *
 * @param {Page} page - The page to press the key on.
 * @param {string} key - The key to press.
 * @param {number} times - The number of times to press the key.
 * @param {number} delayMs - The delay in milliseconds between each key press.
 * @returns {Promise<void>} - A promise that resolves when all key presses are completed.
 */
async function pressKeyMultipleTimes(page, key, times, delayMs) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    if (delayMs) {
      await page.waitForTimeout(delayMs);
    }
  }
}

module.exports = {
  pressKeyMultipleTimes,
};