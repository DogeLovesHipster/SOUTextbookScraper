# TextbookScalper

## DISCLAIMER: THIS IS A WORK IN PROGRESS AND NOT FINISHED. I HAVE BEEN GRANTED PERMISSION TO SCALP THIS DATA FOR SOUTHERN OREGON UNIVERSITY. I DO NOT CONDONE SCALPING UNLESS GRANTED PERMISSION FROM THE ORGANIZATION, COMPANY, OR INDIVIDUAL(S). 

### To-do:  
- Collect all data
- Fix one FIXME, add comments in some sections
- Create a simple GUI for tracking purposes (Maybe)
- Add a function for textbook variable scalping to clean up large textbook function
- Fall is no longer in term options, but Spring will appear soon (FIX)

## Notes

- Full ISBN Number
- Need for faculty to report OER course designations -
- OER are any type of educational materials that are in the public domain or introduced with an open (Creative Commons) license.
____
#### OER course designations
- Low-Cost (<$50) Course Materials (LCST)
- All Materials are Provided (ZCST)
- No Course Materials Used (NTRQ)

(For the Low-Cost designation, all required course materials must total less than $50 and the price is based on the price of a new print copy from the bookstore.)

### Coding script will need to consider the following:

- i. Adding all the required course materials together to get the total amount, using the price of the new print version

- ii. If no print version is available, use the price of the cheapest digital version

- iii. Ignore any listed “Recommended” items

- iv. If “Adoption is Still Pending” then no OER attributes will be added to the course

- v. The bookstore doesn’t distinguish between “All Materials are Provided and “No Course Materials Used” so we will combine those 2 categories into “Zero Cost Course Materials (ZCST)”

- We discussed the need for the schedulers to have access to this spreadsheet with enough time to enter the attributes into Banner. Otherwise, the task falls on the Academic Scheduler, which is not manageable. 

- We will want to run the computer script more than once to get the latest data on the same term before class registration occurs. It would be important that the new Excel spreadsheet only lists new data. 

- Timing of running the script needs to be determined based on the scheduling lock down date and class registration. 

- Once the Excel spreadsheet is given to the schedulers, they will enter applicable course designations into Banner.

### Questions

- Will the Excel spreadsheet contain a column with the applicable OER course designation for the schedulers to easily see? The OER course designations would be LCST and ZCST. Refer to the above classifications of LCST and ZCST for details.

### Meeting notes

- DOCUMENT PROVIDED
- Discuss OER specifications (Adoption pending - Pending)
- Provide .csv example / 
- Discuss specific conditions 
- Discuss the need of a GUI and re-usability in future uses
- Discuss the full courses available as there are holes:

 const coursesToSelect = ['ART', 'ARTH', 'ASL', 'BA', 'BI', 'CCL', 'CH', 'COMM', 'COUN', 'CS', 'CW', 'D', 'DCIN', 'EC', 'ECE', 'ED', 'EE', 'EMDA', 'ENG', 'ERS', 'ES', 'GSWS', 'HCA', 'HE', 'HON', 'HST', 'INL', 'IS', 'LEAD', 'LIS', 'MAT', 'MBA', 'MS', 'MTH', 'MUP', 'MUS', 'NAS', 'OAL', 'PE', 'PEA', 'PH', 'PHL', 'PS', 'PSY', 'READ', 'SAS', 'SC', 'SHS', 'SOAN', 'SPAN', 'SPED', 'STAT', 'TA', 'UGS', 'WR'];

 ART - 30
 ARTH - 40
 ARTM - 50
 ASL - 60
 BA - 70
 BI - 80
 ?? - 90
 CCJ - 100
 CH - 110

 OER checkbox?