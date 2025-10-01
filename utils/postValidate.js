const { body } = require("express-validator");


const createPostValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),
];

const updatePostValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),
];

module.exports = { createPostValidator, updatePostValidator };