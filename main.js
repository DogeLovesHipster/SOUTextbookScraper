const { pressKeyMultipleTimes } = require("./pressKeyMultipleTimes");
const { clickMultipleTimes } = require("./clickMultipleTimes");

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

// const rootPath = path.join(__dirname, "..");
// const filePath = path.join(rootPath, "csv_files", "souTextbooksList.csv");

// 56 courses total
// ART has 15 courses
// ART has a total of 18 sections for all courses
const page_url = "https://sou.bncollege.com/course-material/course-finder";

const dropdownSelector =
"ul.select2-results__options li.select2-results__option";

const addButtonSelector =
"body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-block-actions > a.js-bned-new-course.btn.btn-secondary.btn-block";

var departmentScope = 0;
var courseScope = 0;
var sectionScope = 0;

async function scopeDropDown(page, term, divNumber) {
    try {
      // select term [Fall 2023]
      if (term == "F23") {
        await page.waitForSelector(
          "div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );
        await page.click(
          "div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("Enter");
        await page.click("header");

        // select Department

        await page.waitForSelector(
          "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.department > div > div > select"
        );
        await page.click(
          "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.department > div > div > select"
        );

        departmentScope = await countDropdownOptions(page, dropdownSelector, "Department");

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
            await page.click("header");
            // count sections for each course
            await page.waitForSelector(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            await page.click(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            sectionScope = await countDropdownOptions(page, dropdownSelector, "Section");
          } else {
            console.log("# courseOptionCounter: ", courseOptionCounter);
            await pressKeyMultipleTimes(page, "ArrowDown", courseOptionCounter);
            await page.keyboard.press("Enter");
            await page.click("header");
            // count sections for each course
            await page.waitForSelector(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            await page.click(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            sectionScope = await countDropdownOptions(page, dropdownSelector, "Section");
          }
        }

      } else if (term == "W24") {
        // select term [Winter 2024]
        await page.waitForSelector(
          "div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );
        await page.click(
          "div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );

        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.click("header");

        // select Department

        await page.waitForSelector(
          "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.department > div > div > select"
        );
        await page.click(
          "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child)" + divNumber + ")> div.bned-select-item.js-bned-select-item.department > div > div > select"
        );

        departmentScope = await countDropdownOptions(page, dropdownSelector, "Department");

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
            await page.click("header");
            // count sections for each course
            await page.waitForSelector(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            await page.click(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" + divNumber + ")> div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            sectionScope = await countDropdownOptions(page, dropdownSelector, "Section");
          } else {
            console.log("# courseOptionCounter: ", courseOptionCounter);
            await pressKeyMultipleTimes(page, "ArrowDown", courseOptionCounter);
            await page.keyboard.press("Enter");
            await page.click("header");
            // count sections for each course
            await page.waitForSelector(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(2) > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            await page.click(
              "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(2) > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
            );
            sectionScope = await countDropdownOptions(page, dropdownSelector, "Section");
          }
          courseOptionCounter++;
        }
        
      }

      return null;
    } catch(error) {
      console.error("Error with scopeDropDown function:", error);
    }
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

async function addAnotherCourseButton(page, selector, times) {
  try {
    await page.waitForSelector(selector);
    await clickMultipleTimes(page, selector, times);
  } catch (error) {
    console.error("Error clicking Add Another Course button:", error);
  }
}

async function selectTerm(page, term) {
  try {
    if (term == "F23") {
      // select term [Fall 2023]
      for (let selectionBoxTerm = 3; selectionBoxTerm < 6; selectionBoxTerm++) {
        await page.waitForSelector(
          "div:nth-child(" +
            selectionBoxTerm +
            ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );
        await page.click(
          "div:nth-child(" +
            selectionBoxTerm +
            ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );
        await page.keyboard.press("Enter");
        await page.click("header");

        if (selectionBoxTerm % 5 === 0) {
          await addAnotherCourseButton(page, addButtonSelector, 4);
        }
      }
    } else if (term == "W24") {
      // select term [Winter 2024]
      for (let selectionBoxTerm = 3; selectionBoxTerm < 6; selectionBoxTerm++) {
        await page.waitForSelector(
          "div:nth-child(" +
            selectionBoxTerm +
            ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );
        await page.click(
          "div:nth-child(" +
            selectionBoxTerm +
            ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
        );

        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.click("header");

        if (selectionBoxTerm % 5 === 0) {
          await addAnotherCourseButton(page);
        }
      }
    }

    return page;
  } catch (error) {
    console.error("Error with selectTerm function:", error);
    return null;
  }
}

async function selectDepartment(page) {
  try {
    for (
      let selectionBoxDepartment = 2;
      selectionBoxDepartment < 6;
      selectionBoxDepartment++
    ) {
      await page.waitForSelector(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          selectionBoxDepartment +
          ") > div.bned-select-item.js-bned-select-item.department > div > div > select"
      );
      await page.click(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          selectionBoxDepartment +
          ") > div.bned-select-item.js-bned-select-item.department > div > div > select"
      );

      await page.keyboard.press("Enter");
      await page.click("header");
    }

    return page;
  } catch (error) {
    console.error("Error with selectDepartment fucntion:", error);
    return null;
  }
}

async function selectCourse(page) {
  try {
    for (
      let selectionBoxCourse = 2;
      selectionBoxCourse < courseCounter;
      selectionBoxCourse++
    ) {
      await page.waitForSelector(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          selectionBoxCourse +
          ") > div.bned-select-item.js-bned-select-item.course > div > div > select"
      );

      await page.click(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          selectionBoxCourse +
          ") > div.bned-select-item.js-bned-select-item.course > div > div > select"
      );
      if (selectionBoxCourse == 2) {
        await countDropdownOptions(page, dropdownSelector, "Course");
      }

      if (courseOptionCounter == 0) {
        console.log("0 courseOptionCounter: ", courseOptionCounter);
        await page.keyboard.press("Enter");
        await page.click("header");
      } else {
        console.log("# courseOptionCounter: ", courseOptionCounter);
        await pressKeyMultipleTimes(page, "ArrowDown", courseOptionCounter);
        await page.keyboard.press("Enter");
        await page.click("header");
      }

      courseOptionCounter++;
    }
  } catch (error) {
    console.error("Error with selectCourse function:", error);
  }
}

async function selectionSection(page) {
  try {
    await page.waitForSelector(
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(2) > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
    );
    await page.click(
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(2) > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
    );

    let sectionCounter =
      (await countDropdownOptions(page, dropdownSelector, "Section")) + 2;

    await page.click("header");

    for (
      let selectionBoxSection = 2, sectionOptionCounter = 0;
      selectionBoxSection < sectionCounter;
      selectionBoxSection++
    ) {
      await page.waitForSelector(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          selectionBoxSection +
          ") > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
      );

      await page.click(
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          selectionBoxSection +
          ") > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select"
      );

      if (sectionOptionCounter == 0) {
        console.log("0 sectionOptionCounter: ", sectionOptionCounter);
        await page.keyboard.press("Enter");
        await page.click("header");
      } else {
        console.log("# sectionOptionCounter: ", sectionOptionCounter);
        await pressKeyMultipleTimes(page, "ArrowDown", sectionOptionCounter);
        await page.keyboard.press("Enter");
        await page.click("header");
      }

      sectionOptionCounter++;
    }
  } catch (error) {
    console.error("Error with selectionSection function:", error);
  }
}

async function createPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 30,
  });
  var page = await browser.newPage();

  return page;
}

async function gotoPage(page) {
  await page.goto(page_url);
}

async function selectionPage(page) {
  try {
    await scopeDropDown(page, "F23", 2);
    console.log("After departmentScope: ", departmentScope);
    console.log("After courseScope: ", courseScope);
    console.log("After sectionScope: ", sectionScope);  
    // await selectTerm(page, "F23");
    // await selectDepartment(page);
    // await selectCourse(page);
    // await selectionSection(page)
  } catch (error) {
    console.error("Error with selectionPage function:", error);
  }
}

// fs.appendFile(filePath, `${Term},${Department},${Course},${Section},${Textbook},${Textbook2},${Textbook3}\n`);

async function main() {
  var page = await createPage();
  await gotoPage(page);
  await selectionPage(page);
}

main();
