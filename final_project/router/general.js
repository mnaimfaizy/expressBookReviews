const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

let fetchBooks = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(books)
      },3000)
})

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    if (users[username]) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    // Register the new user
    users[username] = { password };
  
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) { 
    fetchBooks.then((books) => {
        return res.status(200).json({ message: "Request received", data: books });
    }).catch((err) => {
        return res.status(404).json({message: "Content not found"})
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    fetchBooks.then((books) => {
        const book = books[isbn];
        if(book) {
            return res.status(200).json(book);
          } else {
              return res.status(404).json({message: "Books by the specified ISBN not found"});
          }
    }).catch((err) => {
        return res.status(500).json({message: "Internal Server Error"})
    });
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  
    fetchBooks.then((books) => {
        const booksByAuthor = [];

        for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            booksByAuthor.push(books[key]);
        }
        }
    
        if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
        } else {
        return res.status(404).json({ message: "Books by the specified author not found" });
        }
    }).catch((err) => {
        return res.status(500).json({message: "Internal Server Error"})
    });

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    fetchBooks.then((books) => {
        const booksByTitle = [];

        for (let key in books) {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
            booksByTitle.push(books[key]);
            }
        }
        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "Books by the specified title not found" });
        }
    }).catch((err) => {
        return res.status(500).json({message: "Internal Server Error"})
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const booksByReview = [];

  for(let key in books) {
    if(books[key]?.isbn?.toLowerCase() === isbn.toLowerCase()) {
        booksByReview.push(books[key]);
    }
  }
  if(booksByReview.length > 0) {
    return res.status(200).json(booksByReview);
  } else {
    return res.status(404).json({message: "Books by the specified ISBN not found"});
  }
});

module.exports.general = public_users;
