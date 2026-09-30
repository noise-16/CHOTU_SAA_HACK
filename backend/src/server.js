require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { initSocket } = require('./services/socketService');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.io with permissive CORS for Vite web app and Expo mobile app
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Initialize socket event hub
initSocket(io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CareWell Hospital OPD Smart Triage System',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('========================================================');
  console.log(`  🏥 CareWell Hospital OPD Backend is running`);
  console.log(`  📡 API Server: http://localhost:${PORT}`);
  console.log(`  🔌 Socket.io:  ws://localhost:${PORT}`);
  console.log('========================================================');
});
