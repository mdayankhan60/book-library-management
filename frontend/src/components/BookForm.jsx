import { useState, useEffect } from 'react'

const CATEGORIES = [
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
]

const STATUSES = ['Available', 'Issued']

function BookForm({ initialData, onSubmit, onCancel, loading, error }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Fiction',
    status: 'Available',
  })

  const [formErrors, setFormErrors] = useState({})

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        category: initialData.category || 'Fiction',
        status: initialData.status || 'Available',
      })
    }
  }, [initialData])

  const validate = () => {
    const errs = {}
    if (!formData.title.trim()) errs.title = 'Title is required.'
    if (!formData.author.trim()) errs.author = 'Author is required.'
    if (!formData.category) errs.category = 'Category is required.'
    if (!formData.status) errs.status = 'Status is required.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }
    onSubmit(formData)
  }

  return (
    <form className="book-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-error-banner">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="title">
          Book Title <span className="required">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className={`form-input ${formErrors.title ? 'input-error' : ''}`}
          placeholder="Enter book title"
          value={formData.title}
          onChange={handleChange}
          disabled={loading}
        />
        {formErrors.title && <span className="field-error">{formErrors.title}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="author">
          Author <span className="required">*</span>
        </label>
        <input
          id="author"
          name="author"
          type="text"
          className={`form-input ${formErrors.author ? 'input-error' : ''}`}
          placeholder="Enter author name"
          value={formData.author}
          onChange={handleChange}
          disabled={loading}
        />
        {formErrors.author && <span className="field-error">{formErrors.author}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            className={`form-select ${formErrors.category ? 'input-error' : ''}`}
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {formErrors.category && <span className="field-error">{formErrors.category}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="status">
            Status <span className="required">*</span>
          </label>
          <select
            id="status"
            name="status"
            className={`form-select ${formErrors.status ? 'input-error' : ''}`}
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {formErrors.status && <span className="field-error">{formErrors.status}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              Saving...
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Book
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default BookForm
