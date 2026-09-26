function Loader({ fullPage = false, message = 'Loading...' }) {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className="loader-content">
          <div className="spinner"></div>
          <p className="loader-message">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="loader-inline">
      <div className="spinner spinner-sm"></div>
      <span className="loader-inline-message">{message}</span>
    </div>
  )
}

export default Loader
