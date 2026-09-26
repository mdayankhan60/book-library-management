function BookTable({ books, onEdit, onDelete, onToggleStatus }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!books || books.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" fill="none" stroke="#cbd5e0" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <h3>No books found</h3>
        <p>Add your first book to get started.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Status</th>
            <th>Added Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => {
            const isAvailable = book.status === 'Available'
            return (
              <tr key={book._id}>
                <td className="table-index">{index + 1}</td>
                <td>
                  <div className="table-book-title">{book.title}</div>
                </td>
                <td className="table-author">{book.author}</td>
                <td>
                  <span className="category-tag">{book.category}</span>
                </td>
                <td>
                  <span className={`status-badge ${isAvailable ? 'badge-available' : 'badge-issued'}`}>
                    {book.status || 'Available'}
                  </span>
                </td>
                <td className="table-date">{formatDate(book.createdAt)}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className={`btn btn-xs ${isAvailable ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => onToggleStatus(book)}
                      title={isAvailable ? 'Mark as Issued' : 'Mark as Available'}
                    >
                      {isAvailable ? 'Issue' : 'Return'}
                    </button>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => onEdit(book._id)}
                      title="Edit"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="btn btn-xs btn-danger"
                      onClick={() => onDelete(book)}
                      title="Delete"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default BookTable
