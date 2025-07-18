const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Validation rules
const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("firstName").isLength({ min: 1 }).withMessage("First name is required"),
  body("lastName").isLength({ min: 1 }).withMessage("Last name is required"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);

module.exports = router;
