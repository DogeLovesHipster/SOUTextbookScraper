

/**
 * Determines the OER (Open Educational Resources) designation for a course based on the price of course materials and the textbook status.
 * @param {number|string} price - The price of the course materials. If a string is provided, it should be in the format '$XX.XX'.
 * @param {string} textbookStatus - The status of the course materials. Possible values are 'No Course Materials Required', 'Course Materials Selection Pending', or any other value indicating that course materials are required.
 * @returns {string} - The OER designation for the course. Possible values are 'LCST' (Low-Cost Course Materials), 'ZCST' (Zero Cost Course Materials), or 'null' if the course does not meet the criteria for any designation.
 */
// Mathmatical functions for OER Course Designations

/*
- The bookstore doesn’t distinguish between “All Materials are Provided and “No Course Materials Used” so we will combine those 2 categories into “Zero Cost Course Materials (ZCST)

(For the Low-Cost designation, all required course materials must total less than $50 and the price is based on the price of a new print copy from the bookstore.)
*/

async function oerCourseDesignations(price, textbookStatus) {
    /*
    - Low-Cost (<$50) Course Materials (LCST)
    - All Materials are Provided (ZCST)
    - No Course Materials Used (NTRQ)
    - Course Materials Selection Pending (No OER Designation)
    */

    // For testing purposes, feel free to remove if needed
    if (typeof price === 'string') {
        if (price.includes('$')) {
            price = parseFloat(price.replace('$', ''));
        }
    }

    let oerDesignation = '';
    if (price <= 49.99 && price !== 0.00) {
        oerDesignation = 'LCST';
    } else if (textbookStatus === 'No Course Materials Required') {
        oerDesignation = 'ZCST';
    } else if (textbookStatus === 'Course Materials Selection Pending') {
        oerDesignation = 'null';
    } else {
        console.log("Price is either too high (" + price + ") or textbookStatus is not 'No Course Materials Required' or 'Course Materials Selection Pending' (" + textbookStatus + ")");
        console.log("Likely to be either an error, not meet price requirements, or have no status.")
        oerDesignation = 'null';
    }

    return oerDesignation;
}

module.exports = {
    oerCourseDesignations,
};
