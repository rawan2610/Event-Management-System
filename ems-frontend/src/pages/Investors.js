import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { getInvestors, createInvestor, deleteInvestor, getSectors, updateInvestor } from '../services/api';

export default function Investors() {
  const [investors, setInvestors] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [sectorRows, setSectorRows] = useState([{ sectorID: null, timeFrom: '', timeTo: '' }]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [invRes, secRes] = await Promise.all([getInvestors(), getSectors()]);
      setInvestors(invRes.data);
      setSectors(secRes.data.map(s => ({ value: s.sectorID, label: s.sectorName })));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const addSectorRow = () => setSectorRows([...sectorRows, { sectorID: null, timeFrom: '', timeTo: '' }]);
  const removeSectorRow = (index) => setSectorRows(sectorRows.filter((_, i) => i !== index));
  const updateSectorRow = (index, field, value) => {
    const updated = [...sectorRows];
    updated[index][field] = value;
    setSectorRows(updated);
  };

  const openAddModal = () => {
    setEditingInvestor(null);
    setForm({ name: '', mobile: '' });
    setSectorRows([{ sectorID: null, timeFrom: '', timeTo: '' }]);
    setShowModal(true);
  };

  const openEditModal = (investor) => {
    setEditingInvestor(investor);
    setForm({ name: investor.name, mobile: investor.mobile });
    setSectorRows(investor.investorSectors.map(s => ({
      sectorID: s.sectorID,
      timeFrom: s.timeFrom.substring(0, 5),
      timeTo: s.timeTo.substring(0, 5)
    })));
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name) return toast.error('Name is required');
    if (!form.mobile) return toast.error('Mobile is required');
    if (sectorRows.some(r => !r.sectorID || !r.timeFrom || !r.timeTo))
      return toast.error('Please complete all sector rows');

    const payload = {
      name: form.name,
      mobile: form.mobile,
      investorSectors: sectorRows.map(r => ({
        sectorID: r.sectorID,
        timeFrom: r.timeFrom + ':00',
        timeTo: r.timeTo + ':00'
      }))
    };

    try {
      if (editingInvestor) {
        await updateInvestor(editingInvestor.investorID, payload);
        toast.success('Investor updated successfully!');
      } else {
        await createInvestor(payload);
        toast.success('Investor added successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch { toast.error('Failed to save investor'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this investor?')) return;
    try {
      await deleteInvestor(id);
      toast.success('Investor deleted!');
      fetchData();
    } catch { toast.error('Failed to delete investor'); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fas fa-briefcase me-2"></i>Investors
        </h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus me-2"></i>Add Investor
        </button>
      </div>

      {investors.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-briefcase fa-3x mb-3"></i>
          <p>No investors added yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {investors.map(investor => (
            <div key={investor.investorID} className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold mb-1">{investor.name}</h5>
                      <p className="text-muted small mb-2">
                        <i className="fas fa-phone me-1"></i>{investor.mobile}
                      </p>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => openEditModal(investor)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(investor.investorID)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {investor.investorSectors.map(s => (
                      <span key={s.investorSectorID} className="badge bg-primary">
                        {s.sectorName} ({s.timeFrom.substring(0, 5)} - {s.timeTo.substring(0, 5)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-briefcase me-2"></i>
                  {editingInvestor ? 'Edit Investor' : 'Add New Investor'}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Name *</label>
                    <input className="form-control" placeholder="Investor name"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Mobile *</label>
                    <input className="form-control" placeholder="e.g. 01001234567"
                      value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0">Sectors & Availability</h6>
                  <button className="btn btn-sm btn-outline-primary" onClick={addSectorRow}>
                    <i className="fas fa-plus me-1"></i>Add Sector
                  </button>
                </div>

                {sectorRows.map((row, index) => (
                  <div key={index} className="row g-2 mb-2 align-items-center">
                    <div className="col-md-5">
                      <Select
                        options={sectors}
                        placeholder="Select sector..."
                        value={sectors.find(s => s.value === row.sectorID) || null}
                        onChange={opt => updateSectorRow(index, 'sectorID', opt.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input type="time" className="form-control"
                        value={row.timeFrom}
                        onChange={e => updateSectorRow(index, 'timeFrom', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <input type="time" className="form-control"
                        value={row.timeTo}
                        onChange={e => updateSectorRow(index, 'timeTo', e.target.value)} />
                    </div>
                    <div className="col-md-1">
                      {sectorRows.length > 1 && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeSectorRow(index)}>
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <i className={`fas ${editingInvestor ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {editingInvestor ? 'Update Investor' : 'Save Investor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}