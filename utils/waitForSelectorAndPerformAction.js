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

  // Check if the element is in the viewport
  const element = await page.$(selector);
  const bounding_box = await element.boundingBox();

  if (bounding_box !== null) {
    if (action === 'click') {
      await page.click(selector);
      // await sleep(1000);
    } else if (action === 'getText') {
      const elementText = await page.$eval(selector, (element) => element.textContent).trim();
      return elementText;
    }
  } else {
    throw new Error(`Element ${selector} is not visible`);
  }
}

module.exports = { 
  waitForSelectorAndPerformAction 
};

