const {createCSVFile} = require('./utils/csvFileCreate');
const {sleep} = require('./utils/sleep');
const {pressKeyMultipleTimes} = require('./utils/pressKeyMultipleTimes');
const {clickMultipleTimes} = require('./utils/clickMultipleTimes');
const {
  waitForSelectorAndPerformAction,
} = require('./utils/waitForSelectorAndPerformAction');
const {textbookPriceCalc} = require('./utils/textbookPriceCalc');
const {oerCourseDesignations} = require('./utils/oerCourseDesignations');

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const rootPath = path.join(__dirname, '..');
const filePath = path.join(
    rootPath,
    'TextbookScalper',
    'csv_files',
    'souTextbooksList.csv',
);

createCSVFile();

// 55 courses total
// ART has 15 courses
// ART has a total of 18 sections for all courses

const pageUrl = 'https://sou.bncollege.com/course-material/course-finder';

const dropdownSelector =
  'ul.select2-results__options li.select2-results__option';

const addButtonSelector =
  'body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-block-actions > a.js-bned-new-course.btn.btn-secondary.btn-block';

let currentDepartmentIndex = 20; // Select course (20th is ES Department) (7th is CH)
let departmentScope = 0;
let courseScope = 0;
let sectionScope = 0;
const sectionList = [];
let divNumberScope = 2; // The first div-child is 2

