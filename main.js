const fs = require("path");
const path = require("path");
const puppeteer = require("puppeteer");

var page_url = "https://sou.bncollege.com/course-material/course-finder";

async function createPage() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    var page = await browser.newPage();

    return page;
}

async function gotoPage(page) {
    await page.goto(page_url);
}

async function selectionPage(page) {

    await page.click("div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span");

    // await page.keyboard.press("ArrowDown");

    await page.keyboard.press("Enter");

}

// Testing of infinite loop on "Add Another Course" button

// async function deathLoop(page) {
//     while (true) {
//         await page.click("body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-block-actions > a.js-bned-new-course.btn.btn-secondary.btn-block > div.bned-btn-text");
//     }
// }

async function main() {
    var page = await createPage();
    await gotoPage(page);
    // await deathLoop(page);
    selectionPage(page);
}

main();