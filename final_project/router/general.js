const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Helper: get all books as a Promise
function getBooks() {
  return new Promise((resolve, reject) => {
    if (books && Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject(new Error("No books available."));
    }
  });
}

// Helper: get book by ISBN as a Promise
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found."));
    }
  });
}

// Helper: get books by author as a Promise
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const authorLower = author.toLowerCase();
    const matching = {};
    Object.keys(books).forEach((key) => {
      if (books[key].author.toLowerCase().includes(authorLower)) {
        matching[key] = books[key];
      }
    });
    if (Object.keys(matching).length > 0) {
      resolve(matching);
    } else {
      reject(new Error("No books found for this author."));
    }
  });
}

// Helper: get books by title as a Promise
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const titleLower = title.toLowerCase();
    const matching = {};
    Object.keys(books).forEach((key) => {
      if (books[key].title.toLowerCase().includes(titleLower)) {
        matching[key] = books[key];
      }
    });
    if (Object.keys(matching).length > 0) {
      resolve(matching);
    } else {
      reject(new Error("No books found with this title."));
    }
  });
}

// Helper: get reviews by ISBN as a Promise
function getReviewsByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book.reviews);
    } else {
      reject(new Error("Book not found."));
    }
  });
}

// Get the book list available in the shop (using async/await)
public_users.get('/', async function (req, res) {
  try {
    const result = await getBooks();
    return res.status(200).send(JSON.stringify(result, null, 2));
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get book details based on ISBN (using async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await getBookByISBN(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 2));
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
 });

// Get book details based on author (using async/await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const matchingBooks = await getBooksByAuthor(req.params.author);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 2));
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get all books based on title (using async/await)
public_users.get('/title/:title', async function (req, res) {
  try {
    const matchingBooks = await getBooksByTitle(req.params.title);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 2));
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

//  Get book review (using async/await)
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const reviews = await getReviewsByISBN(req.params.isbn);
    return res.status(200).send(JSON.stringify(reviews, null, 2));
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

module.exports.general = public_users;
