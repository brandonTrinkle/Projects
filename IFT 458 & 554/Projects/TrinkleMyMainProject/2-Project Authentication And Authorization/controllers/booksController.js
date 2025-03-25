const Book = require('../models/bookModel');

// ================================================
// GET all books
// ================================================
exports.getBooks = async (req, res) => {
  console.log('📚 [GET] getBooks called');

  try {
    const books = await Book.find();

    if (books && books.length > 0) {
      console.log(`📦 [GET] Found ${books.length} books.`);
      res.status(200).json(books);
    } else {
      console.log('⚠️ [GET] No books found. Rendering exchange form...');
      res.render('bookExchageForm', {
        title: 'Add Book Exchange',
        user: req.user,
        books: [],
        api_version: process.env.API_VERSION
      });
    }
  } catch (err) {
    console.error('❌ [GET] Error fetching books:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================================================
// GET a single book by ID
// ================================================
exports.getBookById = async (req, res) => {
  console.log('📚 [GET] getBookById called with ID:', req.params.id);

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      console.warn('❌ [GET] Book not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Book not found' });
    }

    console.log('✅ [GET] Book found:', book.title);
    res.status(200).json(book);
  } catch (err) {
    console.error('❌ [GET] Error fetching book:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================================================
// CREATE a new book
// ================================================
exports.createBook = async (req, res) => {
    console.log('📚 [POST] createBook called');
    console.log('👤 [POST] User:', req.user?.email);
    console.log('📦 [POST] Payload:', req.body);
  
    try {
      // Inject user ID as book owner
      const bookData = {
        ...req.body,
        owner: req.user._id
      };
  
      const book = await Book.create(bookData);
      console.log('✅ [POST] Book created:', book);
  
      res.status(201).json({
        status: 'success',
        data: { book }
      });
    } catch (err) {
      console.error('❌ [POST] Error creating book:', err.message);
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  };  

// ================================================
// UPDATE a book by ID
// ================================================
exports.updateBook = async (req, res) => {
  console.log('📚 [PUT] updateBook called for ID:', req.params.id);

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      console.warn('❌ [PUT] Book not found:', req.params.id);
      return res.status(404).json({ message: 'Book not found' });
    }

    Object.assign(book, req.body); // simple merge

    const updatedBook = await book.save();
    console.log('✅ [PUT] Book updated:', updatedBook.title);
    res.status(200).json(updatedBook);
  } catch (err) {
    console.error('❌ [PUT] Error updating book:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================================================
// DELETE a book by ID
// ================================================
exports.deleteBook = async (req, res) => {
  console.log('📚 [DELETE] deleteBook called for ID:', req.params.id);

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      console.warn('❌ [DELETE] Book not found:', req.params.id);
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.deleteOne();
    console.log('✅ [DELETE] Book deleted:', book.title);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('❌ [DELETE] Error deleting book:', err.message);
    res.status(500).json({ message: err.message });
  }
};
