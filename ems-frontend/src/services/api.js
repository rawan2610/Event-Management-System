import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5232/api',
});

// Hotels
export const getHotels = () => API.get('/hotels');
export const createHotel = (data) => API.post('/hotels', data);
export const deleteHotel = (id) => API.delete(`/hotels/${id}`);
export const addRoom = (data) => API.post('/hotels/rooms', data);
export const addTimeSlot = (data) => API.post('/hotels/timeslots', data);


// Hotel updates
export const updateHotel = (id, data) => API.put(`/hotels/${id}`, data);
export const updateRoom = (id, data) => API.put(`/hotels/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/hotels/rooms/${id}`);
export const deleteTimeSlot = (id) => API.delete(`/hotels/timeslots/${id}`);


// Sectors
export const getSectors = () => API.get('/sectors');

// Investors
export const getInvestors = () => API.get('/investors');
export const getInvestor = (id) => API.get(`/investors/${id}`);
export const createInvestor = (data) => API.post('/investors', data);
export const deleteInvestor = (id) => API.delete(`/investors/${id}`);
export const updateInvestor = (id, data) => API.put(`/investors/${id}`, data);

// Presenters
export const getPresenters = () => API.get('/presenters');
export const getPresenter = (id) => API.get(`/presenters/${id}`);
export const createPresenter = (data) => API.post('/presenters', data);
export const deletePresenter = (id) => API.delete(`/presenters/${id}`);

export const updatePresenter = (id, data) => API.put(`/presenters/${id}`, data);
// Reservations
export const getReservations = () => API.get('/reservations');
export const getMatches = (investorId) => API.get(`/reservations/matches/${investorId}`);
export const createReservation = (data) => API.post('/reservations', data);

export default API;