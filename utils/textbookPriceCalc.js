

/**
 * Calculates the textbook price based on the given textbooks object.
 * The price is determined by the following rules:
 * - If a new print version is available, the price of the cheapest new print version is used.
 * - If no new print version is available, the price of the cheapest used print version is used.
 * - If no print version is available, the price of the cheapest digital version is used.
 *
 * @param {Object} textbooks - The textbooks object containing the prices.
 * @returns {number} - The calculated textbook price.
 */
/*
- i. Adding all the required course materials together to get the total amount, using the price of the new print version

- ii. If no print version is available, use the price of the cheapest digital version
*/

async function textbookPriceCalc(textbooks) {
    let cheapestNewPrintPrice = Infinity;
    let cheapestPrintPrice = Infinity;
    let cheapestDigitalPrice = Infinity;

    for (const key in textbooks) {
        const price = parseFloat(textbooks[key].replace('$', ''));

        if (key.includes('newPrintPrice') && price < cheapestNewPrintPrice) {
            cheapestNewPrintPrice = price;
        } else if (key.includes('usedPrintPrice') && price < cheapestPrintPrice) {
            cheapestPrintPrice = price;
        } else if (key.includes('digital') && price < cheapestDigitalPrice) {
            cheapestDigitalPrice = price;
        } 
    }

    if (cheapestNewPrintPrice !== Infinity) {
        return cheapestNewPrintPrice;
    } else if (cheapestPrintPrice !== Infinity) {
        return cheapestPrintPrice;
    } else {
        return cheapestDigitalPrice;
    }
}

module.exports = {
    textbookPriceCalc,
};
