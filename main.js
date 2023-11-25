const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const sleep = require("./sleep.js");

var page_url = "https://sou.bncollege.com/course-material/course-finder";


async function selectDepartment(page) {
  try {
    // department dropdown
    const departmentDropdown = await page.$(
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(2) > div.bned-select-item.js-bned-select-item.department > div > div > select"
    );

    await departmentDropdown.focus();

    await page.keyboard.press("ArrowDown");  
    await page.keyboard.press("Enter");

    // // Use the down arrow key to navigate through the options and select them
    // for (let i = 0; i < 55; i++) {
    //   await page.keyboard.press("Enter");
    //   await page.keyboard.press("ArrowDown"); // Move down one option
    //   await page.keyboard.press("Enter"); // Select the current option
    // }
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
    // term dropdown
    await page.click(
      "div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
    );

    // select term
    await page.waitForSelector(
      "li.select2-results__option.select2-results__option--highlighted"
    );
    await page.click(
      "li.select2-results__option.select2-results__option--highlighted"
    );

    for (let i = 0; i < 55; i++) {
      await selectDepartment(page);
      // await selectCourse(page);
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
