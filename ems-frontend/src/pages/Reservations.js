import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { getInvestors, getMatches, createReservation } from '../services/api';

export default function Reservations() {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => { fetchInvestors(); }, []);

  const fetchInvestors = async () => {
    try {
      const res = await getInvestors();
      setInvestors(res.data.map(i => ({ value: i.investorID, label: i.name, data: i })));
    } catch { toast.error('Failed to load investors'); }
  };

  const handleInvestorSelect = async (opt) => {
    setSelectedInvestor(opt);
    setMatches([]);
    setSelectedMatch(null);
    setSelectedSlot(null);
    setSearching(true);
    try {
      const res = await getMatches(opt.value);
      setMatches(res.data);
      if (res.data.length === 0) toast.info('No matches found for this investor');
    } catch { toast.error('Failed to find matches'); }
    finally { setSearching(false); }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await createReservation({
        investorID: selectedInvestor.value,
        presenterID: selectedMatch.presenterID,
        slotID: selectedSlot.slotID,
        sectorID: selectedMatch.sectorID
      });
      toast.success('Reservation confirmed successfully!');
      setShowConfirmModal(false);
      setSelectedInvestor(null);
      setMatches([]);
      setSelectedMatch(null);
      setSelectedSlot(null);
    } catch (err) {
      toast.error(err.response?.data || 'Failed to create reservation');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>
        <i className="fas fa-calendar-plus me-2"></i>New Reservation
      </h2>

      {/* Step 1 - Select Investor */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <span className="badge bg-primary me-2">1</span>Select Investor
          </h5>
          <Select
            options={investors}
            placeholder="Search and select an investor..."
            onChange={handleInvestorSelect}
            value={selectedInvestor}
          />
        </div>
      </div>

      {/* Investor Sectors */}
      {selectedInvestor && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6 className="fw-bold mb-2">Investor Sectors & Availability</h6>
            <div className="d-flex flex-wrap gap-2">
              {selectedInvestor.data.investorSectors.map(s => (
                <span key={s.investorSectorID} className="badge bg-primary fs-6 p-2">
                  {s.sectorName}: {s.timeFrom.substring(0, 5)} - {s.timeTo.substring(0, 5)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 - Matches */}
      {searching && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary me-2"></div>
          <span>Finding matches...</span>
        </div>
      )}

      {matches.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              <span className="badge bg-success me-2">2</span>
              Select a Match ({matches.length} found)
            </h5>
            <div className="row g-3">
              {matches.map((match, index) => (
                <div key={index} className="col-md-6">
                  <div className={`card h-100 cursor-pointer ${selectedMatch === match ? 'border-primary border-2' : 'border'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedMatch(match); setSelectedSlot(null); }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-bold mb-1">{match.presenterName}</h6>
                          <p className="text-muted small mb-1">
                            <i className="fas fa-phone me-1"></i>{match.presenterMobile}
                          </p>
                        </div>
                        <span className="badge bg-success">{match.sectorName}</span>
                      </div>
                      <p className="small mb-0">
                        <i className="fas fa-clock me-1 text-primary"></i>
                        Available: {match.matchedTimeFrom.substring(0, 5)} - {match.matchedTimeTo.substring(0, 5)}
                      </p>
                      {selectedMatch === match && (
                        <div className="mt-1">
                          <i className="fas fa-check-circle text-primary"></i>
                          <span className="text-primary ms-1 small">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 - Select Room */}
      {selectedMatch && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              <span className="badge bg-warning text-dark me-2">3</span>
              Select Room & Time Slot
            </h5>
            <div className="row g-3">
              {selectedMatch.availableSlots.map(slot => (
                <div key={slot.slotID} className="col-md-4">
                  <div className={`card h-100 ${selectedSlot === slot ? 'border-success border-2' : 'border'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedSlot(slot)}>
                    <div className="card-body text-center">
                      <i className="fas fa-hotel fa-2x text-primary mb-2"></i>
                      <h6 className="fw-bold">{slot.hotelName}</h6>
                      <p className="text-muted small mb-1">{slot.roomName}</p>
                      <span className="badge bg-success">
                        {slot.timeFrom.substring(0, 5)} - {slot.timeTo.substring(0, 5)}
                      </span>
                      {selectedSlot === slot && (
                        <div className="mt-1">
                          <i className="fas fa-check-circle text-success"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      {selectedSlot && (
        <div className="text-center">
          <button className="btn btn-success btn-lg px-5" onClick={() => setShowConfirmModal(true)}>
            <i className="fas fa-check me-2"></i>Confirm Reservation
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title"><i className="fas fa-calendar-check me-2"></i>Confirm Reservation</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="fw-bold text-muted">Investor</td>
                      <td>{selectedInvestor.label}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Presenter</td>
                      <td>{selectedMatch.presenterName}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Sector</td>
                      <td><span className="badge bg-success">{selectedMatch.sectorName}</span></td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Hotel</td>
                      <td>{selectedSlot.hotelName}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Room</td>
                      <td>{selectedSlot.roomName}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Time</td>
                      <td>{selectedSlot.timeFrom.substring(0, 5)} - {selectedSlot.timeTo.substring(0, 5)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleConfirm} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-check me-2"></i>}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}