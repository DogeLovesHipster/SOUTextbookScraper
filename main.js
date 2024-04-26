const {sleep} = require('./utils/sleep'); // Sleep function mainly used to slow down the scraper on the website
const {pressKeyMultipleTimes} = require('./utils/pressKeyMultipleTimes');
const {clickMultipleTimes} = require('./utils/clickMultipleTimes');
const {
  waitForSelectorAndPerformAction,
} = require('./utils/waitForSelectorAndPerformAction');
const {textbookPriceCalc} = require('./utils/textbookPriceCalc');
const {oerCourseDesignations} = require('./utils/oerCourseDesignations');

// Dates for the scraper to distinguish what terms are being offered
const now = new Date();
const month = now.getMonth() + 1;
const day = now.getDate();

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// The path of the .csv file to be created
const rootPath = path.join(__dirname, '..');
const filePath = path.join(
    rootPath,
    'TextbookScalper',
    'csv_files',
    'souTextbooksList.csv',
);

const pageUrl = 'https://sou.bncollege.com/course-material/course-finder';

// dropdownSelector is the selector for all the dropdown boxes
const dropdownSelector =
  'ul.select2-results__options li.select2-results__option';

const addButtonSelector =
  'div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-block-actions > a.js-bned-new-course.btn.btn-secondary.btn-block';

// TEMP: hardcoded values
let currentDepartmentIndex = 20; // Select course (20th is the ES Department and 1st is the ART Department)
let departmentScope = 0; // How many departments options are available in the dropdown stored here
let courseScope = 0; // How many course options are available in the dropdown stored here
let sectionScope = 0; // How many section options are available in the dropdown stored here
const sectionList = []; // Array to store the amount of sections for each course
let divNumberScope = 2; // The first div-child is 2

// Counts the amount of options in each of the dropdowns to automate option selection
async function scopeDropDown(page, term, divNumber) {
  await waitForSelectorAndPerformAction(
      page,
      'div:nth-child(' +
      divNumber +
      ')> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span',
      'click',
  );

  // Date ranges for each term and determines what is selectable for the scope function

  // September 1st to September 30th || Fall and Winter term likely available first
  if ((month === 9 && day >= 1 && day <= 31) || (month === 10 && day >= 1 && day <= 31) || (month === 11 && day >= 1 && day <= 10)) {
    console.log('Fall and Winter term available');
    console.log("The month and day is currently:", month, day);

    if (term == 'FALL2023') {
      console.log("Fall term available")
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter');
      await page.click('header');
    } else if (term == 'WINTER2024') {
      console.log("Winter term available")
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.click('header');
    } else {
      console.log('Term not found');
    }
    
    // January 1st to March 24th || Winter term and Spring term available
  } else if ((month === 1 && day >= 1 && day <= 31) || (month === 2 && day >= 1 && day <= 31) || (month === 3 && day >= 1 && day <= 24)) {
    console.log('Winter term and Spring term available');
    console.log("The month and day is currently:", month, day);

    if (term == 'WINTER2024') {
      console.log("Winter term available")
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter');
      await page.click('header');
    }
    if (term == 'SPRING2024') {
      console.log("Spring term available")
      await page.keyboard.press('Enter');
      await page.click('header');
    }

    // April 1st to June 10th || Spring term and Summer term available
  } else if ((month === 4 && day >= 1 && day <= 30) || (month === 5 && day >= 1 && day <= 31) || (month === 6 && day >= 1 && day <= 10)) {
    console.log('Spring term and summer term available (sometimes Winter is available too)');
    console.log("The month and day is currently:", month, day);

    if (term == 'WINTER2024') {
      console.log("Winter term available")
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter');
      await page.click('header');
    }
    if (term == 'SPRING2024') {
      console.log("Spring term available")
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.click('header');
    } else if (term == 'SUMMER2024') {
      console.log("Summer term available")
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.click('header');
    }

  } else {
    throw new Error('Likely a day without textbook information. Break likely. Closing scraper.');
  }

  await sleep(2000);

  // select Department

  await waitForSelectorAndPerformAction(
    page,
    'div:nth-child(' +
    divNumber +
    ')> div.bned-select-item.js-bned-select-item.department > div > div > span > span.selection > span',
    'click',
);

  departmentScope = await countDropdownOptions(
      page,
      dropdownSelector,
      'Department',
  );

  await sleep(1000);
  await page.keyboard.type('ES'); // Temporary solution of manually entering in ART
  await page.keyboard.press('Enter');
  await page.click('header');

  // select Course

  await sleep(1000);
  await waitForSelectorAndPerformAction(
      page,
      'div:nth-child(' +
      divNumber +
      ')> div.bned-select-item.js-bned-select-item.course > div > div > select',
      'click',
  );

  // Don't forget to add 2 later on so it can properly used in functions
  courseScope = await countDropdownOptions(page, dropdownSelector, 'Course');

  await page.click('header');

  for (
    let courseOptionCounter = 0;
    courseOptionCounter < courseScope;
    courseOptionCounter++
  ) {
    await sleep(1000);
    await waitForSelectorAndPerformAction(
        page,
        'div:nth-child(' +
        divNumber +
        ')> div.bned-select-item.js-bned-select-item.course > div > div > select',
        'click'
    );

    if (courseOptionCounter == 0) {
      console.log('0 courseOptionCounter: ', courseOptionCounter);
      await page.keyboard.press('Enter');
      await sleep(1000);

      // count sections for each course
      await waitForSelectorAndPerformAction(
          page,
          'div:nth-child(' +
          divNumber +
          ')> div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select',
          'click'
      );

      var sectionCount = await countDropdownOptions(
          page,
          dropdownSelector,
          'Section',
      );
      sectionList.push(sectionCount);
      sectionScope += sectionCount;

      await page.click('header');
    } else {
      console.log('# courseOptionCounter: ', courseOptionCounter);
      
      await sleep(500);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await sleep(500);

      // Select Section

      // count sections for each course
      await waitForSelectorAndPerformAction(
          page,
          'div:nth-child(' +
          divNumber +
          ')>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select',
          'click'
      );

      var sectionCount = await countDropdownOptions(
          page,
          dropdownSelector,
          'Section',
      );
      sectionList.push(sectionCount);
      sectionScope += sectionCount;
      await page.click('header');
    }
  }

  if (sectionList.includes(0) || sectionList.length === 0) {
    let failedRuns = 0;
    if (failedRuns < 3) {
      failedRuns++;
      console.log('Refreshing page and rerunning scopeDropDown...');
      await page.reload();
      await sleep(1000);
      await scopeDropDown(page, term, divNumber);
    } else {
      console.log('Failed to get valid section counts after 3 attempts.');
    }
  } else {
    failedRuns = 0; // Reset failedRuns counter
  }

  // If it fails, reload the page and reattempt the scopeDropDown function
  await page.reload();
  await sleep(3000);
  return null;
}

