const { pressKeyMultipleTimes } = require("./utils/pressKeyMultipleTimes");
const { clickMultipleTimes } = require("./utils/clickMultipleTimes");
const {
  waitForSelectorAndPerformAction,
} = require("./utils/waitForSelectorAndPerformAction");
const { sleep } = require("./utils/sleep");

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

  await waitForSelectorAndPerformAction(
    page,
    "div:nth-child(" +
      divNumber +
      ")> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span",
    "click"
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

  await waitForSelectorAndPerformAction(
    page,
    "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
      divNumber +
      ")> div.bned-select-item.js-bned-select-item.department > div > div > select",
    "click",
    100
  );

  departmentScope = await countDropdownOptions(
    page,
    dropdownSelector,
    "Department"
  );

  await sleep(100);
  await pressKeyMultipleTimes(page, "ArrowDown", currentDepartmentIndex, 50);
  await page.keyboard.press("Enter");
  await page.click("header");

  // select Course

  await waitForSelectorAndPerformAction(
    page,
    "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
      divNumber +
      ")> div.bned-select-item.js-bned-select-item.course > div > div > select",
    "click",
    300
  );

  // Don't forget to add 2 later on so it can properly used in functions
  courseScope = await countDropdownOptions(page, dropdownSelector, "Course");

  await page.click("header");

  for (
    let courseOptionCounter = 0;
    courseOptionCounter < courseScope;
    courseOptionCounter++
  ) {
    await waitForSelectorAndPerformAction(
      page,
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
        divNumber +
        ")> div.bned-select-item.js-bned-select-item.course > div > div > select",
      "click",
      200
    );

    if (courseOptionCounter == 0) {
      console.log("0 courseOptionCounter: ", courseOptionCounter);
      await page.keyboard.press("Enter");

      // count sections for each course
      await waitForSelectorAndPerformAction(
        page,
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          divNumber +
          ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select",
        "click",
        800
      );
      await sleep(800);
      var sectionCount = await countDropdownOptions(
        page,
        dropdownSelector,
        "Section"
      );
      sectionList.push(sectionCount);
      sectionScope += sectionCount;

      await page.click("header");
    } else {
      console.log("# courseOptionCounter: ", courseOptionCounter);
      await sleep(800);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");

      // count sections for each course
      await waitForSelectorAndPerformAction(
        page,
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          divNumber +
          ")>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select",
        "click",
        800
      );

      var sectionCount = await countDropdownOptions(
        page,
        dropdownSelector,
        "Section"
      );
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
    // FIXME: Sometimes counts a 0 or negative
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

  for (; activeDivNumberScope < termSectionScope; activeDivNumberScope++) {
    // Probably move this out of the loop instead of isFirstExecution usage
    if (isFirstExecution && activeDivNumberScope == 2 && sectionScope > 3) {
      await addAnotherCourseButton(page, addButtonSelector, sectionScope - 4);
      isFirstExecution = false;
    } else if (isFirstExecution && activeDivNumberScope != 2) {
      await addAnotherCourseButton(page, addButtonSelector, sectionScope);
    }

    await waitForSelectorAndPerformAction(
      page,
      "div:nth-child(" +
        activeDivNumberScope +
        ") > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span",
      "click",
      300
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

  const coursesToSelect = {
    ART: "ART",
    ARTH: "ARTH",
    ASL: "ASL",
    BA: "BA",
    BI: "BI",
    CCL: "CCL",
    CH: "CH",
    COMM: "COMM",
    COUN: "COUN",
    CS: "CS",
    CW: "CW",
    D: "D",
    DCIN: "DCIN",
    EC: "EC",
    ECE: "ECE",
    ED: "ED",
    EE: "EE",
    EMDA: "EMDA",
    ENG: "ENG",
    ERS: "ERS",
    ES: "ES",
    GSWS: "GSWS",
    HCA: "HCA",
    HE: "HE",
    HON: "HON",
    HST: "HST",
    INL: "INL",
    IS: "IS",
    LEAD: "LEAD",
    LIS: "LIS",
    MAT: "MAT",
    MBA: "MBA",
    MS: "MS",
    MTH: "MTH",
    MUP: "MUP",
    MUS: "MUS",
    NAS: "NAS",
    OAL: "OAL",
    PE: "PE",
    PEA: "PEA",
    PH: "PH",
    PHL: "PHL",
    PS: "PS",
    PSY: "PSY",
    READ: "READ",
    SAS: "SAS",
    SC: "SC",
    SHS: "SHS",
    SOAN: "SOAN",
    SPAN: "SPAN",
    SPED: "SPED",
    STAT: "STAT",
    TA: "TA",
    UGS: "UGS",
    WR: "WR",
  };

  for (
    ;
    activeDivNumberScope < departmentSectionScope;
    activeDivNumberScope++
  ) {
    await waitForSelectorAndPerformAction(
      page,
      "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
        activeDivNumberScope +
        ") > div.bned-select-item.js-bned-select-item.department > div > div > select",
      "click",
      600
    );

    await sleep(600);
    // await pressKeyMultipleTimes(page, "ArrowDown", currentDepartmentIndex, 75);
    await page.keyboard.type(coursesToSelect.ES);
    await page.keyboard.press("Enter");
  }
  currentDepartmentIndex++;

  return page;
}

async function selectCourse(page) {
  let activeDivNumberScope = divNumberScope;
  let sectionSectionScope = sectionScope + 2;
  let courseIndex = 0;

  for (; activeDivNumberScope < sectionSectionScope; activeDivNumberScope++) {
    var currentSectionAmount = sectionList[courseIndex];

    if (currentSectionAmount == 1) {
      await sleep(400);

      await waitForSelectorAndPerformAction(
        page,
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          activeDivNumberScope +
          ") > div.bned-select-item.js-bned-select-item.course > div > div > select",
        "click",
        400
      );

      await sleep(100);
      await pressKeyMultipleTimes(page, "ArrowDown", courseIndex, 50);
      await page.keyboard.press("Enter");
    } else {
      for (let i = 0; i < currentSectionAmount; i++) {
        await sleep(100);
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

  for (; activeDivNumberScope < sectionSectionScope; activeDivNumberScope++) {
    var currentSectionAmount = sectionList[courseIndex];

    for (let i = 0; i < currentSectionAmount; i++) {
      await sleep(400);

      await waitForSelectorAndPerformAction(
        page,
        "div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(" +
          activeDivNumberScope +
          ") > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select",
        "click",
        200
      );

      await pressKeyMultipleTimes(page, "ArrowDown", sectionOption, 200);
      await page.keyboard.press("Enter");

      if (i < currentSectionAmount - 1) {
        activeDivNumberScope++;
      }
      sectionOption++;
    }
    sectionOption = 0;
    courseIndex++;
  }
  sectionOption = 0;
  divNumberScope = activeDivNumberScope + 1;
}

// FIXME: Always exits with Textbooks not found
async function textbookInfoCopier(page) {
  var activeTextbookDiv = 1;
  let totalCourses = sectionScope;

  await waitForSelectorAndPerformAction(
    page,
    "body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-retrieve-materials-btn.js-bned-retrieve-materials-btn > a",
    "click",
    300
  );

  // ES has a totalCourses of 21, but only 4 items available for reservation
  for (let i = 0; i < totalCourses; i++) {
    let requirements = null;
    try {
      await page.waitForSelector("div:nth-child(" +
      activeTextbookDiv +
      ") > div > div.bned-collapsible-head > h2 > a > span.bned-cm-required-recommended-product", { timeout: 10000 });

// body > div:nth-child(3) > div.main__inner-wrapper > div.container.js-bned-course-material-list-main-container > div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span.bned-cm-required-recommended-product

      let requirementsRawText = await page.$eval(
        "div:nth-child(" +
      activeTextbookDiv +
      ")  > div > div.bned-collapsible-head > h2 > a > span.bned-cm-required-recommended-product",
        (element) => element.textContent
      );

      requirements = requirementsRawText
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .replace(/\(|\)/g, "") // Remove parentheses
        .replace(/required/gi, ""); // Remove the word 'required'
      console.log(
        "Requirements for div " + activeTextbookDiv + ": ",
        requirements
      );

      if (requirements > 0) {
        // Now perform actions based on the requirements
        for (let j = 0; j < requirements; j++) {
          // What if the item is not a textbook and instead goggles or lab coat
          // FIXME: If the item is not a textbook, it will not work

          // Term
          await page.waitForSelector(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)"
          );
          var term = await page.$eval(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)",
            (element) => element.textContent.trimStart()
          );
          console.log("Term: ", term);

          // Department
          // Department is always at 2
          await page.waitForSelector(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)"
          );
          var department = await page.$eval(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)",
            (element) => element.textContent.trimStart()
          );
          console.log("Department: ", department);

          // Course
          await page.waitForSelector(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)"
          );
          var course = await page.$eval(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)",
            (element) => element.textContent.trimStart()
          );
          console.log("Course: ", course);

          // Section
          await page.waitForSelector(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)"
          );
          var section = await page.$eval(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)",
            (element) => element.textContent.trimStart()
          );
          console.log("Section: ", section);

          // Remove the "Professor" from the string using regex, lowercase all letters except first
          // Example SMITH -> Smith
          // Professor
          await page.waitForSelector(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > div > div > span"
          );
          let professorRawText = await page.$eval(
            "div.js-bned-course-material-list-cached-content-container > div:nth-child(" +
              activeTextbookDiv +
              ") > div > div.bned-collapsible-head > div > div > span",
            (element) => element.textContent
          );
          var professor = professorRawText
            .replace(/Professor/gi, "") // Remove the word 'Professor'
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())); // Lowercase all letters except first
          console.log("Professor: ", professor);

          // the year variable is Winter 2024, and it should be converted to just "24_W"
          var year = term.slice(-2) + "_" + term.charAt(0);

          var specificTextbookSelector =
            "#courseGroup_8112_8112_1_" + year + "_230_" + course + "_1";

          // Textbook
          // No longer able to use div:nth-child(2) because of the new layout
          await page.waitForSelector(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > h3 > a > span"
          );
          var textbook = await page.$eval(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > h3 > a > span",
            (element) => element.textContent
          );
          console.log("Textbook: ", textbook);
          /*
    FIXME: The authors section as the following format issue, fix in csv
                By
      hess, darrel / tasa, dennis g.

      Remove the spaces and new line
      Remove the By
      Maybe remove the / and maybe replace the comma to not interfere with csv
    */
          // Author(s)
          await page.waitForSelector(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > span"
          );
          let authorsRawText = await page.$eval(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > span",
            (element) => element.textContent
          );
          var authors = authorsRawText
            .replace(/\n/g, " ") // Remove new lines
            .replace(/By/gi, "") // Remove the word 'By'
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            // Changed regex to replace comma to not interfere with csv
            .replace(/\s\/\s/g, "") // Replace ' / ' with ''
            .replace(/,/g, " /"); // Replace comma with a slash
          console.log("Authors: ", authors);

          // Edition
          await page.waitForSelector(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(2) > span.value"
          );
          var edition = await page.$eval(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(2) > span.value",
            (element) => element.textContent
          );
          console.log("Edition: ", edition);

          // Publisher
          // Publisher is all uppercase, might change this with regex
          await page.waitForSelector(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(3) > span.value"
          );
          var publisher = await page.$eval(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(3) > span.value",
            (element) => element.textContent
          );
          console.log("Publisher: ", publisher);

          // ISBN
          await page.waitForSelector(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(4) > span.value"
          );
          var isbn = await page.$eval(
            specificTextbookSelector +
              " > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(4) > span.value",
            (element) => element.textContent
          );
          if (!isbn) {
            console.log("ISBN not found, might be equipment");
            break;
          }
          console.log("ISBN: ", isbn);

          // Check the textbook option type (Print, Digital, Rental)
          // Also will make sure it's a valid textbook with proceeding loop
          let typeChecker = await page.$eval(
            "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(3) > div.title > b",
            (element) => element.textContent
          );

          let secondTypeChecker = await page.$eval(
            "div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(3) > div.bned-variant-options-section > div > label > span.bned-capitalize",
            (element) => element.textContent
          );

          // Price can also be set to TBD, so check for that
          // Needs means of looping somehow with secondTypeChecker being reset every loop
          // Loop 6 times
          for (let i; i < 6; i++) {
            if (typeChecker == "Print") {
              console.log("Print Section Found");
              if (secondTypeChecker == "New Print") {
                // Price New Print
                console.log("New Print Option");
                await page.waitForSelector(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(3) > div.bned-variant-options-section > div:nth-child(1) > label > span.variantPriceText"
                );
                var newPrintPrice = await page.$eval(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(3) > div.bned-variant-options-section > div:nth-child(1) > label > span.variantPriceText",
                  (element) => element.textContent
                );
              } else if (secondTypeChecker == "Used Print") {
                // Price Used Print
                console.log("Used Print Option");
                await page.waitForSelector(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(3) > div.bned-variant-options-section > div:nth-child(2) > label > span.variantPriceText"
                );
                var usedPrintPrice = await page.$eval(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(3) > div.bned-variant-options-section > div:nth-child(2) > label > span.variantPriceText",
                  (element) => element.textContent
                );
              }
            } else if (typeChecker == "Digital") {
              console.log("Digital Section Found");
              if (secondTypeChecker == "Digital Purchase") {
                // Price Digital Purchase
                console.log("Digital Purchase Option");
                await page.waitForSelector(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(1) > label > span.variantPriceText"
                );
                var priceDigitalPurchase = await page.$eval(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(1) > label > span.variantPriceText",
                  (element) => element.textContent
                );
              } else if (secondTypeChecker == "Digital Rental") {
                // Price Digital Rental
                console.log("Digital Rental Option");
                await page.waitForSelector(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(2) > label > span.variantPriceText"
                );
                var priceDigitalRental = await page.$eval(
                  "div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(2) > label > span.variantPriceText",
                  (element) => element.textContent
                );
              }
            } else if (typeChecker == "Rental") {
              console.log("Rental Section Found");
              if (secondTypeChecker == "New Print Rental") {
                // Price New Print Rental
                console.log("New Print Rental Option");
                await page.waitForSelector(
                  "div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(1) > label > span.variantPriceText"
                );
                var priceNewPrintRental = await page.$eval(
                  "div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(1) > label > span.variantPriceText",
                  (element) => element.textContent
                );
              } else if (secondTypeChecker == "Used Print Rental") {
                // Price Used Print Rental
                console.log("Used Print Rental Option");
                await page.waitForSelector(
                  "div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(2) > label > span.variantPriceText"
                );
                var priceUsedPrintRental = await page.$eval(
                  "div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(4) > div.bned-variant-options-section > div:nth-child(2) > label > span.variantPriceText",
                  (element) => element.textContent
                );
              }

              fs.appendFile(filePath, `${term},${department},${course},${section},${professor},${textbook},${authors},${edition},${publisher},${isbn},${newPrintPrice},${usedPrintPrice},${priceDigitalPurchase},${priceDigitalRental},${priceNewPrintRental},${priceUsedPrintRental}\n`);

            } else {
              console.log("Type not found");
            }
          }
        }
      }
    } catch (error) {
      console.log(
        "Error fetching requirements for div " + activeTextbookDiv + ": ", error.message);
    }
    activeTextbookDiv++;
  }
}

