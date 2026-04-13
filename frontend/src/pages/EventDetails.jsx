import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Users, Ticket, ArrowLeft, CheckCircle2 } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_id: ''
  });
  const [registering, setRegistering] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetch(`http://localhost:5000/api/events/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Event not found');
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        setStatus({ type: 'error', message: err.message });
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: id,
          ...formData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setStatus({ type: 'success', message: 'You have successfully registered for this event!' });
      
      // Update local event capacity count
      setEvent(prev => ({
        ...prev,
        registered_count: prev.registered_count + 1
      }));
      setFormData({ student_name: '', student_email: '', student_id: '' });

    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Event Not Found</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Events
        </button>
      </div>
    );
  }

  const isFull = event.registered_count >= event.capacity;

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="event-details-layout">
        <div className="event-main-content">
          <div className="event-hero">
             <img src={event.image_url} alt={event.title} />
          </div>
          
          <div className="event-info-block">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{event.title}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              {event.description}
            </p>

            <div className="info-grid">
              <div className="info-card">
                <CalendarDays size={24} />
                <div className="info-card-content">
                  <h4>Date</h4>
                  <p>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="info-card">
                <Clock size={24} />
                <div className="info-card-content">
                  <h4>Time</h4>
                  <p>{event.time}</p>
                </div>
              </div>

              <div className="info-card">
                <MapPin size={24} />
                <div className="info-card-content">
                  <h4>Location</h4>
                  <p>{event.location}</p>
                </div>
              </div>

              <div className="info-card">
                <Users size={24} />
                <div className="info-card-content">
                  <h4>Availability</h4>
                  <p>{event.capacity - event.registered_count} seats remaining out of {event.capacity}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="registration-board">
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="form-header">
               <Ticket size={32} className="text-gradient" style={{ margin: '0 auto 1rem' }} />
               <h3>Secure Your Spot</h3>
            </div>

            {status.type === 'success' ? (
              <div className="alert alert-success">
                 <CheckCircle2 size={48} style={{ margin: '0 auto 1rem', color: '#10B981' }} />
                 <h4 style={{ marginBottom: '0.5rem', color: '#10B981' }}>Registration Confirmed!</h4>
                 <p>{status.message}</p>
                 <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1.5rem', width: '100%' }}>
                    Explore More Events
                 </button>
              </div>
            ) : (
              <form className="registration-form" onSubmit={handleRegister}>
                {status.type === 'error' && (
                  <div className="alert alert-error">
                    {status.message}
                  </div>
                )}
                
                <div className="input-group">
                  <label className="input-label" htmlFor="student_name">Full Name</label>
                  <input 
                    type="text" 
                    id="student_name" 
                    name="student_name" 
                    className="input-field" 
                    placeholder="e.g. Jane Doe" 
                    required 
                    value={formData.student_name}
                    onChange={handleInputChange}
                    disabled={isFull || registering}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="student_email">College Email</label>
                  <input 
                    type="email" 
                    id="student_email" 
                    name="student_email" 
                    className="input-field" 
                    placeholder="e.g. jane@college.edu" 
                    required 
                    value={formData.student_email}
                    onChange={handleInputChange}
                    disabled={isFull || registering}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="student_id">Roll Number / Student ID</label>
                  <input 
                    type="text" 
                    id="student_id" 
                    name="student_id" 
                    className="input-field" 
                    placeholder="e.g. 21CS001" 
                    required 
                    value={formData.student_id}
                    onChange={handleInputChange}
                    disabled={isFull || registering}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isFull || registering}
                  style={{ marginTop: '1rem' }}
                >
                  {registering ? 'Processing...' : (isFull ? 'Event is Full' : 'Register Now')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