// Counts the amount of dropdown options available
async function countDropdownOptions(page, selector, label) {
  try {
    await page.waitForSelector(selector);
    sleep(600);
    var optionsCount = await page.$$eval(selector, (options) => options.length);

    // Get rid of "select" as first option (-1)
    optionsCount = optionsCount - 1;
    console.log(`${label} Options Counted: `, optionsCount);

    
    return optionsCount;
  } catch (error) {
    console.error(
        `Error with countDropdownOptions function with selector -'${selector}': `,
        error,
    );
    await page.reload();
    await printables(page);
    await selectionPage(page);
    await textbookPage(page);
    
    return null;
  }
}

// Simply attempts to click the add course button
async function addAnotherCourseButton(page, selector, times) {
  let attempts = 0;
  while (attempts < 3) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await clickMultipleTimes(page, selector, times);
      break;
    } catch (error) {
      attempts++;
      if (attempts === 3) {
        await page.reload();
      }
    }
  }
}

// Ensures all values are null if they do not have a value
function nullify(value) {
  return value === undefined || value === '' ? 'null' : value;
}

// Adds the correct amount of input boxes and selects the correct term in each of the boxes (Fall, Winter, Spring, Summer)
async function selectTerm(page, term) {
  // The first execution for selecting the term is different on the page
  let isFirstExecution = true;
  // The div child starts at 2, thus adding two to account for that
  const termSectionScope = sectionScope + 2;
  // Active divDiveNumberScope is what is currently being processed in the function. Avoiding overidding the divNumberScope for other functions to use
  let activeDivNumberScope = divNumberScope;

  for (; activeDivNumberScope < termSectionScope; activeDivNumberScope++) {
    // Probably move this out of the loop instead of isFirstExecution usage
    if (isFirstExecution && activeDivNumberScope == 2 && sectionScope > 3) {
      console.log("Added courses button")
      // Add 3 instead of 4 to create an extra unused row to ensure selector is the same
      await addAnotherCourseButton(page, addButtonSelector, sectionScope - 3);
      isFirstExecution = false;
    } else if (isFirstExecution && activeDivNumberScope != 2) {
      await addAnotherCourseButton(page, addButtonSelector, sectionScope);
    }

    await sleep(500);

    await waitForSelectorAndPerformAction(
        page,
        'div:nth-child(' +
        activeDivNumberScope +
        ') > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span',
        'click'
    );

    if (term == 'FALL2023') {
      await pressKeyMultipleTimes(page, 'ArrowUp', 1, 50);
      sleep(800);
      await page.keyboard.press('Enter');
    } else if (term == 'WINTER2024') {
      await pressKeyMultipleTimes(page, 'ArrowDown', 1, 50);
      sleep(800);
      await page.keyboard.press('Enter');
    } else if (term == 'SPRING2024') {
      await pressKeyMultipleTimes(page, 'ArrowDown', 1, 50);
      await page.keyboard.press('Enter');
    } else {
      console.log('Term not found');
    }
  }

  sleep(200);
  return page;
}

