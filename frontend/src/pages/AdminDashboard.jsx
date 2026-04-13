import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');
    
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        image_url: '',
        capacity: 100
    });
    
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleChange = (e) => {
        setEventData({ ...eventData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            const data = await res.json();
            
            if (res.ok) {
                setStatus({ type: 'success', message: 'Event successfully created and published!' });
                setEventData({
                    title: '', description: '', date: '', time: '', location: '', image_url: '', capacity: 100
                });
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to create event.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="section-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="section-title">Admin <span className="text-gradient">Dashboard</span></h1>
                <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Logout
                </button>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--text)' }}>Create New Event</h2>
                
                {status.message && (
                    <div style={{ 
                        padding: '1rem', 
                        marginBottom: '1.5rem', 
                        borderRadius: '0.5rem', 
                        background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: status.type === 'error' ? '#ef4444' : '#10b981',
                        border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Event Title</label>
                        <input type="text" name="title" className="input-field" value={eventData.title} onChange={handleChange} required placeholder="E.g., Tech Symposium 2026" />
                    </div>
                    
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Description</label>
                        <textarea name="description" className="input-field" value={eventData.description} onChange={handleChange} required rows="4" placeholder="Event details..."></textarea>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Date</label>
                        <input type="date" name="date" className="input-field" value={eventData.date} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Time</label>
                        <input type="time" name="time" className="input-field" value={eventData.time} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Location</label>
                        <input type="text" name="location" className="input-field" value={eventData.location} onChange={handleChange} required placeholder="E.g., Main Auditorium" />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Capacity</label>
                        <input type="number" name="capacity" className="input-field" value={eventData.capacity} onChange={handleChange} required min="1" />
                    </div>

                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Image URL (Optional)</label>
                        <input type="url" name="image_url" className="input-field" value={eventData.image_url} onChange={handleChange} placeholder="https://images.unsplash.com/photo-..." />
                        <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>Provide a direct link to an image for the event card.</small>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                            {loading ? 'Publishing Event...' : 'Publish Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
