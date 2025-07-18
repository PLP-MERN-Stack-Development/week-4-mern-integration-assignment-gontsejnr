const Post = require("../models/Post");
const Category = require("../models/Category");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

// Get all posts with pagination and filtering
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = "published"; // Default to published posts
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    const posts = await Post.find(query)
      .populate("author", "username firstName lastName avatar")
      .populate("category", "name slug color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username firstName lastName avatar bio")
      .populate("category", "name slug color")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username firstName lastName avatar",
        },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, category, tags, status } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }

    const postData = {
      title,
      content,
      excerpt,
      author: req.user.id,
      category,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      status: status || "draft",
    };

    // Handle image upload
    if (req.file) {
      postData.featuredImage = `/uploads/${req.file.filename}`;
    }

    const post = new Post(postData);
    await post.save();

    await post.populate("author", "username firstName lastName avatar");
    await post.populate("category", "name slug color");

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const { title, content, excerpt, category, tags, status } = req.body;

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (category) post.category = category;
    if (tags) post.tags = tags.split(",").map((tag) => tag.trim());
    if (status) post.status = status;

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (post.featuredImage) {
        const oldImagePath = path.join(__dirname, "..", post.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      post.featuredImage = `/uploads/${req.file.filename}`;
    }

    await post.save();

    await post.populate("author", "username firstName lastName avatar");
    await post.populate("category", "name slug color");

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete associated image
    if (post.featuredImage) {
      const imagePath = path.join(__dirname, "..", post.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      isLiked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