// Selects the correct department in the dropdowns by using the search box field
// A total of 55 departments are selectable, but for this early test, ART is inputted manually
async function selectDepartment(page) {
  let activeDivNumberScope = divNumberScope;
  // Same number of department scope as section scope, plus the two to account for the starting div child
  const departmentSectionScope = sectionScope + 2;
  console.log("OUTSIDE LOOP")
  for (
    ;
    activeDivNumberScope < departmentSectionScope;
    activeDivNumberScope++
  ) {
    console.log("TOP OF LOOP")

    await sleep(1000);
    await waitForSelectorAndPerformAction(
      page,
      'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
      activeDivNumberScope +
      ')> div.bned-select-item.js-bned-select-item.department > div > div > select',
      'click',
  );
  
    console.log("Active Div", activeDivNumberScope);
    console.log("Current Department Index:", currentDepartmentIndex);
    console.log("Department Scope:", departmentSectionScope);
    await sleep(1500);

    await page.keyboard.type('ES');
    await page.keyboard.press('Enter');
  }
  currentDepartmentIndex++;

  return page;
}

// Selects the course numbers by using the array of sectionList to determine how many sections are available for each course
// Allowing for multiple of the same course to be inputted to account for all options
async function selectCourse(page) {
  let activeDivNumberScope = divNumberScope;
  const sectionSectionScope = sectionScope + 2;
  // Used as a tracker for the dropdown box to select the correct course
  // The course numbers are more dynamic than the departments
  let courseIndex = 0;

  for (; activeDivNumberScope < sectionSectionScope; activeDivNumberScope++) {
    const currentSectionAmount = sectionList[courseIndex];

    // First course is selected differently than the rest
    if (currentSectionAmount == 1) {
      await sleep(1500);

      await waitForSelectorAndPerformAction(
        page,
        'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
        activeDivNumberScope +
        ') > div.bned-select-item.js-bned-select-item.course > div > div > select',
        'click',
    );

      await sleep(1000);
      console.log("Current Course Amount:", currentSectionAmount);
      console.log("1 Active Div Number Scope:", activeDivNumberScope);
      console.log("1 Section Section Scope:", sectionSectionScope);
      console.log("1 Course Index:", courseIndex);

      await pressKeyMultipleTimes(page, 'ArrowDown', courseIndex, 300);
      // await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    } else {
      for (let i = 0; i < currentSectionAmount; i++) {
        await sleep(1500);
        await page.waitForSelector(
          'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
          activeDivNumberScope +
          ') > div.bned-select-item.js-bned-select-item.course > div > div > select',
      );
      await page.click(
          'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
          activeDivNumberScope +
          ') > div.bned-select-item.js-bned-select-item.course > div > div > select',
      );
        await sleep(500);

        console.log("2 Active Div Number Scope:", activeDivNumberScope);
        console.log("2 Section Section Scope:", sectionSectionScope);
        console.log("2 Course Index:", courseIndex);

        // Keeps track of how many times the down arrow needs to be pressed in the dropdown box
        await pressKeyMultipleTimes(page, 'ArrowDown', courseIndex, 300);
        await sleep(1000);
        await page.keyboard.press('Enter');

        if (i < currentSectionAmount - 1) {
          activeDivNumberScope++;
        }
      }
    }
    courseIndex++;
  }
}

