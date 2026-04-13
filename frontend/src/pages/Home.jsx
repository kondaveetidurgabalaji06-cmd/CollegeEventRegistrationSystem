import React, { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import { Sparkles } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production we would use the dynamic proxy or env variable
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>Discover Next-Gen <span className="text-gradient">Campus Experiences</span></h1>
        <p>Your one-stop destination for tech symposiums, workshops, hackathons, and cultural fests.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => document.getElementById('events-list').scrollIntoView({ behavior: 'smooth' })}>
          <Sparkles size={18} />
          Explore Events
        </button>
      </section>

      <section className="events-section" id="events-list">
        <div className="section-header">
          <h2 className="section-title">Upcoming Events</h2>
        </div>
        
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
           <div className="events-grid">
             {events.length > 0 ? (
               events.map(event => (
                 <EventCard key={event.id} event={event} />
               ))
             ) : (
               <p style={{ color: 'var(--text-secondary)' }}>No events scheduled at the moment.</p>
             )}
           </div>
        )}
      </section>
    </div>
  );
};

export default Home;
