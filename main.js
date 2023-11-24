const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

var page_url = "https://sou.bncollege.com/course-material/course-finder";

async function selectCourse(page, course) {
  try {
    await page.waitForSelector('div.bned-select-item.js-bned-select-item.department > div > div > span > span.selection > span > span.select2-selection__arrow', { visible: true });
    await page.click('div.bned-select-item.js-bned-select-item.department > div > div > span > span.selection > span > span.select2-selection__arrow');

    await page.waitForSelector(`li.select2-results__option[data-select2-id*="${course}"]`, { visible: true });

    await page.click(`li.select2-results__option[data-select2-id*="${course}"]`);
  } catch (error) {
    console.error(`Error selecting course ${course}: ${error}`);
  }
}

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

    // All current courses. If more courses are added, then the course list can be handled differently
    const coursesToSelect = ['ART', 'ARTH', 'ASL', 'BA', 'BI', 'CCL', 'CH', 'COMM', 'COUN', 'CS', 'CW', 'D', 'DCIN', 'EC', 'ECE', 'ED', 'EE', 'EMDA', 'ENG', 'ERS', 'ES', 'GSWS', 'HCA', 'HE', 'HON', 'HST', 'INL', 'IS', 'LEAD', 'LIS', 'MAT', 'MBA', 'MS', 'MTH', 'MUP', 'MUS', 'NAS', 'OAL', 'PE', 'PEA', 'PH', 'PHL', 'PS', 'PSY', 'READ', 'SAS', 'SC', 'SHS', 'SOAN', 'SPAN', 'SPED', 'STAT', 'TA', 'UGS', 'WR'];

    // term dropdown
    await page.click('div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span');

    // select term
    await page.waitForSelector('li.select2-results__option.select2-results__option--highlighted');
    await page.click('li.select2-results__option.select2-results__option--highlighted');

    for (const course of coursesToSelect) {      

      // department dropdown arrow
      await page.waitForSelector('div.bned-select-item.js-bned-select-item.department > div > div > span > span.selection > span > span.select2-selection__arrow');
      await page.click('div.bned-select-item.js-bned-select-item.department > div > div > span > span.selection > span > span.select2-selection__arrow');  

      console.log(course);
      await selectCourse(page, course);
      console.log("course selected: ", course);

        
    }
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