// Test Fall and Winter terms
async function scopeDropDown(page, term, divNumber) {
  await sleep(100);
  // Some issues with the div for: div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span
  await waitForSelectorAndPerformAction(
      page,
      'div:nth-child(' +
      divNumber +
      ')> div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span',
      'click',
  );

  if (term == 'F23') {
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await page.click('header');
  } else if (term == 'W24') {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.click('header');
  } else {
    console.log('Term not found');
  }

  // select Department

  await waitForSelectorAndPerformAction(
      page,
      'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
      divNumber +
      ')> div.bned-select-item.js-bned-select-item.department > div > div > select',
      'click',
      100,
  );

  departmentScope = await countDropdownOptions(
      page,
      dropdownSelector,
      'Department',
  );

  await sleep(100);
  await pressKeyMultipleTimes(page, 'ArrowDown', currentDepartmentIndex, 50);
  await page.keyboard.press('Enter');
  await page.click('header');

  // select Course

  await waitForSelectorAndPerformAction(
      page,
      'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
      divNumber +
      ')> div.bned-select-item.js-bned-select-item.course > div > div > select',
      'click',
      300,
  );

  // Don't forget to add 2 later on so it can properly used in functions
  courseScope = await countDropdownOptions(page, dropdownSelector, 'Course');

  await page.click('header');

  for (
    let courseOptionCounter = 0;
    courseOptionCounter < courseScope;
    courseOptionCounter++
  ) {
    await waitForSelectorAndPerformAction(
        page,
        'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
        divNumber +
        ')> div.bned-select-item.js-bned-select-item.course > div > div > select',
        'click',
        200,
    );

    if (courseOptionCounter == 0) {
      console.log('0 courseOptionCounter: ', courseOptionCounter);
      await page.keyboard.press('Enter');

      // count sections for each course
      await waitForSelectorAndPerformAction(
          page,
          'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
          divNumber +
          ')>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select',
          'click',
          800,
      );
      await sleep(800);
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
      await sleep(800);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // count sections for each course
      await waitForSelectorAndPerformAction(
          page,
          'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
          divNumber +
          ')>div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select',
          'click',
          800,
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

  await page.reload();
  return null;
}

async function countDropdownOptions(page, selector, label) {
  try {
    await page.waitForSelector(selector);
    sleep(600);
    var optionsCount = await page.$$eval(selector, (options) => options.length);

    // Get rid of "select" as first option (-1)
    var optionsCount = optionsCount - 1;
    console.log(`${label} Options Counted: `, optionsCount);

    return optionsCount;
  } catch (error) {
    console.error(
        `Error with countDropdownOptions function with selector -'${selector}': `,
        error,
    );
    return null;
  }
}

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

function nullify(value) {
  return value === undefined || value === '' ? 'null' : value;
}

// Plus two only needed first time
async function selectTerm(page, term) {
  let isFirstExecution = true;
  const termSectionScope = sectionScope + 2;
  let activeDivNumberScope = divNumberScope;

  for (; activeDivNumberScope < termSectionScope; activeDivNumberScope++) {
    // Probably move this out of the loop instead of isFirstExecution usage
    if (isFirstExecution && activeDivNumberScope == 2 && sectionScope > 3) {
      // Add 3 instead of 4 to create an extra unused row to ensure selector is the same
      await addAnotherCourseButton(page, addButtonSelector, sectionScope - 3);
      isFirstExecution = false;
    } else if (isFirstExecution && activeDivNumberScope != 2) {
      await addAnotherCourseButton(page, addButtonSelector, sectionScope);
    }

    await waitForSelectorAndPerformAction(
        page,
        'div:nth-child(' +
        activeDivNumberScope +
        ') > div.bned-select-item.js-bned-select-item.terms > div > div > span > span.selection > span',
        'click',
        500,
    );

    if (term == 'F23') {
      await pressKeyMultipleTimes(page, 'ArrowUp', 1, 50);
      sleep(200);
      await page.keyboard.press('Enter');
    } else if (term == 'W24') {
      await pressKeyMultipleTimes(page, 'ArrowDown', 1, 50);
      sleep(200);
      await page.keyboard.press('Enter');
    } else {
      console.log('Term not found');
    }
  }

  sleep(200);
  return page;
}

async function selectDepartment(page) {
  let activeDivNumberScope = divNumberScope;
  const departmentSectionScope = sectionScope + 2;

  const coursesToSelect = {
    ART: 'ART',
    ARTH: 'ARTH',
    ASL: 'ASL',
    BA: 'BA',
    BI: 'BI',
    CCL: 'CCL',
    CH: 'CH',
    COMM: 'COMM',
    COUN: 'COUN',
    CS: 'CS',
    CW: 'CW',
    D: 'D',
    DCIN: 'DCIN',
    EC: 'EC',
    ECE: 'ECE',
    ED: 'ED',
    EE: 'EE',
    EMDA: 'EMDA',
    ENG: 'ENG',
    ERS: 'ERS',
    ES: 'ES',
    GSWS: 'GSWS',
    HCA: 'HCA',
    HE: 'HE',
    HON: 'HON',
    HST: 'HST',
    INL: 'INL',
    IS: 'IS',
    LEAD: 'LEAD',
    LIS: 'LIS',
    MAT: 'MAT',
    MBA: 'MBA',
    MS: 'MS',
    MTH: 'MTH',
    MUP: 'MUP',
    MUS: 'MUS',
    NAS: 'NAS',
    OAL: 'OAL',
    PE: 'PE',
    PEA: 'PEA',
    PH: 'PH',
    PHL: 'PHL',
    PS: 'PS',
    PSY: 'PSY',
    READ: 'READ',
    SAS: 'SAS',
    SC: 'SC',
    SHS: 'SHS',
    SOAN: 'SOAN',
    SPAN: 'SPAN',
    SPED: 'SPED',
    STAT: 'STAT',
    TA: 'TA',
    UGS: 'UGS',
    WR: 'WR',
  };

  for (
    ;
    activeDivNumberScope < departmentSectionScope;
    activeDivNumberScope++
  ) {
    await waitForSelectorAndPerformAction(
        page,
        'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
        activeDivNumberScope +
        ') > div.bned-select-item.js-bned-select-item.department > div > div > select',
        'click',
        1000,
    );

    await sleep(100);
    await page.keyboard.type(coursesToSelect.ES);
    await page.keyboard.press('Enter');
  }
  currentDepartmentIndex++;

  return page;
}

async function selectCourse(page) {
  let activeDivNumberScope = divNumberScope;
  const sectionSectionScope = sectionScope + 2;
  let courseIndex = 0;

  for (; activeDivNumberScope < sectionSectionScope; activeDivNumberScope++) {
    const currentSectionAmount = sectionList[courseIndex];

    if (currentSectionAmount == 1) {
      await sleep(100);

      await waitForSelectorAndPerformAction(
          page,
          'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
          activeDivNumberScope +
          ') > div.bned-select-item.js-bned-select-item.course > div > div > select',
          'click',
          800,
      );

      await sleep(200);
      await pressKeyMultipleTimes(page, 'ArrowDown', courseIndex, 50);
      await page.keyboard.press('Enter');
    } else {
      for (let i = 0; i < currentSectionAmount; i++) {
        await sleep(300);
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
        await sleep(300);
        await pressKeyMultipleTimes(page, 'ArrowDown', courseIndex, 50);
        await page.keyboard.press('Enter');

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
  const sectionSectionScope = sectionScope + 2;
  let sectionOption = 0;
  let courseIndex = 0;

  for (; activeDivNumberScope < sectionSectionScope; activeDivNumberScope++) {
    const currentSectionAmount = sectionList[courseIndex];

    for (let i = 0; i < currentSectionAmount; i++) {
      await sleep(400);

      await waitForSelectorAndPerformAction(
          page,
          'div.bned-rows-block.js-bned-rows-block.js-accessibility-table > div:nth-child(' +
          activeDivNumberScope +
          ') > div.bned-select-item.js-bned-select-item.section.js-bned-course-finder-section > div > div > select',
          'click',
          200,
      );

      await pressKeyMultipleTimes(page, 'ArrowDown', sectionOption, 200);
      await page.keyboard.press('Enter');

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

async function textbookInfoCopier(page) {
  let activeTextbookDiv = 2;
  const totalCourses = sectionScope;
  let previousCourse;
  let courseAmount = 1;

  await waitForSelectorAndPerformAction(
      page,
      'body > div:nth-child(3) > div.main__inner-wrapper > div.yCmsContentSlot.course-finder-center-content-component > div > div > div > div.bned-cf-container > div.bned-course-finder-form-wrapper > form > div > div.bned-buttons-wrapper > div.bned-retrieve-materials-btn.js-bned-retrieve-materials-btn > a',
      'click',
      300,
  );

  // ES has a totalCourses of 21, but only 4 items available for reservation
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
          .replace(/required/gi, ''); // Remove the word 'required'
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
            '_230_' +
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

                  if (title.includes('Print')) {
                    printOptionsCount += optionCount;
                  } else if (title.includes('Rental')) {
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
            if (typeChecker == 'Print') {
              console.log('First Iteration subtracts 1 from Print Count');
              currentPrintCount--;
              console.log(
                  'The Current Type Checker in further is: ',
                  typeChecker,
              );
              console.log('Print Count: ', currentPrintCount);
            } else if (typeChecker == 'Rental') {
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
            if (currentPrintCount == 0 && typeChecker == 'Print') {
              isFirstIterationForFirst = true;
              console.log('Print Count is 0');
            } else if (currentRentalCount == 0 && typeChecker == 'Rental') {
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
                  ') > div.bned-variant-options-section > div:nth-child(' +
                  multipleDivChild +
                  ') > label > span:nth-child(2)',
                  (element) => element.textContent.trim(),
              );

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

            if (typeChecker == 'Print') {
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
            } else if (typeChecker == 'Rental') {
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
        '_230_' +
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
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--single-process'],
  });
  const page = await browser.newPage();

  await page.setCookie({
    name: 'OptanonConsent',
    value:
      'isGpcEnabled=0&datestamp=Sat+Dec+16+2023+19%3A29%3A33+GMT-0800+(Pacific+Standard+Time)&version=202311.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0010%3A1%2CC0002%3A1%2CC0004%3A1%2CC0003%3A1%2CC0001%3A1%2CSPD_BG%3A1',
    domain: 'sou.bncollege.com/course-material/course-finder',
  });

  return page;
}

async function gotoPage(page) {
  await page.goto(pageUrl, {waitUntil: 'networkidle0'});
}

async function selectionPage(page) {
  await selectTerm(page, 'W24');
  await selectDepartment(page);
  await selectCourse(page);
  await selectionSection(page);
  console.log('Div Location: ', divNumberScope);
  console.log('Current Department Index: ', currentDepartmentIndex);
}

async function printables(page) {
  await scopeDropDown(page, 'W24', divNumberScope);
  console.log('After departmentScope: ', departmentScope);
  console.log('After courseScope: ', courseScope);
  console.log('After sectionScope: ', sectionScope);
  console.log('After sectionList: ', sectionList);
}

async function textbookPage(page) {
  await textbookInfoCopier(page);
}

async function main() {
  const page = await createPage();
  await gotoPage(page);
  await printables(page);
  await selectionPage(page);
  await textbookPage(page);
}

main();
