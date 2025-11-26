const xss = require("xss");

// strips ALL HTML tags from user input
module.exports = function sanitize(str) {
  return str ? xss(str, { whiteList: {} }) : str;
};


//to import in any route  const sanitize = require("../utils/sanitize");
