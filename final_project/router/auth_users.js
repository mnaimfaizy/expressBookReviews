const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {"username": "test", "password": "test@123"}
];
const SECRET_KEY = 'SomeSecreteKey@123';

// Function to check if the username is valid
const isValid = (username) => {
    // Check if the username exists in the users object
    const user = users.filter((user) => user.username === username);
    return user.length > 0;
  };
  
  // Function to authenticate the user
  const authenticatedUser = (username, password) => {
    // Check if the username is valid
    if (!isValid(username)) {
      return false;
    }
  
    // Check if the password matches the stored password
    return users.filter((user) => user.password === password).length > 0;
  };

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Validate user credentials
    if (authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  
    // Generate JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
  
    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.user; // Extracted from the JWT token
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required" });
    }
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Add or modify the review for the specified ISBN
    book.reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated successfully", book });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const username = req.user; // Extracted from the JWT token
  
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the review exists and belongs to the user
    if (book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully", book });
    } else {
      return res.status(404).json({ message: "Review not found or does not belong to the user" });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
