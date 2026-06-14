import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSettings, updateSetting } from '../services/api';

export default function Settings() {
  const [slotDuration, setSlotDuration] = useState(60);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      const durationSetting = res.data.find(s => s.key === 'SlotDurationMinutes');
      if (durationSetting) setSlotDuration(parseInt(durationSetting.value));
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSetting('SlotDurationMinutes', { value: slotDuration.toString() });
      toast.success('Settings saved successfully!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>
        <i className="fas fa-cog me-2"></i>System Settings
      </h2>

      <div className="row">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
              <h5 className="mb-0"><i className="fas fa-clock me-2"></i>Time Slot Settings</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                Set the duration for each meeting slot. When a room is added with an 
                availability window, the system will automatically divide it into slots 
                of this duration.
              </p>

              <label className="form-label fw-bold">Slot Duration</label>
              <div className="row g-2 mb-4">
                {[30, 45, 60, 90, 120].map(duration => (
                  <div className="col-auto" key={duration}>
                    <div
                      className={`card text-center p-3 ${slotDuration === duration ? 'border-primary border-2' : 'border'}`}
                      style={{ cursor: 'pointer', minWidth: 80 }}
                      onClick={() => setSlotDuration(duration)}>
                      <div className="fw-bold" style={{ color: slotDuration === duration ? '#4361ee' : '#333' }}>
                        {duration}
                      </div>
                      <small className="text-muted">min</small>
                      {slotDuration === duration && (
                        <div><i className="fas fa-check-circle text-primary small"></i></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Currently set to <strong>{slotDuration} minutes</strong> per slot.
                {slotDuration === 60 && ' (Default)'}
              </div>

              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Changing this setting only affects <strong>new rooms</strong> added after saving. 
                Existing time slots will not be changed.
              </div>

              <button className="btn btn-primary w-100" onClick={handleSave} disabled={saving}>
                {saving
                  ? <span className="spinner-border spinner-border-sm me-2"></span>
                  : <i className="fas fa-save me-2"></i>}
                Save Settings
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
              <h5 className="mb-0"><i className="fas fa-question-circle me-2"></i>How It Works</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6 className="fw-bold text-primary">Example with 60 min slots:</h6>
                <p className="text-muted small">Room available 8AM - 12PM generates:</p>
                <div className="d-flex flex-wrap gap-1">
                  {['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00'].map(slot => (
                    <span key={slot} className="badge bg-success">{slot}</span>
                  ))}
                </div>
              </div>
              <hr />
              <div className="mb-3">
                <h6 className="fw-bold text-primary">Example with 30 min slots:</h6>
                <p className="text-muted small">Room available 8AM - 10AM generates:</p>
                <div className="d-flex flex-wrap gap-1">
                  {['8:00-8:30', '8:30-9:00', '9:00-9:30', '9:30-10:00'].map(slot => (
                    <span key={slot} className="badge bg-success">{slot}</span>
                  ))}
                </div>
              </div>
              <hr />
              <div>
                <h6 className="fw-bold text-primary">Slot Status Colors:</h6>
                <div className="d-flex gap-2 mt-2">
                  <span className="badge bg-success">Available</span>
                  <span className="badge bg-danger">Reserved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}