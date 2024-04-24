const { sleep } = require("./sleep");

async function waitForSelectorAndPerformAction(page, selector, action) {
  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector);
      const ariaDisabled = element.getAttribute('aria-disabled');
      return element && (ariaDisabled === 'false' || ariaDisabled === null);
    },
    {},
    selector
  );

  if (action === 'click') {
    await page.click(selector);
    // await sleep(1000);
  } else if (action === 'getText') {
    const elementText = await page.$eval(selector, (element) => element.textContent).trim();
    return elementText;
  }
}

module.exports = { 
  waitForSelectorAndPerformAction 
};