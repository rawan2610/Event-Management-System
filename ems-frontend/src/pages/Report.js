import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getReservations } from '../services/api';


export default function Report() {
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchReservations(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(reservations.filter(r =>
      r.investorName.toLowerCase().includes(q) ||
      r.presenterName.toLowerCase().includes(q) ||
      r.sectorName.toLowerCase().includes(q) ||
      r.hotelName.toLowerCase().includes(q) ||
      r.roomName.toLowerCase().includes(q)
    ));
  }, [search, reservations]);

  const fetchReservations = async () => {
    try {
      const res = await getReservations();
      setReservations(res.data);
      setFiltered(res.data);
    } catch { toast.error('Failed to load reservations'); }
    finally { setLoading(false); }
  };

  const sectorColors = {
    'Finance': '#4361ee', 'IT': '#3a0ca3', 'Restaurants': '#f72585',
    'Real Estate': '#7209b7', 'Retail': '#4cc9f0', 'Healthcare': '#06d6a0',
    'Education': '#ffd166', 'Manufacturing': '#ef476f', 'Tourism': '#118ab2', 'Media': '#073b4c'
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fas fa-chart-bar me-2"></i>Reservations Report
        </h2>
        <span className="badge bg-primary fs-6">{filtered.length} Total</span>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <input className="form-control" placeholder="Search by investor, presenter, sector, hotel..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-calendar-times fa-3x mb-3"></i>
          <p>No reservations found.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                <tr>
                  <th>#</th>
                  <th>Investor</th>
                  <th>Presenter</th>
                  <th>Sector</th>
                  <th>Hotel</th>
                  <th>Room</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, index) => (
                  <tr key={r.reservationID}>
                    <td>{index + 1}</td>
                    <td><strong>{r.investorName}</strong></td>
                    <td>{r.presenterName}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: sectorColors[r.sectorName] || '#666' }}>
                        {r.sectorName}
                      </span>
                    </td>
                    <td>{r.hotelName}</td>
                    <td>{r.roomName}</td>
                    <td>{r.timeFrom.substring(0, 5)} - {r.timeTo.substring(0, 5)}</td>
                    <td>{new Date(r.reservationDate).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}