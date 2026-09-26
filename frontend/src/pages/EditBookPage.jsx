import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookForm from '../components/BookForm'
import Loader from '../components/Loader'
import Toast, { useToast } from '../components/Toast'
import { getBook, updateBook } from '../services/api'

function EditBookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const [bookData, setBookData] = useState(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const fetchBook = async () => {
      setFetchLoading(true)
      setFetchError('')
      try {
        const res = await getBook(id)
        setBookData(res.data.book || res.data)
      } catch {
        setFetchError('Failed to load book details. Please try again.')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchBook()
  }, [id])

  const handleSubmit = async (formData) => {
    setSubmitLoading(true)
    setSubmitError('')
    try {
      await updateBook(id, formData)
      addToast(`"${formData.title}" updated successfully!`, 'success')
      setTimeout(() => navigate('/books'), 1200)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to update book. Please try again.'
      setSubmitError(msg)
      addToast(msg, 'error')
    } finally {
      setSubmitLoading(false)
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
            <h1 className="page-title">Edit Book</h1>
            <p className="page-subtitle">Update the book information below</p>
          </div>
        </div>

        <div className="form-page-card">
          <div className="form-page-header">
            <div className="form-page-icon" style={{ background: '#2980b9' }}>
              <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h2>Edit Book Details</h2>
          </div>

          {fetchLoading ? (
            <Loader message="Loading book details..." />
          ) : fetchError ? (
            <div className="error-state">
              <p>{fetchError}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : (
            <BookForm
              initialData={bookData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={submitLoading}
              error={submitError}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default EditBookPage
