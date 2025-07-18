const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/auth");

// Validation rules
const categoryValidation = [
  body("name")
    .isLength({ min: 1, max: 50 })
    .withMessage("Category name must be between 1 and 50 characters"),
  body("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Color must be a valid hex color"),
];

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);

// Protected routes (admin only)
router.post(
  "/",
  authMiddleware,
  categoryValidation,
  categoryController.createCategory
);
router.put(
  "/:id",
  authMiddleware,
  categoryValidation,
  categoryController.updateCategory
);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

module.exports = router;
