const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// All book routes require a valid JWT
router.use(auth);

// ─── Helper: validate MongoDB ObjectId ───────────────────────────────────────

/**
 * Returns true if the given string is a valid MongoDB ObjectId.
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET /api/books ───────────────────────────────────────────────────────────

/**
 * Get all books belonging to the logged-in user.
 *
 * Query parameters (all optional):
 *  - search   {string} – case-insensitive substring match on title or author
 *  - status   {string} – filter by 'Available' or 'Issued'
 *  - category {string} – filter by category name
 *
 * Response includes total count and filtered results.
 */
router.get('/', async (req, res) => {
  try {
    const { search, status, category } = req.query;

    // Build query – always scope to the current user
    const query = { createdBy: req.user._id };

    // Status filter
    if (status && status.trim() !== '') {
      const validStatuses = ['Available', 'Issued'];
      if (!validStatuses.includes(status.trim())) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Valid values: ${validStatuses.join(', ')}`,
        });
      }
      query.status = status.trim();
    }

    // Category filter
    if (category && category.trim() !== '') {
      const validCategories = [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Mystery',
        'Romance',
        'Self-Help',
        'Other',
      ];
      if (!validCategories.includes(category.trim())) {
        return res.status(400).json({
          success: false,
          message: `Invalid category filter. Valid values: ${validCategories.join(', ')}`,
        });
      }
      query.category = category.trim();
    }

    // Search filter – match title OR author (case-insensitive)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { author: searchRegex }];
    }

    const books = await Book.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: {
        total: books.length,
        books,
      },
    });
  } catch (error) {
    console.error('Get all books error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching books.',
    });
  }
});

// ─── GET /api/books/:id ───────────────────────────────────────────────────────

/**
 * Get a single book by ID.
 *
 * Validates:
 *  - :id is a valid ObjectId
 *  - The book exists
 *  - The book belongs to the logged-in user
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format.',
      });
    }

    const book = await Book.findById(id).lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    // Ownership check
    if (book.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this book.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book retrieved successfully',
      data: { book },
    });
  } catch (error) {
    console.error('Get book by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the book.',
    });
  }
});

// ─── POST /api/books ──────────────────────────────────────────────────────────

/**
 * Create a new book.
 *
 * Body: { title, author, category, status? }
 *
 * Validations:
 *  - title:    required, non-empty string
 *  - author:   required, non-empty string
 *  - category: required, must be one of the valid enum values
 *  - status:   optional, defaults to 'Available', must be 'Available' or 'Issued'
 */
router.post('/', async (req, res) => {
  try {
    const { title, author, category, status } = req.body;

    const validCategories = [
      'Fiction',
      'Non-Fiction',
      'Science',
      'Technology',
      'History',
      'Biography',
      'Mystery',
      'Romance',
      'Self-Help',
      'Other',
    ];
    const validStatuses = ['Available', 'Issued'];

    // ── Validation ─────────────────────────────────────────────────────────────
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('Title is required.');
    }

    if (!author || typeof author !== 'string' || author.trim() === '') {
      errors.push('Author is required.');
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      errors.push('Category is required.');
    } else if (!validCategories.includes(category.trim())) {
      errors.push(
        `Invalid category. Valid options: ${validCategories.join(', ')}`
      );
    }

    if (status !== undefined && status !== null && status !== '') {
      if (!validStatuses.includes(status)) {
        errors.push(
          `Invalid status. Valid options: ${validStatuses.join(', ')}`
        );
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // ── Create book ────────────────────────────────────────────────────────────
    const bookData = {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      createdBy: req.user._id,
    };

    if (status) {
      bookData.status = status;
    }

    const book = await Book.create(bookData);

    return res.status(201).json({
      success: true,
      message: 'Book added to the library successfully.',
      data: { book },
    });
  } catch (error) {
    console.error('Create book error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while adding the book.',
    });
  }
});

// ─── PUT /api/books/:id ───────────────────────────────────────────────────────

/**
 * Update an existing book.
 *
 * Body: { title?, author?, category?, status? }
 *  - At least one field must be provided
 *  - All provided fields are validated
 *  - Only the owner can update the book
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format.',
      });
    }

    const { title, author, category, status } = req.body;

    const validCategories = [
      'Fiction',
      'Non-Fiction',
      'Science',
      'Technology',
      'History',
      'Biography',
      'Mystery',
      'Romance',
      'Self-Help',
      'Other',
    ];
    const validStatuses = ['Available', 'Issued'];

    // ── Validation ─────────────────────────────────────────────────────────────
    const errors = [];

    // At least one field must be provided
    if (
      title === undefined &&
      author === undefined &&
      category === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'No fields provided for update. Supply at least one of: title, author, category, status.',
      });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        errors.push('Title must be a non-empty string.');
      }
    }

    if (author !== undefined) {
      if (typeof author !== 'string' || author.trim() === '') {
        errors.push('Author must be a non-empty string.');
      }
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        errors.push('Category must be a non-empty string.');
      } else if (!validCategories.includes(category.trim())) {
        errors.push(
          `Invalid category. Valid options: ${validCategories.join(', ')}`
        );
      }
    }

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        errors.push(
          `Invalid status. Valid options: ${validStatuses.join(', ')}`
        );
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // ── Find the book ──────────────────────────────────────────────────────────
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    // Ownership check
    if (book.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this book.',
      });
    }

    // ── Apply updates ──────────────────────────────────────────────────────────
    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (category !== undefined) book.category = category.trim();
    if (status !== undefined) book.status = status;

    const updatedBook = await book.save();

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      data: { book: updatedBook },
    });
  } catch (error) {
    console.error('Update book error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the book.',
    });
  }
});

// ─── DELETE /api/books/:id ────────────────────────────────────────────────────

/**
 * Delete a book by ID.
 *
 * Validates:
 *  - :id is a valid ObjectId
 *  - The book exists
 *  - The book belongs to the logged-in user
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format.',
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    // Ownership check
    if (book.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this book.',
      });
    }

    await book.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
      data: { deletedBookId: id },
    });
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the book.',
    });
  }
});

module.exports = router;
