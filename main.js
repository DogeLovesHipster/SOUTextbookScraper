const { pressKeyMultipleTimes } = require("./pressKeyMultipleTimes");
const { clickMultipleTimes } = require("./clickMultipleTimes");
const { sleep } = require("./sleep");

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

// const rootPath = path.join(__dirname, "..");
// const filePath = path.join(rootPath, "csv_files", "souTextbooksList.csv");

// 55 courses total
// ART has 15 courses
// ART has a total of 18 sections for all courses

// !!Instead of overloading the page with 1000 entries, get one department's info, then refresh and start over with the next department!!

const page_url = "https://sou.bncollege.com/course-material/course-finder";

const dropdownSelector =
"ul.select2-results__options li.select2-results__option";

const addButtonSelector =
"body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-block-actions > a.js-bned-new-course.btn.btn-secondary.btn-block";

var currentDepartmentIndex = 20;
var departmentScope = 0;
var courseScope = 0;
var sectionScope = 0;
var sectionList = [];

// The first div-child is 2
var divNumberScope = 2;
// Test Fall and Winter terms
async function scopeDropDown(page, term, divNumber) {
  await sleep(100);
    await page.waitForSelector(
      "div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
    );
    await page.click(
      "div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
    );
    
    if (term == "F23") { 
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Enter");
      await page.click("header");
    } else if (term == "W24") {
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.click("header");
    } else {
      console.log("Term not found");
    }

      // select Department

      await sleep(100);
      await page.waitForSelector(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.department > div > div > select"
      );
      await page.click(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.department > div > div > select"
      );

      departmentScope = await countDropdownOptions(page, dropdownSelector, "Department");
      
      await sleep(100);
      await pressKeyMultipleTimes(page, "ArrowDown", currentDepartmentIndex, 50);
      await page.keyboard.press("Enter");
      await page.click("header");

      // select Course

      await page.waitForSelector(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.course > div > div > select"
      );
  
      await page.click(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.course > div > div > select"
      );
  
      // Don't forget to add 2 later on so it can properly used in functions
      courseScope =
      (await countDropdownOptions(page, dropdownSelector, "Course"))

      await page.click("header");

      for (let courseOptionCounter = 0; courseOptionCounter < courseScope; courseOptionCounter++) {
        await page.waitForSelector(
          "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.course > div > div > select"
        );
        await page.click(
          "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.course > div > div > select"
        );
        if (courseOptionCounter == 0) {
          console.log("0 courseOptionCounter: ", courseOptionCounter);
          await page.keyboard.press("Enter");

          // count sections for each course
          await page.waitForSelector(
            "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
          );
          await page.click(
            "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
          );
          var sectionCount = await countDropdownOptions(page, dropdownSelector, "Section");
          await sleep(500);
          sectionList.push(sectionCount);
          sectionScope += sectionCount;

          await page.click("header");
        } else {
          console.log("# courseOptionCounter: ", courseOptionCounter);
          await sleep(500);
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");

          // count sections for each course
          await page.waitForSelector(
            "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
          );
          await page.click(
            "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
          );
          
          var sectionCount = await countDropdownOptions(page, dropdownSelector, "Section");
          sectionList.push(sectionCount);
          sectionScope += sectionCount;
          await page.click("header");
        }
      }
      page.reload();
    return null;
}
  
async function countDropdownOptions(page, selector, label) {
  try {
    await page.waitForSelector(selector);
    var optionsCount = await page.$$eval(selector, (options) => options.length);

    // Get rid of "select" as first option (-1)
    var optionsCount = optionsCount - 1;
    console.log(`${label} Options Counted: `, optionsCount);

    return optionsCount;
  } catch (error) {
    console.error(
      `Error with countDropdownOptions function with selector -'${selector}': `,
      error
    );
    return null;
  }
}

// Probably change this from not being a larger function
async function addAnotherCourseButton(page, selector, times) {
  await page.waitForSelector(selector);
  await clickMultipleTimes(page, selector, times);
}
// Plus two only needed first time
async function selectTerm(page, term) {
  let isFirstExecution = true;
  let termSectionScope = sectionScope + 2;
  let activeDivNumberScope = divNumberScope;
  
    for (
      ;
      activeDivNumberScope < termSectionScope;
      activeDivNumberScope++
    ) {
    // Probably move this out of the loop instead of isFirstExecution usage
    if (isFirstExecution && activeDivNumberScope == 2 && sectionScope > 3) {
      await addAnotherCourseButton(page, addButtonSelector, sectionScope - 4);
      isFirstExecution = false;
    }
    else if (isFirstExecution && activeDivNumberScope != 2) {
      await addAnotherCourseButton(page, addButtonSelector, sectionScope);
    }

    await page.waitForSelector(
      "div:nth-child(" + activeDivNumberScope + ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
    );
    await page.click("div:nth-child(" + activeDivNumberScope + ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
    );

    if (term == "F23") { 
      await pressKeyMultipleTimes(page, "ArrowUp", 1, 50);
      await page.keyboard.press("Enter");
    } else if (term == "W24") {
      await pressKeyMultipleTimes(page, "ArrowDown", 1, 50);
      await page.keyboard.press("Enter");
    } else {
      console.log("Term not found");
    }
  }

  return page; 
}

