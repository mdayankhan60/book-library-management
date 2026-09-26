const mongoose = require('mongoose');

/**
 * Book Schema
 * Stores book records belonging to a specific user (createdBy).
 */
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [150, 'Author name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: [
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
        ],
        message:
          '{VALUE} is not a valid category. Choose from: Fiction, Non-Fiction, Science, Technology, History, Biography, Mystery, Romance, Self-Help, Other',
      },
    },
    status: {
      type: String,
      default: 'Available',
      enum: {
        values: ['Available', 'Issued'],
        message: '{VALUE} is not a valid status. Choose from: Available, Issued',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Book must belong to a user'],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Index for faster lookup when querying books by user
bookSchema.index({ createdBy: 1 });

// Compound index for search performance
bookSchema.index({ createdBy: 1, status: 1 });
bookSchema.index({ createdBy: 1, category: 1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
