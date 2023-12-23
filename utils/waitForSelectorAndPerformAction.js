async function waitForSelectorAndPerformAction(page, selector, action, delay = 0) {
  await page.waitForSelector(selector);
  await page.waitForTimeout(delay);

  if (action === 'click') {
      await page.click(selector);
  } else if (action === 'getText') {
      const elementText = await page.$eval(selector, (element) => element.textContent);
      return elementText;
  }
}

module.exports = { 
  waitForSelectorAndPerformAction 
};