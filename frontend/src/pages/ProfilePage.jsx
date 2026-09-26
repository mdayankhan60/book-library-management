import Navbar from '../components/Navbar'

function ProfilePage() {
  const userRaw = localStorage.getItem('user')
  let user = { name: 'User', email: 'user@example.com', createdAt: null }
  try {
    if (userRaw) user = { ...user, ...JSON.parse(userRaw) }
  } catch {
    // use default
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  const joinedDate = user.createdAt || user.joinedAt || null

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Your account information</p>
          </div>
        </div>

        <div className="profile-layout">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">{initials}</div>
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-email">{user.email}</p>
              <span className="profile-role-badge">Library Member</span>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <svg width="20" height="20" fill="none" stroke="#2980b9" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span className="profile-stat-label">Library Access</span>
                <span className="profile-stat-value">Full Access</span>
              </div>
              <div className="profile-stat">
                <svg width="20" height="20" fill="none" stroke="#27ae60" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="profile-stat-label">Account Status</span>
                <span className="profile-stat-value" style={{ color: '#27ae60' }}>Active</span>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="profile-info-section">
            <div className="info-card">
              <h3 className="info-card-title">
                <svg width="18" height="18" fill="none" stroke="#2980b9" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Personal Information
              </h3>

              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user.name || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role</span>
                  <span className="info-value">
                    <span className="profile-role-badge">{user.role || 'Member'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3 className="info-card-title">
                <svg width="18" height="18" fill="none" stroke="#2980b9" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Account Details
              </h3>

              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{formatDate(joinedDate)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">User ID</span>
                  <span className="info-value user-id-value">
                    {user._id || user.id || 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Account Type</span>
                  <span className="info-value">Standard</span>
                </div>
              </div>
            </div>

            <div className="info-card info-card-highlight">
              <div className="info-card-highlight-inner">
                <svg width="32" height="32" fill="none" stroke="#1e3a5f" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <h4>Your account is secure</h4>
                  <p>All your data is safely stored and encrypted.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
