/**
 * Sleeps for a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 * @param {boolean} [debug=false] - Whether to enable debug mode. If true, the function will log the location it is sleeping in the console. Defaults to false.
 * @returns {Promise<void>} - A promise that resolves after the specified time.
 */
async function sleep(ms, debug = false ) {
  if (debug) {
    console.log(`Sleeping for ${ms} milliseconds...`);
    const stack = new Error().stack.split('\n');
    console.log('Called', stack[2].trim());
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  sleep,
};