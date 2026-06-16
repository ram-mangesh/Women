import React, { useState, useEffect } from 'react';
import { Heart, Activity, Watch, PenTool, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import GoogleFitDashboard from './GoogleFitDashboard';

const VitalsPage = () => {
  const [activeView, setActiveView] = useState('smartwatch'); // 'smartwatch' | 'manual'
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [newVital, setNewVital] = useState({
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    oxygenSaturation: '',
    bodyTemperature: '',
    source: 'MANUAL_ENTRY'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patient/vitals');
      setVitals(response.data.data || []);
    } catch (error) {
      console.log('Failed to load vitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'manual') fetchVitals();
  }, [activeView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/patient/vitals', newVital);
      toast.success('Vitals recorded! AI analyzed your data.');
      setNewVital({ heartRate: '', systolicBP: '', diastolicBP: '', oxygenSaturation: '', bodyTemperature: '', source: 'MANUAL_ENTRY' });
      fetchVitals();
    } catch (error) {
      toast.error('Failed to record vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View toggle styles
  const viewBtnStyle = (view) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 22px', borderRadius: 30, fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.3s ease',
    background: activeView === view
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : '#f1f5f9',
    color: activeView === view ? '#fff' : '#64748b',
    boxShadow: activeView === view ? '0 4px 15px rgba(16,185,129,0.3)' : 'none'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top View Switcher */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        padding: '16px 24px 0', background: '#f8fafc'
      }}>
        <button style={viewBtnStyle('smartwatch')} onClick={() => setActiveView('smartwatch')}>
          <Watch size={16} /> Smartwatch / Google Fit
        </button>
        <button style={viewBtnStyle('manual')} onClick={() => setActiveView('manual')}>
          <PenTool size={16} /> Manual Entry
        </button>
      </div>

      {/* ─── SMARTWATCH VIEW ─── */}
      {activeView === 'smartwatch' && <GoogleFitDashboard />}

      {/* ─── MANUAL ENTRY VIEW ─── */}
      {activeView === 'manual' && (
        <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              📝 Manual Vitals Entry
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Log health metrics manually for AI anomaly detection.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{
              background: '#ffffff', borderRadius: 20, padding: 24,
              border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              position: 'sticky', top: 24,
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={18} color="#ef4444" />
                Log New Reading
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Heart Rate (bpm)</label>
                  <input type="number" required value={newVital.heartRate}
                    onChange={e => setNewVital({...newVital, heartRate: parseInt(e.target.value) || ''})}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem',
                      background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                    placeholder="72"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Systolic BP</label>
                    <input type="number" required value={newVital.systolicBP}
                      onChange={e => setNewVital({...newVital, systolicBP: parseInt(e.target.value) || ''})}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem',
                        background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                        outline: 'none', boxSizing: 'border-box'
                      }}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Diastolic BP</label>
                    <input type="number" required value={newVital.diastolicBP}
                      onChange={e => setNewVital({...newVital, diastolicBP: parseInt(e.target.value) || ''})}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem',
                        background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                        outline: 'none', boxSizing: 'border-box'
                      }}
                      placeholder="80"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Blood Oxygen (%)</label>
                  <input type="number" required value={newVital.oxygenSaturation}
                    onChange={e => setNewVital({...newVital, oxygenSaturation: parseInt(e.target.value) || ''})}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem',
                      background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                    placeholder="98"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Body Temp (°C)</label>
                  <input type="number" required step="0.1" value={newVital.bodyTemperature}
                    onChange={e => setNewVital({...newVital, bodyTemperature: parseFloat(e.target.value) || ''})}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem',
                      background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                    placeholder="36.5"
                  />
                </div>
                
                <button type="submit" disabled={isSubmitting} style={{
                  width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                  marginTop: 8, opacity: isSubmitting ? 0.7 : 1
                }}>
                  {isSubmitting ? '⏳ Processing...' : '💊 Save & Analyze'}
                </button>
              </div>
            </form>

            {/* Readings History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading ? (
                <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: 16, padding: 48, textAlign: 'center', color: '#64748b' }}>
                  Loading vitals...
                </div>
              ) : vitals.length === 0 ? (
                <div style={{
                  background: 'rgba(15,23,42,0.8)', borderRadius: 20, padding: 48,
                  textAlign: 'center', border: '1px dashed rgba(51,65,85,0.5)'
                }}>
                  <Heart size={40} color="#334155" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#64748b', fontWeight: 500 }}>No readings yet. Log your first vital reading.</p>
                </div>
              ) : (
                vitals.map(v => (
                  <div key={v.id} style={{
                    background: v.isAbnormal ? 'rgba(239,68,68,0.06)' : 'rgba(15,23,42,0.8)',
                    borderRadius: 16, padding: 20,
                    border: `1px solid ${v.isAbnormal ? 'rgba(239,68,68,0.3)' : 'rgba(51,65,85,0.4)'}`,
                    transition: 'border-color 0.3s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(v.recordedAt).toLocaleString()}</span>
                      {v.isAbnormal && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '3px 10px', borderRadius: 15,
                          background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                          fontSize: '0.7rem', fontWeight: 700
                        }}>
                          <AlertTriangle size={12} /> Abnormal
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: v.aiAnalysis ? 12 : 0 }}>
                      <div style={{ background: '#0f172a', padding: '10px', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>Heart Rate</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>{v.heartRate} <span style={{ fontSize: '0.6rem', color: '#475569' }}>bpm</span></div>
                      </div>
                      <div style={{ background: '#0f172a', padding: '10px', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>Blood Pressure</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{v.systolicBP}/{v.diastolicBP}</div>
                      </div>
                      <div style={{ background: '#0f172a', padding: '10px', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>SpO2</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4' }}>{v.oxygenSaturation}%</div>
                      </div>
                      <div style={{ background: '#0f172a', padding: '10px', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>Temp</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{v.bodyTemperature}°C</div>
                      </div>
                    </div>

                    {v.aiAnalysis && (
                      <div style={{
                        background: 'rgba(139,92,246,0.08)', borderRadius: 12, padding: '10px 14px',
                        border: '1px solid rgba(139,92,246,0.15)',
                        fontSize: '0.8rem', color: '#c4b5fd', lineHeight: 1.5
                      }}>
                        <span style={{ fontWeight: 700, color: '#a78bfa' }}>🧠 AI: </span>{v.aiAnalysis}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsPage;
