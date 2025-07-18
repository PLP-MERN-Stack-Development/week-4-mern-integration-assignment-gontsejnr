const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/auth");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "post-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Validation rules
const postValidation = [
  body("title")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("content").isLength({ min: 1 }).withMessage("Content is required"),
  body("excerpt")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Excerpt cannot exceed 200 characters"),
  body("category").isMongoId().withMessage("Valid category ID is required"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either draft or published"),
];

// Public routes
router.get("/", postController.getPosts);
router.get("/:id", postController.getPost);

// Protected routes
router.post(
  "/",
  authMiddleware,
  upload.single("featuredImage"),
  postValidation,
  postController.createPost
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("featuredImage"),
  postValidation,
  postController.updatePost
);
router.delete("/:id", authMiddleware, postController.deletePost);
router.post("/:id/like", authMiddleware, postController.toggleLike);

module.exports = router;
