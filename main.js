const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

var page_url = "https://sou.bncollege.com/course-material/course-finder";

async function selectTerm(page, term) {

  try {
  if (term == "F23") {
    // select term [Fall 2023]
    await page.waitForSelector(
      "div:nth-child(2) > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
    );
    await page.click(
      "div:nth-child(2) > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
    );
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await page.click("body");

    for (let selectionBox = "3"; selectionBox < "6"; selectionBox++) {
      await page.waitForSelector(
        "div:nth-child(" + selectionBox + ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
      );
      await page.click(
        "div:nth-child(" + selectionBox + ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
      );
      await page.keyboard.press("Enter");
      await page.click("body");
    }
  } else if (term == "W24") {
    console.log("W24");
  }
  return page;

} catch (error) {
  console.error("Error with selectTerm function:", error);
  return null;
  }
}

async function selectDepartment(page) {
  try {
    // department dropdown
    const departmentDropdown = await page.$(
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(2) > div.bned-select-item.js-bned-select-item.department > div > div > select"
    );

    await departmentDropdown.focus();
    await page.keyboard.press("ArrowDown");  
    await page.keyboard.press("Enter");

    return page;

  } catch (error) {
    console.error("Error with selectDepartment fucntion:", error);
    return null;
  }
}

async function selectCourse(page) {
  try {

    const courseDropdown = await page.$(
      "div.bned-select-item.js-bned-select-item.course > div > div > span > span.selection > span"
    );

    await courseDropdown.focus();
    await page.keyboard.press("ArrowDown");  
    await page.keyboard.press("Enter");

  } catch (error) {
    console.error("Error with selectCourse function:", error);
  }
}

async function createPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });
  var page = await browser.newPage();

  return page;
}

async function gotoPage(page) {
  await page.goto(page_url);
}

async function selectionPage(page) {
  try {

    selectTerm(page, "F23");

    // Get the number of department options
    const departmentOptions = await page.$$eval(
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(2) > div.bned-select-item.js-bned-select-item.department > div > div > select > option",
      (options) => options.length
    );

    for (let departmentIndex = 0; departmentIndex < departmentOptions; departmentIndex++) {
      
      await selectDepartment(page);
    }

  } catch (error) {
    console.error("Error with selectionPage function:", error);
  }
}

async function main() {
  var page = await createPage();
  await gotoPage(page);
  await selectionPage(page);
}

main();
