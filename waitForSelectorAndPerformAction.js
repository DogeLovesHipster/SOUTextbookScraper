async function waitForSelectorAndPerformAction(page, selector, action) {
    await page.waitForSelector(selector);
  
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