async function selectDepartment(page) {
  let activeDivNumberScope = divNumberScope;
  let departmentSectionScope = sectionScope + 2;

  for (
    ;
    activeDivNumberScope < departmentSectionScope;
    activeDivNumberScope++
  ) {
    await page.waitForSelector(
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
      activeDivNumberScope +
        ") > div.bned-select-item.js-bned-select-item.department > div > div > select"
    );
    await page.click(
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
      activeDivNumberScope +
        ") > div.bned-select-item.js-bned-select-item.department > div > div > select"
    );

    await sleep(100);
    await pressKeyMultipleTimes(page, "ArrowDown", currentDepartmentIndex, 50);
    await page.keyboard.press("Enter");
  }
  currentDepartmentIndex++;

  return page;
}

async function selectCourse(page) {
  let activeDivNumberScope = divNumberScope;
  let sectionSectionScope = sectionScope + 2;
  let courseIndex = 0;

  for (
    ;
    activeDivNumberScope < sectionSectionScope;
    activeDivNumberScope++
  ) {
    var currentSectionAmount = sectionList[courseIndex];

    if (currentSectionAmount == 1) {
      await sleep(200);
      await page.waitForSelector(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
        activeDivNumberScope +
          ") > div.bned-select-item.js-bned-select-item.course > div > div > select"
      );
      await page.click(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
        activeDivNumberScope +
          ") > div.bned-select-item.js-bned-select-item.course > div > div > select"
      );
      await sleep(100);
      await pressKeyMultipleTimes(page, "ArrowDown", courseIndex, 50);
      await page.keyboard.press("Enter");
      
    } else {
        for (let i = 0; i < currentSectionAmount; i++) {
          await page.waitForSelector(
            "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
            activeDivNumberScope +
              ") > div.bned-select-item.js-bned-select-item.course > div > div > select"
          );
          await page.click(
            "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
            activeDivNumberScope +
              ") > div.bned-select-item.js-bned-select-item.course > div > div > select"
          );
          await sleep(100);
          await pressKeyMultipleTimes(page, "ArrowDown", courseIndex, 50);
          await page.keyboard.press("Enter");
          
          if (i < currentSectionAmount - 1) {
            activeDivNumberScope++;
          }
      }
    }
    courseIndex++;
  }
}

async function selectionSection(page) {
  let activeDivNumberScope = divNumberScope;
  let sectionSectionScope = sectionScope + 2;
  let sectionOption = 0;
  let courseIndex = 0;

  for (
    ;
    activeDivNumberScope < sectionSectionScope;
    activeDivNumberScope++
  ) {
    var currentSectionAmount = sectionList[courseIndex];

    for (let i = 0; i < currentSectionAmount; i++) {
      await sleep(200);
      await page.waitForSelector(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
        activeDivNumberScope +
          ") > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
      );
      await page.click(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
        activeDivNumberScope +
          ") > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
      );

      await pressKeyMultipleTimes(page, "ArrowDown", sectionOption - 2, 100);
      await page.keyboard.press("Enter");

      if (i < currentSectionAmount - 1) {
        activeDivNumberScope++;
      }
    }
    sectionOption++;
    courseIndex++;
  }
  divNumberScope = activeDivNumberScope + 1;
}

async function createPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
  });
  var page = await browser.newPage();

  return page;
}

async function gotoPage(page) {
  await page.goto(page_url);
}

async function selectionPage(page) {
  await scopeDropDown(page, "W24", divNumberScope);
  console.log("After departmentScope: ", departmentScope);
  console.log("After courseScope: ", courseScope);
  console.log("After sectionScope: ", sectionScope);  
  console.log("After sectionList: ", sectionList)
  await selectTerm(page, "W24");
  await selectDepartment(page);
  await selectCourse(page);
  await selectionSection(page);
  console.log("Div Location: ", divNumberScope);
  console.log("Current Department Index: ", currentDepartmentIndex);
}

// fs.appendFile(filePath, `${Term},${Department},${Course},${Section},${Textbook},${Textbook2},${Textbook3}\n`);

async function main() {
  var page = await createPage();
  await gotoPage(page);
  await selectionPage(page);
}

main();
