import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatsCard from '../components/StatsCard'
import BookTable from '../components/BookTable'
import Loader from '../components/Loader'
import Modal from '../components/Modal'
import Toast, { useToast } from '../components/Toast'
import { getBooks, deleteBook, updateBook } from '../services/api'

function DashboardPage() {
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

  const CATEGORIES = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology',
    'History', 'Biography', 'Mystery', 'Romance', 'Self-Help', 'Other',
  ]

  const fetchBooks = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getBooks()
      const booksList = res.data?.data?.books || res.data?.books || res.data?.data || []
      setBooks(Array.isArray(booksList) ? booksList : [])
    } catch (err) {
      setError('Failed to load books. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  // Derived stats
  const totalBooks = books.length
  const availableBooks = books.filter((b) => b.status === 'Available').length
  const issuedBooks = books.filter((b) => b.status === 'Issued').length
  const uniqueCategories = [...new Set(books.map((b) => b.category).filter(Boolean))].length

  // Filtered books for the table
  const filtered = books.filter((b) => {
    const matchSearch =
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    const matchCategory = !categoryFilter || b.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  // Recently added (last 5)
  const recentBooks = [...filtered]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

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
      addToast('Failed to update status.', 'error')
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Toast toasts={toasts} removeToast={removeToast} />

        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your library collection</p>
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

        {/* Stats */}
        <div className="stats-grid">
          <StatsCard
            label="Total Books"
            value={totalBooks}
            color="#2980b9"
            gradient="linear-gradient(135deg, #1e3a5f 0%, #2980b9 100%)"
            icon={
              <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            }
          />
          <StatsCard
            label="Available"
            value={availableBooks}
            color="#27ae60"
            gradient="linear-gradient(135deg, #1a5e38 0%, #27ae60 100%)"
            icon={
              <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
          <StatsCard
            label="Issued"
            value={issuedBooks}
            color="#e67e22"
            gradient="linear-gradient(135deg, #7d4a0f 0%, #e67e22 100%)"
            icon={
              <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            }
          />
          <StatsCard
            label="Categories"
            value={uniqueCategories}
            color="#8e44ad"
            gradient="linear-gradient(135deg, #4a235a 0%, #8e44ad 100%)"
            icon={
              <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            }
          />
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
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            {['All', 'Available', 'Issued'].map((s) => (
              <button
                key={s}
                className={`filter-btn ${statusFilter === s ? 'filter-btn-active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
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

        {/* Recently Added Table */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-title">Recently Added Books</h2>
            <Link to="/books" className="view-all-link">
              View All →
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading books..." />
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchBooks}>Retry</button>
            </div>
          ) : (
            <BookTable
              books={recentBooks}
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

export default DashboardPage
