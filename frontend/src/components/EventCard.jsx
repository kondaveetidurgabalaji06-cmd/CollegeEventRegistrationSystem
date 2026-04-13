import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';

const EventCard = ({ event }) => {
  const isFull = event.registered_count >= event.capacity;

  return (
    <Link to={`/events/${event.id}`} className="event-card glass-panel">
      <div className="card-image-wrap">
        <img src={event.image_url} alt={event.title} className="card-image" />
        <div className="card-badge">
          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{event.title}</h3>
        
        <div className="card-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{event.time}</span>
          </div>
          <div className="meta-item">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        </div>
        
        <p className="card-desc">{event.description}</p>
        
        <div className="card-footer">
          <div className={`capacity-info ${isFull ? 'full' : ''}`}>
            <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            {event.registered_count} / {event.capacity} Filled
          </div>
          <span className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            {isFull ? 'Full' : 'View Details'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
