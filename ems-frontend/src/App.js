import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Hotels from './pages/Hotels';
import Investors from './pages/Investors';
import Presenters from './pages/Presenters';
import Reservations from './pages/Reservations';
import Report from './pages/Report';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>

        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#1a1a2e' }}>
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">
              <i className="fas fa-calendar-check me-2"></i>
              EMS System
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/hotels">
                    <i className="fas fa-hotel me-1"></i> Hotels
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/investors">
                    <i className="fas fa-briefcase me-1"></i> Investors
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/presenters">
                    <i className="fas fa-microphone me-1"></i> Presenters
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/reservations">
                    <i className="fas fa-calendar-plus me-1"></i> Reservations
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/report">
                    <i className="fas fa-chart-bar me-1"></i> Report
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/settings">
                    <i className="fas fa-cog me-1"></i> Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/presenters" element={<Presenters />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/report" element={<Report />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

// Home Page
function Home() {
  return (
    <div className="text-center py-5">
      <h1 className="display-4 fw-bold mb-3" style={{ color: '#1a1a2e' }}>
        <i className="fas fa-calendar-check me-3"></i>
        Event Management System
      </h1>
      <p className="lead text-muted mb-5">
        Manage investor and presenter meetings efficiently
      </p>
      <div className="row g-4 justify-content-center">
        {[
          { to: '/hotels', icon: 'fa-hotel', label: 'Hotels', color: '#4361ee', desc: 'Manage hotels and conference rooms' },
          { to: '/investors', icon: 'fa-briefcase', label: 'Investors', color: '#3a0ca3', desc: 'Manage investor information' },
          { to: '/presenters', icon: 'fa-microphone', label: 'Presenters', color: '#7209b7', desc: 'Manage presenter information' },
          { to: '/reservations', icon: 'fa-calendar-plus', label: 'Reservations', color: '#f72585', desc: 'Book meetings between investors and presenters' },
          { to: '/report', icon: 'fa-chart-bar', label: 'Report', color: '#4cc9f0', desc: 'View all reservations' },
          { to: '/settings', icon: 'fa-cog', label: 'Settings', color: '#2d6a4f', desc: 'Configure slot duration and system settings' },
        
        ].map((item) => (
          <div className="col-md-4 col-sm-6" key={item.to}>
            <Link to={item.to} className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: 70, height: 70, backgroundColor: item.color }}>
                    <i className={`fas ${item.icon} fa-2x text-white`}></i>
                  </div>
                  <h5 className="fw-bold" style={{ color: item.color }}>{item.label}</h5>
                  <p className="text-muted small">{item.desc}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;