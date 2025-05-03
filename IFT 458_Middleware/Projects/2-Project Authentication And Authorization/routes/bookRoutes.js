const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const authenticateAuthorize = require('../custom-middlewares/authMiddleware');

// Authenticate middleware
const authenticate = authenticateAuthorize.authenticate;

// Authorize middleware;
const authorize = authenticateAuthorize.authorize;

// GET all books
// note that the authenticate and authorize middleware are passed as arguments
// the node frameworks allows you to pass as many middleware as you want
router.get('/', authenticate, authorize, booksController.getBooks);

// GET a specific book by ID
// note that the authenticate and authorize middleware are passed as arguments
// the node frameworks allows you to pass as many middleware as you want
router.get('/:id', authenticate, authorize, booksController.getBookById);

// POST a new book
// note that the authenticate and authorize middleware are passed as arguments
// the node frameworks allows you to pass as many middleware as you want
router.post('/', authenticate, authorize, booksController.createBook);

// PUT (update) an existing book by ID

// note that the authenticate and authorize middleware are passed as arguments
// the node frameworks allows you to pass as many middleware as you want
router.put('/:id', authenticate, authorize, booksController.updateBook);

// DELETE a book by ID
// note that the authenticate and authorize middleware are passed as arguments
// the node frameworks allows you to pass as many middleware as you want
router.delete('/:id', authenticate, authorize, booksController.deleteBook);

module.exports = router;
