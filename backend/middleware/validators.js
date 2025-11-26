// middleware/validators.js
const { body } = require("express-validator");

// ==================== SIGNUP VALIDATORS ====================
const signupValidators = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required")
    .custom((value) => {
      if (!value.endsWith("@ustp.edu.ph")) {
        throw new Error("Must use USTP email");
      }
      return true;
    })
    .normalizeEmail(),

  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

// ==================== LOGIN VALIDATORS ====================
const loginValidators = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password required"),
];

module.exports = {
  signupValidators,
  loginValidators,
};
