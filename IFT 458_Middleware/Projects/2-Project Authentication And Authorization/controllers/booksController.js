const Book = require('../models/bookModel');

// GET all books
exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        if(books && books.length > 0  ){
            res.status(200).json(books);}
        else{
            // in API you will send 
            // res.status(404).json({ message: 'No books found' });
            // but in UI you will render a view
            res.render('bookExchageForm', { title: 'Add Book Exchange', user: req.user, books: books, api_version: process.env.API_VERSION });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET a single book by ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE a new book
exports.createBook = async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        genre: req.body.genre,
        price: req.body.price,
    });

    try {
        const newBook = await book.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// UPDATE a book by ID
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.description = req.body.description || book.description;
        book.genre = req.body.genre || book.genre;
        book.price = req.body.price || book.price;

        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE a book by ID
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await book.remove();
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