// Selects the section numbers by using the array of sectionList to determine how many sections are available for each course
async function selectionSection(page) {
  let activeDivNumberScope = divNumberScope;
  const sectionSectionScope = sectionScope + 2;
  let sectionOption = 0;
  let courseIndex = 0;

  for (; activeDivNumberScope < sectionSectionScope; activeDivNumberScope++) {
    const currentSectionAmount = sectionList[courseIndex];

    for (let i = 0; i < currentSectionAmount; i++) {
      await sleep(1500);

      await waitForSelectorAndPerformAction(
          page,
          'div:nth-child(' +
          activeDivNumberScope +
          ') > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > span > span.selection > span',
          'click'
      );

      await pressKeyMultipleTimes(page, 'ArrowDown', sectionOption, 200);
      await sleep(1000);
      await page.keyboard.press('Enter');

      // If there are more sections for the course, increment the activeDivNumberScope
      if (i < currentSectionAmount - 1) {
        activeDivNumberScope++;
      }
      sectionOption++;
    }
    // Reset the sectionOption and increment the courseIndex
    sectionOption = 0;
    courseIndex++;
  }
  sectionOption = 0;
  // Update the global divNumberScope to the current activeDivNumberScope
  divNumberScope = activeDivNumberScope + 1;
}

// Function that scrapes the textbook information from the website and stores it in a .csv file from the next page
async function textbookInfoCopier(page) {
  let activeTextbookDiv = 2;
  const totalCourses = sectionScope;
  let previousCourse;
  let courseAmount = 1;

  await waitForSelectorAndPerformAction(
      page,
      'body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-retrieve-materials-btn.js-bned-retrieve-materials-btn > a',
      'click'
  );

  for (let i = 0; i < totalCourses; i++) {
    let requirements = 0;
    var term = null;
    var department = null;
    var course = null;
    var section = null;
    var professor = null;
    var textbook = null;
    var authors = null;
    var edition = null;
    var publisher = null;
    var isbn = null;
    let newPrintPrice = null;
    let usedPrintPrice = null;
    let digitalPurchasePrice = null;
    let digitalRentalPrice = null;
    let newRentalPrintPrice = null;
    let usedRentalPrintPrice = null;
    let rentOnlyPrice = null;
    let oer = null;
    let textbookStatus = '';

    try {
      await page.waitForSelector(
          'div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > h2 > a > span.bned-cm-required-recommended-product',
          {timeout: 11000},
      );

      const requirementsRawText = await page.$eval(
          'div:nth-child(' +
          activeTextbookDiv +
          ')  > div > div.bned-collapsible-head > h2 > a > span.bned-cm-required-recommended-product',
          (element) => element.textContent,
      );

      requirements = requirementsRawText
          .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
          .replace(/\(|\)/g, '') // Remove parentheses
          .replace(/required/gi, '') // Remove the word 'required'
          .replace(/recommended/gi, ''); // Remove the word 'recommended'
      console.log(
          'Requirements for div ' + activeTextbookDiv + ': ',
          requirements,
      );

      if (requirements > 0) {
        for (let j = 0; j < requirements; j++) {
          // FIXME: If the item is not a textbook, it will not work

          // Term
          await page.waitForSelector(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)',
          );
          var term = await page.$eval(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)',
              (element) => element.textContent.trim(),
          );
          console.log('Term: ', term);

          // Department
          // Department is always at 2
          await page.waitForSelector(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)',
          );
          var department = await page.$eval(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)',
              (element) => element.textContent.trim(),
          );

          // Course
          await page.waitForSelector(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)',
          );
          var course = await page.$eval(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)',
              (element) => element.textContent.replace(/^\s+/, ''), // Remove leading whitespace
          );
          console.log('Course: ', course);

          // Section
          await page.waitForSelector(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)',
          );
          var section = await page.$eval(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)',
              (element) => element.textContent.trim(),
          );
          console.log('Section: ', section);

          // Remove the "Professor" from the string using regex, lowercase all letters except first
          // Example SMITH -> Smith
          // Professor
          await page.waitForSelector(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > div > div > span',
          );
          const professorRawText = await page.$eval(
              'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
              activeTextbookDiv +
              ') > div > div.bned-collapsible-head > div > div > span',
              (element) => element.textContent.trimStart(),
          );
          var professor = professorRawText
              .replace(/Professor/gi, '') // Remove the word 'Professor'
              .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
              .replace(/\w\S*/g, (w) =>
                w.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
              ) // Lowercase all letters except first
              .trim(); // Trim leading and trailing spaces
          console.log('Professor: ', professor);

          // the year variable is Winter 2024, and it should be converted to just "24_W"
          var year = term.slice(-2) + '_' + term.charAt(0);

          // if the course is the same as it was last time, go through the loop
          if (course == previousCourse) {
            courseAmount = courseAmount + 1;
            console.log('Same course as last time:', courseAmount);
          } else {
            courseAmount = 1;
            console.log('New course: ', courseAmount);
            previousCourse = course;
          }

          // This is how the selector is formatted for the specific textbook
          // Example: #courseGroup_8112_8112_1_24_W_230_1_1
          var specificTextbookSelector =
            '#courseGroup_8112_8112_1_' +
            year +
            '_230_' + // ES is 230
            course +
            '_' +
            courseAmount;

          // Textbook
          // No longer able to use div:nth-child(2) because of the new layout
          await page.waitForSelector(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > h3 > a > span',
          );
          var textbook = await page.$eval(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > h3 > a > span',
              (element) => element.textContent.trim(),
          );
          console.log('Textbook: ', textbook);

          // Author(s)
          await page.waitForSelector(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > span',
          );
          const authorsRawText = await page.$eval(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > span',
              (element) => element.textContent.trimStart(),
          );
          var authors = authorsRawText
              .replace(/By\s+/gi, '') // Remove the word 'By' and any following spaces
              .replace(/\s*\/\s*/g, '; ') // Replace ' / ' with '; '
              .replace(/,/g, ';') // replace , with ; to not interfere with csv
              .trim(); // Trim leading and trailing spaces

          console.log('Authors: ', authors);

          // Edition
          await page.waitForSelector(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(2) > span.value',
          );
          var edition = await page.$eval(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(2) > span.value',
              (element) => element.textContent.trim(),
          );
          console.log('Edition: ', edition);

          // Publisher
          // Publisher is all uppercase, might change this with regex
          await page.waitForSelector(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(3) > span.value',
          );
          var publisher = await page.$eval(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(3) > span.value',
              (element) => element.textContent.trim(),
          );
          console.log('Publisher: ', publisher); // This is still all uppercase, might change

          // ISBN
          await page.waitForSelector(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(4) > span.value',
          );
          var isbn = await page.$eval(
              specificTextbookSelector +
              ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.bned-item-attributes-notes-wp > div.bned-name-attributes-wp > div > div:nth-child(4) > span.value',
              (element) => element.textContent.trim(),
          );
          if (!isbn) {
            console.log('ISBN not found, might be equipment');
            break;
          }
          console.log('ISBN: ', isbn);

          // More complex price scraping

          const priceTexts = await page.evaluate((specificTextbookSelector) => {
            const specificSection = document.querySelector(
                specificTextbookSelector,
            );
            const priceElements =
              specificSection.querySelectorAll('.variantPriceText');
            return Array.from(priceElements).map((element) =>
              element.textContent.trim(),
            );
          }, specificTextbookSelector);

          const priceOptionsCounter = await page.evaluate(
              (specificTextbookSelector) => {
                const options = document.querySelector(specificTextbookSelector);
                const variantGroups = options.querySelectorAll(
                    '.bned-variant-group',
                );

                let printOptionsCount = 0;
                let rentalOptionsCount = 0;
                let digitalOptionsCount = 0;

                variantGroups.forEach((group) => {
                  const title = group.querySelector('.title').textContent.trim();
                  const optionCount = group.querySelectorAll(
                      '.bned-variant-option',
                  ).length;

                  console.log('Title: ', title);

                  if (title.includes('Buy')) {
                    printOptionsCount += optionCount;
                  } else if (title.includes('Rent')) {
                    rentalOptionsCount += optionCount;
                  } else if (title.includes('Digital')) {
                    digitalOptionsCount += optionCount;
                  }
                });

                return {
                  printOptionsCount,
                  rentalOptionsCount,
                  digitalOptionsCount,
                };
              },
              specificTextbookSelector,
          );

          console.log('Total Options Count: ', priceOptionsCounter);
          console.log(
              'Print Options Count: ',
              priceOptionsCounter.printOptionsCount,
          );
          console.log(
              'Rental Options Count: ',
              priceOptionsCounter.rentalOptionsCount,
          );
          console.log(
              'Digital Options Count: ',
              priceOptionsCounter.digitalOptionsCount,
          );

          // Price can also be set to TBD, so check for that
          let typeChecker;
          let divChild = 3;
          let multipleDivChild = 1;
          let isFirstIterationForFirst = true;
          let currentPrintCount = priceOptionsCounter.printOptionsCount;
          let currentRentalCount = priceOptionsCounter.rentalOptionsCount;
          let currentDigitalCount = priceOptionsCounter.digitalOptionsCount;
          const priceCounter =
            priceOptionsCounter.printOptionsCount +
            priceOptionsCounter.rentalOptionsCount +
            priceOptionsCounter.digitalOptionsCount;
          const textbookPrices = {};


          console.log(priceCounter);

          for (let i = 0; i < priceCounter; i++) {
            let secondTypeChecker;

            console.log('Div Child at the priceCounter loop: ', divChild);
            console.log(
                'Multiple Div Child at the priceCounter loop: ',
                multipleDivChild,
            );
            console.log('isFirstIterationForFirst: ', isFirstIterationForFirst);
            if (
              isFirstIterationForFirst &&
              (currentPrintCount > 0 ||
                currentRentalCount > 0 ||
                currentDigitalCount > 0)
            ) {
              typeChecker = await page.$eval(
                  specificTextbookSelector +
                  ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(' +
                  divChild +
                  ') > div.title > b',
                  (element) => element.textContent.trim(),
              );
              console.log('First Type Checker: ', typeChecker);
              isFirstIterationForFirst = false;
            } else {
              console.log(
                  'Either no more print, rental, or digital options or not first iteration',
              );
            }
            if (typeChecker == 'Buy') {
              console.log('First Iteration subtracts 1 from Print Count');
              currentPrintCount--;
              console.log(
                  'The Current Type Checker in further is: ',
                  typeChecker,
              );
              console.log('Print Count: ', currentPrintCount);
            } else if (typeChecker == 'Rent') {
              console.log('First Iteration subtracts 1 from Rental Count');
              currentRentalCount--;
              console.log(
                  'The Current Type Checker in further is: ',
                  typeChecker,
              );
              console.log('Rental Count: ', currentRentalCount);
            } else if (typeChecker == 'Digital') {
              console.log('First Iteration subtracts 1 from Digital Count');
              currentDigitalCount--;
              console.log(
                  'The Current Type Checker in further i: ',
                  typeChecker,
              );
              console.log('Digital Count: ', currentDigitalCount);
            }
            if (currentPrintCount == 0 && typeChecker == 'Buy') {
              isFirstIterationForFirst = true;
              console.log('Print Count is 0');
            } else if (currentRentalCount == 0 && typeChecker == 'Rent') {
              isFirstIterationForFirst = true;
              console.log('Rental Count is 0');
            } else if (currentDigitalCount == 0 && typeChecker == 'Digital') {
              isFirstIterationForFirst = true;
              console.log('Digital Count is 0');
            }

            if (typeChecker == 'Digital') {
              console.log('DIGITAL FOR SECOND FUNCTION, SPAN APPROACH');
              secondTypeChecker = await page.$eval(
                  specificTextbookSelector +
                  ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(' +
                  divChild +
                  ') > div.bned-variant-options-section > div > label > span:nth-child(2)',
                  (element) => element.textContent.trim(),
              );
// #courseGroup_8112_8112_1_24_S_230_314_1 > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(5) > div.bned-variant-options-section > div > label > span:nth-child(2)
              console.log('Subsequent Iterations');
              console.log('Second Type Checker: ', secondTypeChecker);
              multipleDivChild++;
              if (isFirstIterationForFirst == true) {
                divChild++;
                multipleDivChild = 1;
              }
            } else {
              console.log('PRIMARY SECOND FUNCTION, USING CAPITALIZE');
              secondTypeChecker = await page.$eval(
                  specificTextbookSelector +
                  ' > div > div > div.bned-item-details-container > div.bned-item-details-wp.js-item-details-wp > div.js-cm-item-variant-container.bned-variants-wp > div > div.bned-variant-group-wp.js-bned-cm-variant-options > div:nth-child(' +
                  divChild +
                  ') > div.bned-variant-options-section > div:nth-child(' +
                  multipleDivChild +
                  ') > label > span.bned-capitalize',
                  (element) => element.textContent.trim(),
              );
              console.log('First Iteration');
              console.log('Second Type Checker: ', secondTypeChecker);
              multipleDivChild++;
              if (isFirstIterationForFirst == true) {
                divChild++;
                multipleDivChild = 1;
              }
            }

            if (typeChecker == 'Buy') {
              console.log('Print Section Found');
              if (secondTypeChecker == 'New Print') {
                // Price New Print
                console.log('New Print Option');
                newPrintPrice = priceTexts[i];
                textbookPrices['newPrintPrice'] = newPrintPrice;
                console.log('New Print Price: ', newPrintPrice);
              } else if (secondTypeChecker == 'Used Print') {
                // Price Used Print
                console.log('Used Print Option');
                usedPrintPrice = priceTexts[i];
                textbookPrices['usedPrintPrice'] = usedPrintPrice;
                console.log('Used Print Price: ', usedPrintPrice);
              }
            } else if (typeChecker == 'Digital') {
              console.log('Digital Section Found');
              if (secondTypeChecker == 'Digital Purchase') {
                // Price Digital Purchase
                digitalPurchasePrice = priceTexts[i];
                textbookPrices['digitalPurchasePrice'] = digitalPurchasePrice;
                console.log('Digital Purchase Price: ', digitalPurchasePrice);
              } else if (secondTypeChecker == 'Digital Rental') {
                // Price Digital Rental
                console.log('Digital Rental Option');
                digitalRentalPrice = priceTexts[i];
                textbookPrices['digitalRentalPrice'] = digitalRentalPrice;
                console.log('Digital Rental Price: ', digitalRentalPrice);
              }
            } else if (typeChecker == 'Rent') {
              console.log('Rental Section Found');
              if (secondTypeChecker == 'New Print Rental') {
                // Price New Print Rental
                newRentalPrintPrice = priceTexts[i];
                textbookPrices['newRentalPrintPrice'] = newRentalPrintPrice;
                console.log('New Print Rental Option: ', newRentalPrintPrice);
              } else if (secondTypeChecker == 'Used Print Rental') {
                // Price Used Print Rental
                usedRentalPrintPrice = priceTexts[i];
                textbookPrices['usedRentalPrintPrice'] = usedRentalPrintPrice;
                console.log('Used Print Rental Option: ', usedRentalPrintPrice);
              } else if (secondTypeChecker == 'Rent Only') {
                // Price Rent Only
                rentOnlyPrice = priceTexts[i];
                textbookPrices['rentOnlyPrice'] = rentOnlyPrice;
                console.log('Rent Only Option: ', rentOnlyPrice);
              }
            }
          }
          console.log('This is the last Textbook dictionary values:', textbookPrices);
          const bestPriceforOER = await textbookPriceCalc(textbookPrices);
          console.log('THIS IS THE TEXTBOOK CALC OUTPUT:', bestPriceforOER);
          console.log('TEXTBOOK STATUS WITH PRICES ABOVE:', textbookStatus);

          oer = await oerCourseDesignations(bestPriceforOER, textbookStatus);
          console.log('OER DESIGNATION:', oer);
        }
      }
    } catch (error) {
      console.log(
        error,
          'Type not found. Must be either an equipment or there is no materials\n',
      );

      await page.waitForSelector(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)',
      );
      var term = await page.$eval(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(1)',
          (element) => element.textContent.trim(),
      );
      console.log('Term: ', term);

      // Department
      // Department is always at 2
      await page.waitForSelector(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)',
      );
      var department = await page.$eval(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(2) > div > div.bned-collapsible-head > h2 > a > span:nth-child(2)',
          (element) => element.textContent.trim(),
      );
      console.log('Department: ', department);

      // Course
      await page.waitForSelector(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)',
      );
      var course = await page.$eval(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(3)',
          (element) => element.textContent.replace(/^\s+/, ''),
      );
      console.log('Course: ', course);

      // Section
      await page.waitForSelector(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)',
      );
      var section = await page.$eval(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > h2 > a > span:nth-child(4)',
          (element) => element.textContent.trim(),
      );
      console.log('Section: ', section);

      // Professor
      await page.waitForSelector(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > div > div > span',
      );
      const professorRawText = await page.$eval(
          'div.js-bned-course-material-list-cached-content-container > div:nth-child(' +
          activeTextbookDiv +
          ') > div > div.bned-collapsible-head > div > div > span',
          (element) => element.textContent.trimStart(),
      );
      var professor = professorRawText
          .replace(/Professor/gi, '') // Remove the word 'Professor'
          .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
          .replace(/\w\S*/g, (w) =>
            w.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
          ) // Lowercase all letters except first
          .trim(); // Trim leading and trailing spaces
      console.log('Professor: ', professor);

      // the year variable is Winter 2024, and it should be converted to just "24_W"
      var year = term.slice(-2) + '_' + term.charAt(0);

      // if the course is the same as it was last time, do loop
      if (course == previousCourse) {
        courseAmount = courseAmount + 1;
        console.log('Same course as last time:', courseAmount);
      } else {
        courseAmount = 1;
        console.log('New course: ', courseAmount);
        previousCourse = course;
      }

      var specificTextbookSelector =
        '#courseGroup_8112_8112_1_' +
        year +
        '_230_' + // ES is 230 and ART is 30
        course +
        '_' +
        courseAmount;

      try {
        await page.waitForSelector(
            specificTextbookSelector +
            ' > div > div > div.bned-section-body > div > div.bned-description-headline > h2',
            {timeout: 10000},
        );
        textbookStatus = await page.$eval(
            specificTextbookSelector +
            ' > div > div > div.bned-section-body > div > div.bned-description-headline > h2',
            (element) => element.textContent.trim(),
        );
        console.log('Textbook Status: ', textbookStatus);
        oer = await oerCourseDesignations(0.00, textbookStatus);
        console.log('OER DESIGNATION with TEXTBOOK STATUS:', oer);
      } catch (error) {
        await page.waitForSelector(
            specificTextbookSelector +
            ' > div > div > div.bned-section-body > div.bned-description-wp > div.bned-description-headline > h2',
            {timeout: 10000},
        );
        textbookStatus = await page.$eval(
            specificTextbookSelector +
            ' > div > div > div.bned-section-body > div.bned-description-wp > div.bned-description-headline > h2',
            (element) => element.textContent.trim(),
        );
        console.log('Textbook Status 2nd try: ', textbookStatus);
      }
    }

    // If no value is found, set it to null
    term = nullify(term);
    department = nullify(department);
    course = nullify(course);
    section = nullify(section);
    professor = nullify(professor);
    textbook = nullify(textbook);
    authors = nullify(authors);
    edition = nullify(edition);
    publisher = nullify(publisher);
    isbn = nullify(isbn);
    newPrintPrice = nullify(newPrintPrice);
    usedPrintPrice = nullify(usedPrintPrice);
    newRentalPrintPrice = nullify(newRentalPrintPrice);
    usedRentalPrintPrice = nullify(usedRentalPrintPrice);
    rentOnlyPrice = nullify(rentOnlyPrice);
    digitalPurchasePrice = nullify(digitalPurchasePrice);
    digitalRentalPrice = nullify(digitalRentalPrice);
    oer = nullify(oer);

    // Append the data to the CSV file
    fs.appendFile(filePath, `${term},${department},${course},${section},${professor},${textbook || 'null'},${authors || 'null'},${edition || 'null'},${publisher || 'null'},${isbn || 'null'},${newPrintPrice || 'null'},${usedPrintPrice || 'null'},${newRentalPrintPrice || 'null'},${usedRentalPrintPrice || 'null'},${rentOnlyPrice || 'null'},${digitalPurchasePrice || 'null'},${digitalRentalPrice || 'null'},${oer || 'null'}\n`, (err) => {
      if (err) {
        console.error('Error appending to CSV:', err);
      } else {
        console.log('Data appended to CSV successfully.');
      }
    });

    activeTextbookDiv++;
  }
}

