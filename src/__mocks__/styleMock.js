module.exports = {
  // Return a Proxy to handle any CSS module imports
  __esModule: true,
  default: new Proxy({}, {
    get: function getter(target, key) {
      // Return the key as the value to mock CSS module classes
      return key;
    }
  })
};
