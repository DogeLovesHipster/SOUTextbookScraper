const { pressKeyMultipleTimes } = require("./pressKeyMultipleTimes");
const { clickMultipleTimes } = require("./clickMultipleTimes");
const { waitForSelectorAndPerformAction} = require("./waitForSelectorAndPerformAction");
const { sleep } = require("./sleep");

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const rootPath = path.join(__dirname, "..");
const filePath = path.join(rootPath, "csv_files", "souTextbooksList.csv");

// 55 courses total
// ART has 15 courses
// ART has a total of 18 sections for all courses

const page_url = "https://sou.bncollege.com/course-material/course-finder";

const dropdownSelector =
"ul.select2-results__options li.select2-results__option";

const addButtonSelector =
"body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-block-actions > a.js-bned-new-course.btn.btn-secondary.btn-block";

var currentDepartmentIndex = 20; // Select course (20th is ES Department)
var departmentScope = 0;
var courseScope = 0;
var sectionScope = 0;
var sectionList = [];
var divNumberScope = 2; // The first div-child is 2

// Test Fall and Winter terms
async function scopeDropDown(page, term, divNumber) {
  await sleep(100);

    await waitForSelectorAndPerformAction(page, "div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span", "click");
    
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

      await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.department > div > div > select", "click");

      departmentScope = await countDropdownOptions(page, dropdownSelector, "Department");
      
      await sleep(100);
      await pressKeyMultipleTimes(page, "ArrowDown", currentDepartmentIndex, 50);
      await page.keyboard.press("Enter");
      await page.click("header");

      // select Course

      await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.course > div > div > select", "click");
  
      // Don't forget to add 2 later on so it can properly used in functions
      courseScope =
      (await countDropdownOptions(page, dropdownSelector, "Course"))

      await page.click("header");

      for (let courseOptionCounter = 0; courseOptionCounter < courseScope; courseOptionCounter++) {

        await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.course > div > div > select", "click");
        
        if (courseOptionCounter == 0) {
          console.log("0 courseOptionCounter: ", courseOptionCounter);
          await page.keyboard.press("Enter");

          // count sections for each course
          await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select", "click");

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
          await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select", "click");
          
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

    await waitForSelectorAndPerformAction(page, "div:nth-child(" + activeDivNumberScope + ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span", "click");

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

    await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + activeDivNumberScope + ") > div.bned-select-item.js-bned-select-item.department > div > div > select", "click");

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

      await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + activeDivNumberScope + ") > div.bned-select-item.js-bned-select-item.course > div > div > select", "click");

      await sleep(100);
      await pressKeyMultipleTimes(page, "ArrowDown", courseIndex, 50);
      await page.keyboard.press("Enter");
      
    } else {
        for (let i = 0; i < currentSectionAmount; i++) {
          await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + activeDivNumberScope + ") > div.bned-select-item.js-bned-select-item.course > div > div > select", "click");
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

      await waitForSelectorAndPerformAction(page, "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + activeDivNumberScope + ") > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select", "click");

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

async function textbookInfoCopier(page) {
  await page.waitForSelector("div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)", {timeout: 1000000}); // Term
  let term = await page.$eval(
    "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)",
    (element) => element.textContent
  );
  
  await page.waitForSelector("div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)"); // Department
  let department = await page.$eval(
    "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)",
    (element) => element.textContent
  );

  await page.waitForSelector("div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)"); // Course
  let course = await page.$eval(
    "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)",
    (element) => element.textContent
  );

  await page.waitForSelector("div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)"); // Section
  let section = await page.$eval(
    "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)",
    (element) => element.textContent
  );
  
  // Remove the "Professor" from the string
  await page.waitForSelector("div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > div > div > span"); // Professor
  let professor = await page.$eval(
    "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > div > div > span",
    (element) => element.textContent
  );

  await page.waitForSelector("div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > h3 > a > span"); // Textbook LOOK AT ME
  let textbook = await page.$eval(
    "div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > h3 > a > span",
    (element) => element.textContent
  );
  /*
  FIXME: The authors section as the following format issue, fix in csv
              By
     hess, darrel / tasa, dennis g.

    Remove the spaces and new line
    Remove the By
    Maybe remove the / and maybe replace with a comma?
  */
  await page.waitForSelector("div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > span"); // Author()
  let authors = await page.$eval(
    "div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > span",
    (element) => element.textContent
  );

  await page.waitForSelector("div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(2) > span.value"); // Edition
  let edition = await page.$eval(
    "div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(2) > span.value",
    (element) => element.textContent
  );

  await page.waitForSelector("div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(3) > span.value"); // Publisher
  let publisher = await page.$eval("div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(3) > span.value", (element) => element.textContent);

  await page.waitForSelector("div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(4) > span.value"); // ISBN
  let isbn = await page.$eval("div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(4) > span.value", (element) => element.textContent);

  // Prices will go here, but that's complicated and my brain go BRR
  
  console.log("Term:", term);
  console.log("Department:", department);
  console.log("Course:", course);
  console.log("Section:", section);
  console.log("Professor:", professor);
  console.log("Textbook:", textbook);
  console.log("Authors:", authors);
  console.log("Edition:", edition);
  console.log("Publisher:", publisher);
  console.log("ISBN:", isbn);
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
  await textbookInfoCopier(page);
}

// fs.appendFile(filePath, `${Term},${Department},${Course},${Section},${Textbook},${Textbook2},${Textbook3}\n`);

async function main() {
  var page = await createPage();
  await gotoPage(page);
  await selectionPage(page);
}

main();