async function createPage() {
  // Lauches the browser
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 5, // To account for the speed of the website, slowed down the scraper
  });
  const page = await browser.newPage();

  // To prevent the cookie banner from appearing and interfering with the scraping
  await page.setCookie({
    name: 'OptanonConsent',
    value:
      'isGpcEnabled=0&datestamp=Sat+Dec+16+2023+19%3A29%3A33+GMT-0800+(Pacific+Standard+Time)&version=202311.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0010%3A1%2CC0002%3A1%2CC0004%3A1%2CC0003%3A1%2CC0001%3A1%2CSPD_BG%3A1',
    domain: 'sou.bncollege.com/course-material/course-finder',
  });

  return page;
}

// Goes to the page url and begins when the page is fully loaded
async function gotoPage(page) {
  await page.goto(pageUrl, {waitUntil: 'networkidle0'});
}

// The first page where term, department, course, section are selected
async function selectionPage(page) {
  await selectTerm(page, 'SPRING2024');
  await selectDepartment(page);
  await selectCourse(page);
  await selectionSection(page);
  console.log('Div Location: ', divNumberScope);
  console.log('Current Department Index: ', currentDepartmentIndex);
}

// Shows the results of the scopeDropDown function. Seperated for debugging purposes
async function printables(page) {
  await scopeDropDown(page, 'SPRING2024', divNumberScope);
  console.log('After departmentScope: ', departmentScope);
  console.log('After courseScope: ', courseScope);
  console.log('After sectionScope: ', sectionScope);
  console.log('After sectionList: ', sectionList);
}

// The second page where the textbook information is scraped and copied
async function textbookPage(page) {
  await textbookInfoCopier(page);
}

// Main function with error handling
async function main() {
  try {
    const page = await createPage();
    await gotoPage(page);
    await printables(page);
    await selectionPage(page);
    await textbookPage(page);
  } catch (error) {
    if (error.message.includes('Node is either not clickable or not an Element')) {
      console.log('Node error occurred... Retrying...');
      console,log(error);
      const page = await createPage();
      await gotoPage(page);
      await selectionPage(page);
      await textbookPage(page);
    } else {
      throw error;
    }
  }
}

main();
