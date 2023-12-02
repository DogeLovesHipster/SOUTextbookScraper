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