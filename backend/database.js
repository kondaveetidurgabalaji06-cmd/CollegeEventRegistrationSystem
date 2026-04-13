const mongoose = require('mongoose');
const dns = require('dns');

// Configure Node.js to use Google's DNS servers to avoid SRV resolution issues on some ISPs/networks
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
    console.warn("Could not set custom DNS servers.", error);
}

// URL encode the password since it contains an '@' character (balaji@123 -> balaji%40123)
const uri = "mongodb+srv://balaji:balaji%40123@cluster0.rv2awwn.mongodb.net/collegeEvents?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas.'))
.catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
    console.log('Attempting to connect to local MongoDB as fallback...');
    return mongoose.connect('mongodb://127.0.0.1:27017/collegeEvents')
        .then(() => console.log('Connected to local MongoDB.'))
        .catch(async localErr => {
            console.error('Failed to connect to local MongoDB too:', localErr.message);
            console.log('Attempting to use in-memory database as last resort...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create();
                const memoryUri = mongoServer.getUri();
                await mongoose.connect(memoryUri, { useNewUrlParser: true, useUnifiedTopology: true });
                console.log('Connected to In-Memory MongoDB Server successfully. Note: Data will be reset on server restart.');
            } catch (memoryErr) {
                console.error('Failed to start in-memory MongoDB server.', memoryErr.message);
                console.error('Please make sure you reinstall modules or have a local MongoDB running.');
            }
        });
});

// --- Schemas & Models ---

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  image_url: { type: String },
  capacity: { type: Number, required: true },
  registered_count: { type: Number, default: 0 }
});

// Transform _id to id for the frontend
eventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Event = mongoose.model('Event', eventSchema);

const registrationSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student_name: { type: String, required: true },
  student_email: { type: String, required: true },
  student_id: { type: String, required: true },
  registration_date: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

// --- Database Seeding ---

const seedDatabase = async () => {
    try {
        const count = await Event.countDocuments();
        if (count === 0) {
            console.log("Seeding initial events to MongoDB...");
            const seedEvents = [
                {
                    title: "Tech Symposium 2026",
                    description: "Annual university tech symposium featuring top tier tech talks, AI workshops, and hackathons.",
                    date: "2026-05-15",
                    time: "09:00 AM",
                    location: "Main Auditorium",
                    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    capacity: 500
                },
                {
                    title: "Web3 & Future of Crypto",
                    description: "Dive into blockchain technologies, decentralized finance (DeFi), and smart contracts.",
                    date: "2026-06-10",
                    time: "02:00 PM",
                    location: "Seminar Hall B",
                    image_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    capacity: 150
                },
                {
                    title: "Design Thinking Workshop",
                    description: "Learn UX/UI fundamentals, wireframing, and user-centric problem solving.",
                    date: "2026-07-05",
                    time: "10:30 AM",
                    location: "Innovation Lab",
                    image_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    capacity: 50
                },
                {
                    title: "Code Wars - 24hr Hackathon",
                    description: "Compete against the best minds in the university. Build real-world solutions. Win prizes.",
                    date: "2026-08-20",
                    time: "08:00 AM",
                    location: "Computer Center",
                    image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    capacity: 200
                }
            ];

            await Event.insertMany(seedEvents);
            console.log("Seed data successfully added.");
        }
    } catch (err) {
        console.error("Error during database check/seed:", err);
    }
};

mongoose.connection.once('open', () => {
    seedDatabase();
});

module.exports = {
    Event,
    Registration
};
