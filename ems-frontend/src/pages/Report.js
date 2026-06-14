import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getReservations, cancelReservation } from '../services/api';

export default function Report() {
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

  const openCancelModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelReservation(selectedReservation.reservationID);
      toast.success('Reservation cancelled! Time slot is now available again.');
      setShowCancelModal(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to cancel reservation');
    } finally { setCancelling(false); }
  };

  const sectorColors = {
    'Finance': '#4361ee',
    'IT': '#3a0ca3',
    'Restaurants': '#f72585',
    'Real Estate': '#7209b7',
    'Retail': '#4cc9f0',
    'Healthcare': '#06d6a0',
    'Education': '#ffd166',
    'Manufacturing': '#ef476f',
    'Tourism': '#118ab2',
    'Media': '#073b4c'
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fas fa-chart-bar me-2"></i>Reservations Report
        </h2>
        <span className="badge bg-primary fs-6">{filtered.length} Total</span>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <input
            className="form-control"
            placeholder="Search by investor, presenter, sector, hotel..."
            value={search}
            onChange={e => setSearch(e.target.value)} />
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, index) => (
                  <tr key={r.reservationID}>
                    <td>{index + 1}</td>
                    <td><strong>{r.investorName}</strong></td>
                    <td>{r.presenterName}</td>
                    <td>
                      <span className="badge"
                        style={{ backgroundColor: sectorColors[r.sectorName] || '#666' }}>
                        {r.sectorName}
                      </span>
                    </td>
                    <td>{r.hotelName}</td>
                    <td>{r.roomName}</td>
                    <td>
                      <i className="fas fa-clock me-1 text-primary"></i>
                      {r.timeFrom.substring(0, 5)} - {r.timeTo.substring(0, 5)}
                    </td>
                    <td>{new Date(r.reservationDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => openCancelModal(r)}
                        title="Cancel reservation">
                        <i className="fas fa-times me-1"></i>Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Beautiful Cancel Confirmation Modal */}
      {showCancelModal && selectedReservation && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <button className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body text-center px-5 pb-2">
                {/* Warning Icon */}
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 80, height: 80, backgroundColor: '#fff3f3' }}>
                  <i className="fas fa-exclamation-triangle fa-2x" style={{ color: '#dc3545' }}></i>
                </div>

                <h4 className="fw-bold mb-2">Cancel Reservation?</h4>
                <p className="text-muted mb-4">
                  This action cannot be undone. The time slot will become available again.
                </p>

                {/* Reservation Summary */}
                <div className="card border-0 text-start mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-body py-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted d-block">Investor</small>
                        <strong>{selectedReservation.investorName}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Presenter</small>
                        <strong>{selectedReservation.presenterName}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Hotel</small>
                        <strong>{selectedReservation.hotelName}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Room</small>
                        <strong>{selectedReservation.roomName}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Sector</small>
                        <span className="badge"
                          style={{ backgroundColor: sectorColors[selectedReservation.sectorName] || '#666' }}>
                          {selectedReservation.sectorName}
                        </span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Time</small>
                        <strong>
                          {selectedReservation.timeFrom.substring(0, 5)} - {selectedReservation.timeTo.substring(0, 5)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 justify-content-center gap-3 pt-0 pb-4">
                <button className="btn btn-light px-4"
                  onClick={() => setShowCancelModal(false)}>
                  Keep Reservation
                </button>
                <button className="btn btn-danger px-4"
                  onClick={handleCancel}
                  disabled={cancelling}>
                  {cancelling
                    ? <span className="spinner-border spinner-border-sm me-2"></span>
                    : <i className="fas fa-times me-2"></i>}
                  Yes, Cancel It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}