const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

// 56 courses total
var page_url = "https://sou.bncollege.com/course-material/course-finder";

async function courseCounter(page) {
  try {
    var coursesOptions = await page.$$eval(
      "ul.select2-results__options li.select2-results__option",
      (options) => options.length
    );

    // Get rid of select as first option (-1)
    var coursesOptions = coursesOptions - 1;
    console.log("Course Counter Counted: ", coursesOptions);

    return(coursesOptions);
  } catch (error) {
    console.error("Error with courseCounter function:", error);
    return null;
  }
}

async function departmentCounter(page) {
  try {
    const departmentOptions = await page.$$eval(
      "ul.select2-results__options li.select2-results__option",
      (options) => options.length
    );
    console.log("Departments Number: ", departmentOptions);
    
    return(departmentOptions);
  } catch (error) {
    console.error("Error with departmentCounter function:", error);
    return null;
  }
}

async function addAnotherCourseButton(page) {
  try {
    const addButtonSelector =
      "body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-block-actions > a.js-bned-new-course.btn.btn-secondary.btn-block";

    await page.waitForSelector(addButtonSelector);
    await page.click(addButtonSelector);
    await page.click(addButtonSelector);
    await page.click(addButtonSelector);
    await page.click(addButtonSelector);
  } catch (error) {
    console.error("Error clicking Add Another Course button:", error);
  }
}

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
      await page.click("header");

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
          await addAnotherCourseButton(page);
        }
      }
    } else if (term == "W24") {
      // select term [Winter 2024]
      await page.waitForSelector(
        "div:nth-child(2) > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
      );
      await page.click(
        "div:nth-child(2) > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span"
      );
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.click("header");

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

      if (selectionBoxDepartment == 2) {
        await departmentCounter(page);
      }

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
      selectionBoxCourse < 6;
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
        await courseCounter(page);
      }

      await page.keyboard.press("Enter");
      await page.click("header");

    }
  } catch (error) {
    console.error("Error with selectCourse function:", error);
  }
}

async function createPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 3,
  });
  var page = await browser.newPage();

  return page;
}

async function gotoPage(page) {
  await page.goto(page_url);
}

async function selectionPage(page) {
  try {
    await selectTerm(page, "F23");
    await selectDepartment(page);
    await selectCourse(page);
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
