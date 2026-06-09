import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getHotels, createHotel, deleteHotel, addRoom, addTimeSlot } from '../services/api';

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedHotelID, setSelectedHotelID] = useState(null);
  const [selectedRoomID, setSelectedRoomID] = useState(null);
  const [hotelForm, setHotelForm] = useState({ hotelName: '', address: '' });
  const [roomForm, setRoomForm] = useState({ roomName: '' });
  const [slotForm, setSlotForm] = useState({ timeFrom: '', timeTo: '' });

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const res = await getHotels();
      setHotels(res.data);
    } catch { toast.error('Failed to load hotels'); }
    finally { setLoading(false); }
  };

  const handleAddHotel = async () => {
    if (!hotelForm.hotelName) return toast.error('Hotel name is required');
    try {
      await createHotel(hotelForm);
      toast.success('Hotel added successfully!');
      setShowHotelModal(false);
      setHotelForm({ hotelName: '', address: '' });
      fetchHotels();
    } catch { toast.error('Failed to add hotel'); }
  };

  const handleAddRoom = async () => {
    if (!roomForm.roomName) return toast.error('Room name is required');
    try {
      await addRoom({ roomName: roomForm.roomName, hotelID: selectedHotelID });
      toast.success('Room added successfully!');
      setShowRoomModal(false);
      setRoomForm({ roomName: '' });
      fetchHotels();
    } catch { toast.error('Failed to add room'); }
  };

  const handleAddSlot = async () => {
    if (!slotForm.timeFrom || !slotForm.timeTo) return toast.error('Please fill all time fields');
    try {
      await addTimeSlot({ roomID: selectedRoomID, timeFrom: slotForm.timeFrom + ':00', timeTo: slotForm.timeTo + ':00' });
      toast.success('Time slot added successfully!');
      setShowSlotModal(false);
      setSlotForm({ timeFrom: '', timeTo: '' });
      fetchHotels();
    } catch { toast.error('Failed to add time slot'); }
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await deleteHotel(id);
      toast.success('Hotel deleted!');
      fetchHotels();
    } catch { toast.error('Failed to delete hotel'); }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fas fa-hotel me-2"></i>Hotels & Conference Rooms
        </h2>
        <button className="btn btn-primary" onClick={() => setShowHotelModal(true)}>
          <i className="fas fa-plus me-2"></i>Add Hotel
        </button>
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-hotel fa-3x mb-3"></i>
          <p>No hotels added yet. Click "Add Hotel" to get started.</p>
        </div>
      ) : (
        hotels.map(hotel => (
          <div key={hotel.hotelID} className="card shadow-sm mb-4 border-0">
            <div className="card-header d-flex justify-content-between align-items-center"
              style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
              <div>
                <i className="fas fa-hotel me-2"></i>
                <strong>{hotel.hotelName}</strong>
                {hotel.address && <span className="ms-2 text-white-50 small">{hotel.address}</span>}
              </div>
              <div>
                <button className="btn btn-sm btn-light me-2"
                  onClick={() => { setSelectedHotelID(hotel.hotelID); setShowRoomModal(true); }}>
                  <i className="fas fa-plus me-1"></i>Add Room
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteHotel(hotel.hotelID)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              {hotel.conferenceRooms.length === 0 ? (
                <p className="text-muted small">No rooms added yet.</p>
              ) : (
                <div className="row g-3">
                  {hotel.conferenceRooms.map(room => (
                    <div key={room.roomID} className="col-md-4">
                      <div className="card border h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-bold mb-0">
                              <i className="fas fa-door-open me-2 text-primary"></i>{room.roomName}
                            </h6>
                            <button className="btn btn-sm btn-outline-primary"
                              onClick={() => { setSelectedRoomID(room.roomID); setShowSlotModal(true); }}>
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {room.roomTimeSlots.length === 0 ? (
                              <span className="text-muted small">No time slots</span>
                            ) : (
                              room.roomTimeSlots.map(slot => (
                                <span key={slot.slotID}
                                  className={`badge ${slot.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                                  {slot.timeFrom.substring(0, 5)} - {slot.timeTo.substring(0, 5)}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Add Hotel Modal */}
      {showHotelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                <h5 className="modal-title"><i className="fas fa-hotel me-2"></i>Add New Hotel</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowHotelModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Hotel Name *</label>
                  <input className="form-control" placeholder="e.g. Hilton Cairo"
                    value={hotelForm.hotelName}
                    onChange={e => setHotelForm({ ...hotelForm, hotelName: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Address</label>
                  <input className="form-control" placeholder="e.g. Corniche El Nil, Cairo"
                    value={hotelForm.address}
                    onChange={e => setHotelForm({ ...hotelForm, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowHotelModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddHotel}>
                  <i className="fas fa-plus me-2"></i>Add Hotel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showRoomModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                <h5 className="modal-title"><i className="fas fa-door-open me-2"></i>Add Conference Room</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowRoomModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Room Name *</label>
                  <input className="form-control" placeholder="e.g. Room 1"
                    value={roomForm.roomName}
                    onChange={e => setRoomForm({ roomName: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddRoom}>
                  <i className="fas fa-plus me-2"></i>Add Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Time Slot Modal */}
      {showSlotModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                <h5 className="modal-title"><i className="fas fa-clock me-2"></i>Add Time Slot</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowSlotModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">From</label>
                  <input type="time" className="form-control"
                    value={slotForm.timeFrom}
                    onChange={e => setSlotForm({ ...slotForm, timeFrom: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">To</label>
                  <input type="time" className="form-control"
                    value={slotForm.timeTo}
                    onChange={e => setSlotForm({ ...slotForm, timeTo: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSlotModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddSlot}>
                  <i className="fas fa-plus me-2"></i>Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}