const mongoose = require('mongoose');

/**
 * User Schema
 * Stores registered library users with hashed passwords.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Return a safe user object without the password field.
 */
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

let localStore;
try {
  localStore = require('../services/localStore');
} catch (e) {
  // Ignore if not present
}

const UserProxy = new Proxy(User, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (localStore && localStore.localUser && prop in localStore.localUser) {
      return localStore.localUser[prop];
    }
    return target[prop];
  },
});

module.exports = UserProxy;
