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
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [invRes, secRes] = await Promise.all([getInvestors(), getSectors()]);
      setInvestors(invRes.data);
      setSectors(secRes.data.map(s => ({ value: s.sectorID, label: s.sectorName })));
    } catch { 
      toast.error('Failed to load data'); 
    } finally { 
      setLoading(false); 
    }
  };

  // Check for time conflicts between sectors
  const checkForConflicts = (rows) => {
    const newConflicts = [];
    
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const sector1 = rows[i];
        const sector2 = rows[j];
        
        // Only check if both rows have complete data
        if (sector1.timeFrom && sector1.timeTo && sector2.timeFrom && sector2.timeTo && 
            sector1.sectorID && sector2.sectorID) {
          
          // Check if time ranges overlap
          if (sector1.timeFrom < sector2.timeTo && sector2.timeFrom < sector1.timeTo) {
            const sector1Name = sectors.find(s => s.value === sector1.sectorID)?.label || 'Sector';
            const sector2Name = sectors.find(s => s.value === sector2.sectorID)?.label || 'Sector';
            newConflicts.push({
              indices: [i, j],
              message: `${sector1Name} (${sector1.timeFrom} - ${sector1.timeTo}) overlaps with ${sector2Name} (${sector2.timeFrom} - ${sector2.timeTo})`
            });
          }
        }
      }
    }
    
    setConflicts(newConflicts);
    return newConflicts.length > 0;
  };

  const addSectorRow = () => {
    const newRows = [...sectorRows, { sectorID: null, timeFrom: '', timeTo: '' }];
    setSectorRows(newRows);
    checkForConflicts(newRows);
  };

  const removeSectorRow = (index) => {
    const newRows = sectorRows.filter((_, i) => i !== index);
    setSectorRows(newRows);
    checkForConflicts(newRows);
  };

  const updateSectorRow = (index, field, value) => {
    const updated = [...sectorRows];
    updated[index][field] = value;
    setSectorRows(updated);
    checkForConflicts(updated);
  };

  const openAddModal = () => {
    setEditingInvestor(null);
    setForm({ name: '', mobile: '' });
    setSectorRows([{ sectorID: null, timeFrom: '', timeTo: '' }]);
    setConflicts([]);
    setShowModal(true);
  };

  const openEditModal = (investor) => {
    setEditingInvestor(investor);
    setForm({ name: investor.name, mobile: investor.mobile });
    const rows = investor.investorSectors.map(s => ({
      sectorID: s.sectorID,
      timeFrom: s.timeFrom.substring(0, 5),
      timeTo: s.timeTo.substring(0, 5)
    }));
    setSectorRows(rows);
    setConflicts([]);
    setShowModal(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!form.mobile.trim()) {
      toast.error('Mobile is required');
      return false;
    }
    if (!form.mobile.match(/^01[0-9]{9}$/)) {
      toast.error('Please enter a valid Egyptian mobile number (e.g., 01001234567)');
      return false;
    }
    
    // Check if any sector row is incomplete
    const incompleteRow = sectorRows.find(r => !r.sectorID || !r.timeFrom || !r.timeTo);
    if (incompleteRow) {
      toast.error('Please complete all sector rows (sector, start time, and end time)');
      return false;
    }
    
    // Validate time ranges for each sector
    for (const row of sectorRows) {
      if (row.timeFrom >= row.timeTo) {
        const sectorName = sectors.find(s => s.value === row.sectorID)?.label || 'Sector';
        toast.error(`Invalid time range for ${sectorName}: Start time must be before end time`);
        return false;
      }
    }
    
    // Check for conflicts
    if (conflicts.length > 0) {
      toast.error(`Time conflict detected: ${conflicts[0].message}. Investor cannot be in two meetings at the same time.`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
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
    } catch (error) {
      // Display the specific error message from the API
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save investor';
      toast.error(errorMessage);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investor?')) return;
    try {
      await deleteInvestor(id);
      toast.success('Investor deleted successfully!');
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete investor';
      toast.error(errorMessage);
    }
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
          <i className="fas fa-briefcase me-2"></i>Investors
        </h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus me-2"></i>Add Investor
        </button>
      </div>

      {investors.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-briefcase fa-3x mb-3"></i>
          <p>No investors added yet. Click "Add Investor" to get started.</p>
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
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {investor.investorSectors.map(s => (
                      <span key={s.investorSectorID} className="badge bg-primary">
                        <i className="fas fa-chart-line me-1"></i>
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
                    <label className="form-label fw-bold">
                      <i className="fas fa-user me-1"></i>Name *
                    </label>
                    <input 
                      type="text"
                      className="form-control" 
                      placeholder="e.g., Ahmed Mohamed"
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-phone me-1"></i>Mobile *
                    </label>
                    <input 
                      type="tel"
                      className="form-control" 
                      placeholder="e.g., 01001234567"
                      value={form.mobile} 
                      onChange={e => setForm({ ...form, mobile: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0">
                    <i className="fas fa-chart-line me-2"></i>Sectors & Availability
                  </h6>
                  <button className="btn btn-sm btn-outline-primary" onClick={addSectorRow}>
                    <i className="fas fa-plus me-1"></i>Add Sector
                  </button>
                </div>

                {conflicts.length > 0 && (
                  <div className="alert alert-warning alert-dismissible fade show mb-3" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Time Conflict Detected!</strong> {conflicts[0].message}
                    <button type="button" className="btn-close" onClick={() => setConflicts([])}></button>
                  </div>
                )}

                {sectorRows.map((row, index) => {
                  const hasConflict = conflicts.some(c => c.indices.includes(index));
                  return (
                    <div key={index} className={`row g-2 mb-2 align-items-center ${hasConflict ? 'border border-danger rounded p-1' : ''}`}>
                      <div className="col-md-5">
                        <Select
                          options={sectors}
                          placeholder="Select sector..."
                          value={sectors.find(s => s.value === row.sectorID) || null}
                          onChange={opt => updateSectorRow(index, 'sectorID', opt.value)}
                          isClearable
                        />
                      </div>
                      <div className="col-md-3">
                        <input 
                          type="time" 
                          className="form-control"
                          value={row.timeFrom}
                          onChange={e => updateSectorRow(index, 'timeFrom', e.target.value)} 
                        />
                      </div>
                      <div className="col-md-3">
                        <input 
                          type="time" 
                          className="form-control"
                          value={row.timeTo}
                          onChange={e => updateSectorRow(index, 'timeTo', e.target.value)} 
                        />
                      </div>
                      <div className="col-md-1">
                        {sectorRows.length > 1 && (
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => removeSectorRow(index)}
                            title="Remove sector"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {sectorRows.length === 0 && (
                  <div className="text-center py-3 text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Click "Add Sector" to add sectors for this investor
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times me-2"></i>Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <i className={`fas ${editingInvestor ? 'fa-save' : 'fa-save'} me-2`}></i>
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