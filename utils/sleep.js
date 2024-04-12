async function sleep(ms, debug = true ) {
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