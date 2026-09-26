const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const dbFilePath = path.join(dataDir, 'local_db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readData() {
  if (!fs.existsSync(dbFilePath)) {
    const initialData = {
      users: [],
      books: [
        {
          _id: '65f1a2b3c4d5e6f7a8b9c001',
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          author: 'Robert C. Martin',
          category: 'Technology',
          status: 'Available',
          createdBy: 'all',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          _id: '65f1a2b3c4d5e6f7a8b9c002',
          title: 'The Pragmatic Programmer',
          author: 'Andrew Hunt & David Thomas',
          category: 'Technology',
          status: 'Available',
          createdBy: 'all',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          _id: '65f1a2b3c4d5e6f7a8b9c003',
          title: 'A Brief History of Time',
          author: 'Stephen Hawking',
          category: 'Science',
          status: 'Issued',
          createdBy: 'all',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          _id: '65f1a2b3c4d5e6f7a8b9c004',
          title: 'Sapiens: A Brief History of Humankind',
          author: 'Yuval Noah Harari',
          category: 'History',
          status: 'Available',
          createdBy: 'all',
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ],
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], books: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local DB:', e);
  }
}

function wrapUser(u) {
  if (!u) return null;
  const clone = { ...u };
  clone.toSafeObject = function () {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
    };
  };
  return clone;
}

const localUser = {
  findOne(query) {
    const data = readData();
    let user = null;
    if (query && query.email) {
      user = data.users.find(
        (u) => u.email.toLowerCase() === query.email.toLowerCase()
      );
    }
    const wrapped = wrapUser(user);
    const queryObj = {
      select() {
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(wrapped).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(wrapped).catch(reject);
      },
    };
    return queryObj;
  },

  findById(id) {
    const data = readData();
    const strId = id ? id.toString() : '';
    const user = data.users.find((u) => u._id === strId);
    const wrapped = wrapUser(user);
    const queryObj = {
      select() {
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(wrapped).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(wrapped).catch(reject);
      },
    };
    return queryObj;
  },

  async create(userFields) {
    const data = readData();
    const newUser = {
      _id: crypto.randomBytes(12).toString('hex'),
      name: userFields.name,
      email: userFields.email.toLowerCase(),
      password: userFields.password,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    writeData(data);
    return wrapUser(newUser);
  },
};

const localBook = {
  find(query = {}) {
    const data = readData();
    const userId = query.createdBy ? query.createdBy.toString() : null;

    let results = data.books.filter((b) => {
      // User ownership or system initial books
      if (userId && b.createdBy !== userId && b.createdBy !== 'all') {
        return false;
      }
      if (query.status && b.status !== query.status) {
        return false;
      }
      if (query.category && b.category !== query.category) {
        return false;
      }
      if (query.$or && Array.isArray(query.$or)) {
        const matches = query.$or.some((clause) => {
          if (clause.title && clause.title instanceof RegExp) {
            return clause.title.test(b.title);
          }
          if (clause.author && clause.author instanceof RegExp) {
            return clause.author.test(b.author);
          }
          return false;
        });
        if (!matches) return false;
      }
      return true;
    });

    const chainable = {
      sort(sortObj) {
        if (sortObj && sortObj.createdAt === -1) {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return chainable;
      },
      lean() {
        return Promise.resolve(results);
      },
      then(resolve, reject) {
        return Promise.resolve(results).then(resolve, reject);
      },
    };

    return chainable;
  },

  async findOne(query = {}) {
    const data = readData();
    const id = query._id ? query._id.toString() : null;
    const userId = query.createdBy ? query.createdBy.toString() : null;

    const book = data.books.find((b) => {
      if (id && b._id !== id) return false;
      if (userId && b.createdBy !== userId && b.createdBy !== 'all') return false;
      return true;
    });

    return book ? { ...book } : null;
  },

  async create(bookFields) {
    const data = readData();
    const newBook = {
      _id: crypto.randomBytes(12).toString('hex'),
      title: bookFields.title,
      author: bookFields.author,
      category: bookFields.category,
      status: bookFields.status || 'Available',
      createdBy: bookFields.createdBy ? bookFields.createdBy.toString() : 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.books.unshift(newBook);
    writeData(data);
    return { ...newBook };
  },

  async findOneAndUpdate(query = {}, updateData = {}, options = {}) {
    const data = readData();
    const id = query._id ? query._id.toString() : null;
    const userId = query.createdBy ? query.createdBy.toString() : null;

    const index = data.books.findIndex((b) => {
      if (id && b._id !== id) return false;
      if (userId && b.createdBy !== userId && b.createdBy !== 'all') return false;
      return true;
    });

    if (index === -1) return null;

    const updated = {
      ...data.books[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    data.books[index] = updated;
    writeData(data);
    return { ...updated };
  },

  async findOneAndDelete(query = {}) {
    const data = readData();
    const id = query._id ? query._id.toString() : null;
    const userId = query.createdBy ? query.createdBy.toString() : null;

    const index = data.books.findIndex((b) => {
      if (id && b._id !== id) return false;
      if (userId && b.createdBy !== userId && b.createdBy !== 'all') return false;
      return true;
    });

    if (index === -1) return null;

    const [deleted] = data.books.splice(index, 1);
    writeData(data);
    return { ...deleted };
  },

  async countDocuments(query = {}) {
    const books = await this.find(query);
    return books.length;
  },
};

module.exports = {
  localUser,
  localBook,
  readData,
};