async function createPage() {
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 10,
  });
  var page = await browser.newPage();

  await page.setCookie({
    name: "OptanonConsent",
    value:
      "isGpcEnabled=0&datestamp=Sat+Dec+16+2023+19%3A29%3A33+GMT-0800+(Pacific+Standard+Time)&version=202311.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0010%3A1%2CC0002%3A1%2CC0004%3A1%2CC0003%3A1%2CC0001%3A1%2CSPD_BG%3A1",
    domain: "sou.bncollege.com/course-material/course-finder",
  });

  return page;
}

async function gotoPage(page) {
  await page.goto(page_url, { waitUntil: "networkidle0" });
}

async function selectionPage(page) {
  await scopeDropDown(page, "W24", divNumberScope);
  console.log("After departmentScope: ", departmentScope);
  console.log("After courseScope: ", courseScope);
  console.log("After sectionScope: ", sectionScope);
  console.log("After sectionList: ", sectionList);
  await selectTerm(page, "W24");
  await selectDepartment(page);
  await selectCourse(page);
  await selectionSection(page);
  console.log("Div Location: ", divNumberScope);
  console.log("Current Department Index: ", currentDepartmentIndex);
  await textbookInfoCopier(page);
}

async function main() {
  var page = await createPage();
  await gotoPage(page);
  await selectionPage(page);
}

main();

// await page.waitForSelector(
//   "div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)"
// );
// let rawMaxItems = await page.$eval(
//   "body > div:nth-child(4) > div.main__inner-wrapper > div.container.js-bned-course-material-list-main-container > div.bned-cm-plp-main-title > div.bned-cm-plp-main-title-inner > div.bned-caption > span:nth-child(2)",
//   (element) => element.textContent
// );

// // remove the "Item" from the string
// var maxItems = rawMaxItems
//   .replace(/\s+/g, " ") // Replace multiple spaces with a single space
//   .replace(/Item/gi, ""); // Remove the word 'Item'

// body > div:nth-child(3) > div.main__inner-wrapper > div.container.js-bned-course-material-list-main-container > div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span.bned-cm-required-recommended-product