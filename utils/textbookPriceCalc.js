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
        } else if (key.includes('Digital') && price < cheapestDigitalPrice) {
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
