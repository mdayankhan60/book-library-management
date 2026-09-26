function StatsCard({ icon, label, value, color, gradient }) {
  return (
    <div className="stats-card" style={{ '--card-gradient': gradient, '--card-color': color }}>
      <div className="stats-card-content">
        <div className="stats-card-info">
          <p className="stats-card-label">{label}</p>
          <h2 className="stats-card-value">{value}</h2>
        </div>
        <div className="stats-card-icon" style={{ background: color }}>
          {icon}
        </div>
      </div>
      <div className="stats-card-bar" style={{ background: color }} />
    </div>
  )
}

export default StatsCard
