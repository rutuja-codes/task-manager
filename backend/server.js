const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://task-manager-orcin-chi-78.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Task Manager API is running!',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server + Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:4200',
      'https://task-manager-orcin-chi-78.vercel.app'
    ],
    methods: ['GET', 'POST']
  }
});

// Socket.io events
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('join_project', (projectId) => {
    socket.join(projectId);
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(projectId);
  });

  socket.on('task_updated', (data) => {
    socket.to(data.projectId).emit('task_updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ==========================================
  🚀 Server running in ${process.env.NODE_ENV} mode
  🌐 URL: http://localhost:${PORT}
  📡 Socket.io: Ready
  ==========================================
  `);
});