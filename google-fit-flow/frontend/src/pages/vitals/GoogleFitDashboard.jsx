import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Footprints, Moon, Flame, Wind, Watch, RefreshCw, Wifi, WifiOff, Activity, Zap, TrendingUp, TrendingDown, Brain, Smartphone } from 'lucide-react';
import ActivityRing from '../../components/charts/ActivityRing';
import HeartRateChart from '../../components/charts/HeartRateChart';
import StepsChart from '../../components/charts/StepsChart';
import SleepChart from '../../components/charts/SleepChart';
import api from '../../services/api';
import { toast } from 'react-toastify';

const GoogleFitDashboard = () => {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [summary, setSummary] = useState(null);
  const [heartRateData, setHeartRateData] = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const GOOGLE_CLIENT_ID = '474105204785-gqu4an78s8q66l01rju7mqut1lflk2td.apps.googleusercontent.com';
  const SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read ' +
                 'https://www.googleapis.com/auth/fitness.body.read ' +
                 'https://www.googleapis.com/auth/fitness.blood_pressure.read ' +
                 'https://www.googleapis.com/auth/fitness.heart_rate.read ' +
                 'https://www.googleapis.com/auth/fitness.sleep.read ' +
                 'https://www.googleapis.com/auth/fitness.oxygen_saturation.read';

  const loadLiveData = useCallback(async (token) => {
    try {
      const [{ fetchTodaySummary, fetchHeartRateData, fetchStepsData, fetchWeeklyTrends }, { default: axios }] = await Promise.all([
        import('../../services/GoogleFitService'),
        import('axios')
      ]);

      const s = await fetchTodaySummary(token);
      setSummary(s);
      
      const hrData = await fetchHeartRateData(token);
      setHeartRateData(hrData);
      
      const stData = await fetchStepsData(token, 10000);
      setStepsData(stData);
      
      const wtData = await fetchWeeklyTrends(token);
      setWeeklyTrends(wtData);
      
      setLastSync(new Date());
      return true;
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
         sessionStorage.removeItem('google_fit_token');
         setConnected(false);
         toast.error('Session expired. Please reconnect Google Fit.');
      } else {
         toast.error('Failed to load Google Fit basic data. Ensure permissions are granted.');
      }
      return false;
    }
  }, []);

  // Auto-connect on page refresh if token is saved
  useEffect(() => {
    const token = sessionStorage.getItem('google_fit_token');
    if (token) {
      setConnected(true);
      setSyncing(true);
      loadLiveData(token).then(() => setSyncing(false));
    }
  }, [loadLiveData]);

  const handleConnect = () => {
    if (!window.google) {
      toast.error("Google Identity Services failed to load. Please try refreshing.");
      return;
    }
    
    setSyncing(true);
    
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
           setConnected(true);
           toast.success('🎉 Google Fit connected! Fetching live smartwatch data...');
           // Save it off
           sessionStorage.setItem('google_fit_token', tokenResponse.access_token);
           await loadLiveData(tokenResponse.access_token);
           setSyncing(false);
        }
      },
      error_callback: (err) => {
        setSyncing(false);
        toast.error('Google Sign-In failed or was cancelled.');
      }
    });

    tokenClient.requestAccessToken();
  };

  const handleSync = async () => {
    if (!connected) return;
    setSyncing(true);
    
    const token = sessionStorage.getItem('google_fit_token');
    if(token) {
        await loadLiveData(token);
        
        // Also sync to backend
        try {
          const { convertToSyncPayload } = await import('../../services/GoogleFitService');
          const payload = convertToSyncPayload(summary);
          await api.post('/patient/vitals/sync-google-fit', payload);
          toast.success('⌚ Live vitals synced to your health record!');
        } catch (err) {
          console.log('Backend sync failed:', err.message);
        }
    } else {
        toast.error('Session expired. Please reconnect Google Fit.');
        handleDisconnect();
    }
    
    setTimeout(() => setSyncing(false), 500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setSummary(null);
    setHeartRateData([]);
    setStepsData([]);
    setWeeklyTrends(null);
    toast.info('Google Fit disconnected.');
  };

  // Stat card data
  const statCards = summary ? [
    {
      icon: Heart, label: 'Heart Rate', value: `${summary.heartRate}`, unit: 'bpm',
      sub: `${summary.heartRateMin}-${summary.heartRateMax} range`,
      color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)'
    },
    {
      icon: Footprints, label: 'Steps', value: summary.steps.toLocaleString(), unit: '',
      sub: `${summary.stepsPercentage}% of goal`,
      color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)'
    },
    {
      icon: Flame, label: 'Calories', value: summary.calories.toLocaleString(), unit: 'kcal',
      sub: `Goal: ${summary.caloriesGoal}`,
      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)'
    },
    {
      icon: Moon, label: 'Sleep', value: `${summary.sleep.totalHours}`, unit: 'hrs',
      sub: `Quality: ${summary.sleep.quality}`,
      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)'
    },
    {
      icon: Wind, label: 'SpO2', value: `${summary.spo2}`, unit: '%',
      sub: 'Blood Oxygen',
      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)'
    },
    {
      icon: Activity, label: 'Distance', value: `${summary.distance}`, unit: 'km',
      sub: `Goal: ${summary.distanceGoal} km`,
      color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)'
    }
  ] : [];

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: 25, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    border: 'none', transition: 'all 0.3s ease',
    background: activeTab === tab ? 'linear-gradient(135deg, #10b981, #059669)' : '#f1f5f9',
    color: activeTab === tab ? '#fff' : '#64748b',
    boxShadow: activeTab === tab ? '0 4px 15px rgba(16,185,129,0.3)' : 'none'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'linear-gradient(135deg, #10b981, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ⌚ Health Monitor
            </span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {connected ? `Connected to ${summary?.deviceName || 'Smartwatch'}` : 'Connect your smartwatch to track health'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {connected && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <Wifi size={14} color="#10b981" />
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Connected</span>
              </div>
              <button
                onClick={handleSync} disabled={syncing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 25, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
                  opacity: syncing ? 0.7 : 1
                }}
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} style={syncing ? { animation: 'spin 1s linear infinite' } : {}} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Not Connected State */}
      {!connected && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.05))',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 24, padding: '48px 32px', textAlign: 'center',
          maxWidth: 520, margin: '60px auto'
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: 30,
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 12px 40px rgba(16,185,129,0.3)',
            fontSize: '2.5rem'
          }}>
            ⌚
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Connect Your Smartwatch
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            Sync health data from Google Fit, Wear OS, Fitbit, or Samsung Galaxy Watch.
            <br />Track heart rate, steps, sleep, SpO2, and more — all powered by AI insights.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {['Google Fit', 'Wear OS', 'Fitbit', 'Samsung Health'].map(d => (
              <span key={d} style={{
                padding: '4px 12px', borderRadius: 15,
                background: '#f1f5f9', color: '#64748b',
                fontSize: '0.7rem', fontWeight: 500, border: '1px solid #e2e8f0'
              }}>{d}</span>
            ))}
          </div>
          <button
            onClick={handleConnect} disabled={syncing}
            style={{
              padding: '14px 36px', borderRadius: 30, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
              transform: syncing ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            {syncing ? '⏳ Connecting...' : '🔗 Connect Google Fit'}
          </button>
          <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: 16 }}>
            🔒 Your data stays private. We never store your Google credentials.
          </p>
        </div>
      )}

      {/* Connected Dashboard */}
      {connected && summary && (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📊 Overview</button>
            <button style={tabStyle('heart')} onClick={() => setActiveTab('heart')}>💓 Heart Rate</button>
            <button style={tabStyle('activity')} onClick={() => setActiveTab('activity')}>🏃 Activity</button>
            <button style={tabStyle('sleep')} onClick={() => setActiveTab('sleep')}>🌙 Sleep</button>
            <button style={tabStyle('insights')} onClick={() => setActiveTab('insights')}>🧠 AI Insights</button>
          </div>

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Activity Ring + Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
                {/* Ring */}
                <div style={{
                  background: '#ffffff', borderRadius: 24, padding: 28,
                  border: '1px solid #e2e8f0', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 12,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                  <ActivityRing
                    percentage={summary.stepsPercentage} size={180} strokeWidth={16}
                    color="#10b981" label="Daily Steps"
                    value={summary.steps.toLocaleString()}
                    subtitle={`of ${summary.stepsGoal.toLocaleString()}`}
                  />
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Active</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>{summary.activeMinutes}m</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Distance</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ec4899' }}>{summary.distance}km</div>
                    </div>
                  </div>
                </div>

                {/* Stat Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
                  {statCards.map((card, i) => (
                    <div key={i} style={{
                      background: card.bg, borderRadius: 18, padding: '18px 16px',
                      border: `1px solid ${card.border}`,
                      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
                      animation: `fadeSlideUp 0.5s ease ${i * 0.1}s both`
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${card.border}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <card.icon size={20} color={card.color} />
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500 }}>{card.label}</span>
                      </div>
                      <div style={{ fontSize: '1.7rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
                        {card.value}
                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b', marginLeft: 3 }}>{card.unit}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 6 }}>{card.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Heart Rate Preview */}
              <div style={{
                background: '#ffffff', borderRadius: 24, padding: '20px 24px',
                border: '1px solid #e2e8f0', backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Heart size={18} color="#ef4444" /> 24h Heart Rate
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Last 24 hours</span>
                </div>
                <HeartRateChart data={heartRateData} width={800} height={200} />
              </div>
            </div>
          )}

          {/* ─── HEART RATE TAB ─── */}
          {activeTab === 'heart' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: '#ffffff', borderRadius: 24, padding: '24px',
                border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={22} color="#ef4444" /> Heart Rate Monitor
                </h3>
                
                {/* Current HR display */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
                  <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(239,68,68,0.1)', borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>Current</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444' }}>{summary.heartRate}<span style={{ fontSize: '0.9rem', color: '#64748b' }}> bpm</span></div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(99,102,241,0.1)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>Resting</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#6366f1' }}>{summary.heartRateMin}<span style={{ fontSize: '0.9rem', color: '#64748b' }}> bpm</span></div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(245,158,11,0.1)', borderRadius: 16, border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>Peak</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b' }}>{summary.heartRateMax}<span style={{ fontSize: '0.9rem', color: '#64748b' }}> bpm</span></div>
                  </div>
                </div>

                {/* Zone legend */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  {[
                    { label: 'Rest', color: '#6366f1', range: '<60' },
                    { label: 'Normal', color: '#10b981', range: '60-100' },
                    { label: 'Cardio', color: '#f59e0b', range: '100-140' },
                    { label: 'Peak', color: '#ef4444', range: '140+' }
                  ].map(z => (
                    <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.color }} />
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{z.label} ({z.range})</span>
                    </div>
                  ))}
                </div>

                <HeartRateChart data={heartRateData} width={800} height={250} />
              </div>
            </div>
          )}

          {/* ─── ACTIVITY TAB ─── */}
          {activeTab === 'activity' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{
                background: '#ffffff', borderRadius: 24, padding: '24px',
                border: '1px solid #e2e8f0', gridColumn: '1 / -1',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Footprints size={20} color="#10b981" /> Weekly Steps
                </h3>
                <StepsChart data={stepsData} height={220} />
              </div>

              {/* Activity Rings */}
              <div style={{
                background: 'rgba(15,23,42,0.8)', borderRadius: 24, padding: '24px',
                border: '1px solid rgba(51,65,85,0.4)', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 20
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>🎯 Today's Goals</h3>
                <ActivityRing percentage={summary.stepsPercentage} size={150} color="#10b981" label="Steps" value={summary.steps.toLocaleString()} subtitle={`of ${summary.stepsGoal.toLocaleString()}`} />
              </div>

              <div style={{
                background: '#ffffff', borderRadius: 24, padding: '24px',
                border: '1px solid #e2e8f0', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>🎯 Today's Goals</h3>
                <ActivityRing percentage={Math.round((summary.calories / summary.caloriesGoal) * 100)} size={150} color="#f59e0b" label="Calories" value={summary.calories.toLocaleString()} subtitle={`of ${summary.caloriesGoal}`} />
              </div>
            </div>
          )}

          {/* ─── SLEEP TAB ─── */}
          {activeTab === 'sleep' && (
            <div style={{
              background: '#ffffff', borderRadius: 24, padding: '28px',
              border: '1px solid #e2e8f0', maxWidth: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Moon size={22} color="#8b5cf6" /> Sleep Analysis
              </h3>
              <SleepChart data={summary.sleep} />
            </div>
          )}

          {/* ─── AI INSIGHTS TAB ─── */}
          {activeTab === 'insights' && weeklyTrends && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Weekly Summary */}
              <div style={{
                background: '#ffffff', borderRadius: 24, padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={20} color="#10b981" /> Weekly Summary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Avg Heart Rate', value: `${weeklyTrends.avgHeartRate} bpm`, trend: weeklyTrends.heartRateTrend, color: '#ef4444', icon: '💓' },
                    { label: 'Avg Steps', value: weeklyTrends.avgSteps.toLocaleString(), trend: weeklyTrends.stepsTrend, color: '#10b981', icon: '🚶' },
                    { label: 'Avg Sleep', value: `${weeklyTrends.avgSleepHours} hrs`, trend: weeklyTrends.sleepTrend, color: '#8b5cf6', icon: '🌙' },
                    { label: 'Avg SpO2', value: `${weeklyTrends.avgSpo2}%`, trend: 0, color: '#06b6d4', icon: '🫁' },
                    { label: 'Consistency', value: `${weeklyTrends.consistencyScore}%`, trend: null, color: '#f59e0b', icon: '🎯' }
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: '#f8fafc', borderRadius: 16, padding: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 6 }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                      {item.trend !== null && item.trend !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          {item.trend > 0 ? <TrendingUp size={12} color="#10b981" /> : item.trend < 0 ? <TrendingDown size={12} color="#ef4444" /> : null}
                          <span style={{ fontSize: '0.65rem', color: item.trend > 0 ? '#10b981' : item.trend < 0 ? '#ef4444' : '#64748b' }}>
                            {item.trend > 0 ? '+' : ''}{typeof item.trend === 'number' ? (Math.abs(item.trend) > 100 ? item.trend.toLocaleString() : item.trend) : item.trend} vs last week
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights Cards */}
              <div style={{
                background: '#ffffff', borderRadius: 24, padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={20} color="#a78bfa" /> AI Health Insights
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {weeklyTrends.insights.map((insight, i) => {
                    const bgColors = { success: 'rgba(16,185,129,0.08)', warning: 'rgba(245,158,11,0.08)', alert: 'rgba(239,68,68,0.08)', info: 'rgba(99,102,241,0.08)', tip: 'rgba(139,92,246,0.08)' };
                    const borderColors = { success: 'rgba(16,185,129,0.2)', warning: 'rgba(245,158,11,0.2)', alert: 'rgba(239,68,68,0.2)', info: 'rgba(99,102,241,0.2)', tip: 'rgba(139,92,246,0.2)' };
                    return (
                      <div key={i} style={{
                        background: bgColors[insight.type] || bgColors.info,
                        borderRadius: 16, padding: '14px 18px',
                        border: `1px solid ${borderColors[insight.type] || borderColors.info}`,
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        animation: `fadeSlideUp 0.4s ease ${i * 0.1}s both`
                      }}>
                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{insight.icon}</span>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>{insight.message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Last sync info */}
          {lastSync && (
            <div style={{ textAlign: 'center', marginTop: 24, color: '#475569', fontSize: '0.7rem' }}>
              Last synced: {lastSync.toLocaleTimeString()} • {summary?.deviceName || 'Demo Device'}
              {' '} • <button onClick={handleDisconnect} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', textDecoration: 'underline' }}>Disconnect</button>
            </div>
          )}
        </>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GoogleFitDashboard;
