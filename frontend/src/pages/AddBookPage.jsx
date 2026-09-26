import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookForm from '../components/BookForm'
import Toast, { useToast } from '../components/Toast'
import { createBook } from '../services/api'

function AddBookPage() {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    try {
      await createBook(formData)
      addToast(`"${formData.title}" added successfully!`, 'success')
      setTimeout(() => navigate('/books'), 1200)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to add book. Please try again.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => navigate('/books')

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Toast toasts={toasts} removeToast={removeToast} />

        <div className="page-header">
          <div>
            <h1 className="page-title">Add New Book</h1>
            <p className="page-subtitle">Fill in the details to add a new book to the library</p>
          </div>
        </div>

        <div className="form-page-card">
          <div className="form-page-header">
            <div className="form-page-icon">
              <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h2>Book Details</h2>
          </div>
          <BookForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            error={error}
          />
        </div>
      </main>
    </div>
  )
}

export default AddBookPage
