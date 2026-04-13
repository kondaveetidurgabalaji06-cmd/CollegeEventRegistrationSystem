import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <CalendarDays size={28} className="text-gradient" />
        <span>Campus<span className="text-gradient">Connect</span></span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
          Admin Panel
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
