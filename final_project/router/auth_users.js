const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (!username) return false;
  return !users.find(u => u.username === username);
}

const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  if (!user) return false;
  return user.password === password;
}

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "24h" });

  req.session.authorization = {
    token,
    username
  };

  return res.status(200).json({ message: "Login successful.", token });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  const username = req.session.authorization.username;
  const { review, rating } = req.body;

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  // Store the review with username as key
  book.reviews[username] = { review, rating: rating || null };

  return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  const username = req.session.authorization.username;

  if (!book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user." });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: `Review for ISBN ${isbn} deleted` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
