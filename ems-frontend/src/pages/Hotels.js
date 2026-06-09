import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getHotels, createHotel, deleteHotel, addRoom, addTimeSlot, updateHotel, updateRoom, deleteRoom, deleteTimeSlot } from '../services/api';

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedHotelID, setSelectedHotelID] = useState(null);
  const [selectedRoomID, setSelectedRoomID] = useState(null);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
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
      if (editingHotel) {
        await updateHotel(editingHotel.hotelID, hotelForm);
        toast.success('Hotel updated successfully!');
      } else {
        await createHotel(hotelForm);
        toast.success('Hotel added successfully!');
      }
      setShowHotelModal(false);
      setHotelForm({ hotelName: '', address: '' });
      setEditingHotel(null);
      fetchHotels();
    } catch { toast.error('Failed to save hotel'); }
  };

  const handleAddRoom = async () => {
    if (!roomForm.roomName) return toast.error('Room name is required');
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.roomID, { roomName: roomForm.roomName, hotelID: selectedHotelID });
        toast.success('Room updated successfully!');
      } else {
        await addRoom({ roomName: roomForm.roomName, hotelID: selectedHotelID });
        toast.success('Room added successfully!');
      }
      setShowRoomModal(false);
      setRoomForm({ roomName: '' });
      setEditingRoom(null);
      fetchHotels();
    } catch { toast.error('Failed to save room'); }
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

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await deleteRoom(id);
      toast.success('Room deleted!');
      fetchHotels();
    } catch { toast.error('Failed to delete room'); }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this time slot?')) return;
    try {
      await deleteTimeSlot(id);
      toast.success('Time slot deleted!');
      fetchHotels();
    } catch { toast.error('Failed to delete time slot'); }
  };

  const openEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setHotelForm({ hotelName: hotel.hotelName, address: hotel.address || '' });
    setShowHotelModal(true);
  };

  const openEditRoom = (room, hotelID) => {
    setEditingRoom(room);
    setSelectedHotelID(hotelID);
    setRoomForm({ roomName: room.roomName });
    setShowRoomModal(true);
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
        <button className="btn btn-primary" onClick={() => { setEditingHotel(null); setHotelForm({ hotelName: '', address: '' }); setShowHotelModal(true); }}>
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
                  onClick={() => { setSelectedHotelID(hotel.hotelID); setEditingRoom(null); setRoomForm({ roomName: '' }); setShowRoomModal(true); }}>
                  <i className="fas fa-plus me-1"></i>Add Room
                </button>
                <button className="btn btn-sm btn-warning me-2" onClick={() => openEditHotel(hotel)}>
                  <i className="fas fa-edit"></i>
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
                            <div>
                              <button className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => { setSelectedRoomID(room.roomID); setSlotForm({ timeFrom: '', timeTo: '' }); setShowSlotModal(true); }}>
                                <i className="fas fa-plus"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-warning me-1"
                                onClick={() => openEditRoom(room, hotel.hotelID)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteRoom(room.roomID)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {room.roomTimeSlots.length === 0 ? (
                              <span className="text-muted small">No time slots</span>
                            ) : (
                              room.roomTimeSlots.map(slot => (
                                <span key={slot.slotID}
                                  className={`badge ${slot.isAvailable ? 'bg-success' : 'bg-danger'}`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDeleteSlot(slot.slotID)}
                                  title="Click to delete">
                                  {slot.timeFrom.substring(0, 5)} - {slot.timeTo.substring(0, 5)} ×
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

      {/* Add/Edit Hotel Modal */}
      {showHotelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-hotel me-2"></i>
                  {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h5>
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
                  <i className={`fas ${editingHotel ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {editingHotel ? 'Update Hotel' : 'Add Hotel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {showRoomModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-door-open me-2"></i>
                  {editingRoom ? 'Edit Room' : 'Add Conference Room'}
                </h5>
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
                  <i className={`fas ${editingRoom ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {editingRoom ? 'Update Room' : 'Add Room'}
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