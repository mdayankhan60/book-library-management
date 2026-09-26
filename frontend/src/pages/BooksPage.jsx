import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookTable from '../components/BookTable'
import Loader from '../components/Loader'
import Modal from '../components/Modal'
import Toast, { useToast } from '../components/Toast'
import { getBooks, deleteBook, updateBook } from '../services/api'

const CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology',
  'History', 'Biography', 'Mystery', 'Romance', 'Self-Help', 'Other',
]

function BooksPage() {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [deleteModal, setDeleteModal] = useState({ open: false, book: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchBooks = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getBooks()
      const booksList = res.data?.data?.books || res.data?.books || res.data?.data || []
      setBooks(Array.isArray(booksList) ? booksList : [])
    } catch {
      setError('Failed to load books. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const filtered = books.filter((b) => {
    const matchSearch =
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    const matchCategory = !categoryFilter || b.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleEdit = (id) => navigate(`/books/edit/${id}`)

  const handleDeleteOpen = (book) => setDeleteModal({ open: true, book })
  const handleDeleteClose = () => setDeleteModal({ open: false, book: null })

  const handleDeleteConfirm = async () => {
    if (!deleteModal.book) return
    setDeleteLoading(true)
    try {
      await deleteBook(deleteModal.book._id)
      setBooks((prev) => prev.filter((b) => b._id !== deleteModal.book._id))
      addToast(`"${deleteModal.book.title}" deleted successfully.`, 'success')
      handleDeleteClose()
    } catch {
      addToast('Failed to delete book.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleStatus = async (book) => {
    const newStatus = book.status === 'Available' ? 'Issued' : 'Available'
    try {
      await updateBook(book._id, { ...book, status: newStatus })
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, status: newStatus } : b))
      )
      addToast(`"${book.title}" marked as ${newStatus}.`, 'success')
    } catch {
      addToast('Failed to update book status.', 'error')
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Toast toasts={toasts} removeToast={removeToast} />

        <div className="page-header">
          <div>
            <h1 className="page-title">All Books</h1>
            <p className="page-subtitle">
              {filtered.length} of {books.length} books
            </p>
          </div>
          <Link to="/books/add" className="btn btn-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Book
          </Link>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-wrapper">
            <svg width="18" height="18" fill="none" stroke="#a0aec0" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                ×
              </button>
            )}
          </div>

          <div className="filter-buttons">
            {['All', 'Available', 'Issued'].map((s) => (
              <button
                key={s}
                className={`filter-btn ${statusFilter === s ? 'filter-btn-active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'All' && `All (${books.length})`}
                {s === 'Available' && `Available (${books.filter(b => b.status === 'Available').length})`}
                {s === 'Issued' && `Issued (${books.filter(b => b.status === 'Issued').length})`}
              </button>
            ))}
          </div>

          <select
            className="form-select filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Books Table */}
        <div className="section-card">
          {loading ? (
            <Loader message="Loading books..." />
          ) : error ? (
            <div className="error-state">
              <svg width="48" height="48" fill="none" stroke="#e53e3e" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchBooks}>
                Try Again
              </button>
            </div>
          ) : (
            <BookTable
              books={filtered}
              onEdit={handleEdit}
              onDelete={handleDeleteOpen}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>

        <Modal
          isOpen={deleteModal.open}
          title="Delete Book"
          message={`Are you sure you want to delete "${deleteModal.book?.title}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteClose}
          loading={deleteLoading}
        />
      </main>
    </div>
  )
}

export default BooksPage
