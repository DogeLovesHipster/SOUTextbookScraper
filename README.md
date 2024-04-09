# Southern Oregon University Textbook Scalper

## Disclaimer
This is a work in progress and not finished. I have been granted permission to scalp this data for southern oregon university. I do not condone scalping unless granted permission from the organization, company, or individual(s). 

## Description
TextbookScalper is a project aimed at gathering and organizing textbook information from the Southern Oregon University bookstore website, which is managed by Barnes and Noble. The goal is to provide a comprehensive and easily accessible database of textbook data, including details such as term, department, course, section, professor, textbook title, authors, edition, publisher, ISBN, and various pricing options.

## Features
* Scrapes textbook data from the Southern Oregon University bookstore website
* Organizes data into a structured format
* Outputs data to a CSV file for easy viewing and analysis

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run the command `mkdir csv_files` to make the folder
4. Run command `touch csv_files/souTextbooksList.csv` to make the file in csv_files
5. Run this command to insert the headers inside the csv file `echo "term,department,course,section,professor,textbook,authors,edition,publisher,isbn,newPrintPrice,usedPrintPrice,newRentalPrintPrice,usedRentalPrintPrice,rentOnlyPrice,digitalPurchasePrice,digitalRentalPrice,oer" >> csv_files/souTextbooksList.csv`
6. Run `node main.js` to start the program

## Usage
After running `node main.js`, the program will begin scraping data from the bookstore website and outputting it to a CSV file.

## Troubleshooting
Sometimes running puppeteer requires a set of packages if you're running it on a Linux subsystem. Run this command to download all of the necessary packages: `sudo apt install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils`

## Tech Stack
* Puppeteer
* Electron (not currently implemented)

## Contributing
Contributes are currently put on hold as the project develops. Once the full release is provided, contributions will be open and welcome.

## License
N/A

## Authors and Acknowledgment
Developed by Sergio Mendoza

## FAQs
N/A

## Contact
For information, feel free to contact me.

## Screenshots/Demo
N/A

## Future Plans
- Notes will go here on needed changes
- Move file out of main