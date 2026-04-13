require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Event, Registration } = require('./database');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Hardcoded default Admin details (Use environment variables in production)
const SECRET_KEY = process.env.JWT_SECRET || "college_event_super_secret_key";
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123"
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (token == null) return res.status(401).json({ error: "Access Denied: Missing Token" });
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Access Denied: Invalid Token" });
        req.user = user;
        next();
    });
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoints

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single event by ID
app.get('/api/events/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid Event ID structure" });
        }
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register for an event
app.post('/api/register', async (req, res) => {
    const { event_id, student_name, student_email, student_id } = req.body;

    if (!event_id || !student_name || !student_email || !student_id) {
        return res.status(400).json({ error: "Please provide all required fields." });
    }

    if (!mongoose.isValidObjectId(event_id)) {
        return res.status(400).json({ error: "Invalid Event ID structure." });
    }

    try {
        const event = await Event.findById(event_id);
        if (!event) return res.status(404).json({ error: "Event not found." });

        if (event.registered_count >= event.capacity) {
            return res.status(400).json({ error: "Event is fully booked." });
        }

        // Check if student already registered
        const existing = await Registration.findOne({ event_id, student_id });
        if (existing) {
            return res.status(400).json({ error: "Student is already registered for this event." });
        }

        // Transactions are generally required for absolute consistency, but for this app a simple await chain handles most cases
        const newReg = new Registration({
            event_id,
            student_name,
            student_email,
            student_id
        });
        
        await newReg.save();

        event.registered_count += 1;
        await event.save();

        res.status(201).json({ message: "Registration successful!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN ROUTES ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Create JWT token
        const token = jwt.sign({ username: username, role: 'admin' }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ token, message: "Login successful!" });
    } else {
        res.status(401).json({ error: "Invalid credentials." });
    }
});

// Add a new Event (Protected)
app.post('/api/events', authenticateToken, async (req, res) => {
    const { title, description, date, time, location, image_url, capacity } = req.body;
    
    if (!title || !description || !date || !time || !location || !capacity) {
        return res.status(400).json({ error: "Please provide all required fields." });
    }

    try {
        const newEvent = new Event({ title, description, date, time, location, image_url, capacity });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
