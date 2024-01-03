async function textbookPriceCalc(textbookPrice1, textbookPrice2 = 0, textbookPrice3 = 0) {
    let textbookPriceTotal = textbookPrice1 + textbookPrice2 + textbookPrice3;

    return textbookPriceTotal;
}

module.exports = {
    textbookPriceCalc,
};