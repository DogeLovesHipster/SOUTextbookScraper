/**
 * Waits for a selector to be available and performs an action on it.
 *
 * @param {Page} page - The Puppeteer page object.
 * @param {string} selector - The CSS selector of the element to wait for.
 * @param {string} action - The action to perform on the element ('click' or 'getText').
 * @returns {Promise<string|undefined>} - The text content of the element if action is 'getText', otherwise undefined.
 * @throws {Error} - If the element is not visible.
 */

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

