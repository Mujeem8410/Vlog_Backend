const express = require("express");
const Post = require("../Models/Post");
const auth = require("../middleware/authMiddleware");
const { createPostValidator, updatePostValidator } = require("../utils/postValidate");
const { validationResult } = require("express-validator");
const { upload } = require("../utils/cloudinary");

const router = express.Router();


router.post("/", auth, upload.single("image"), createPostValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array().map(err => err.msg).join(", ") });

  try {

    const newPost = new Post({
      ...req.body,
      author: req.user,
      imageUrl: req.file ? req.file.path : null,
    });

    await newPost.save();
    res.json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username");
    res.json(posts);
  } catch (err) {
  
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, upload.single("image"), updatePostValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array().map(err => err.msg).join(", ") });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user)
      return res.status(403).json({ message: "Not allowed to edit this post" });

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    if (req.file) post.imageUrl = req.file.path;

    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user)
      return res.status(403).json({ message: "Not allowed to delete this post" });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
