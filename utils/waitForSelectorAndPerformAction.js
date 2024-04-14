async function waitForSelectorAndPerformAction(page, selector, action, timeOutDelay = 0) {
  // await page.waitForSelector(selector, {visible: true});
  // await page.waitForTimeout(timeOutDelay);

  if (action === 'click') {
      await page.click(selector);
  } else if (action === 'getText') {
      const elementText = await page.$eval(selector, (element) => element.textContent).trim();
      return elementText;
  }
}

module.exports = { 
  waitForSelectorAndPerformAction 
};