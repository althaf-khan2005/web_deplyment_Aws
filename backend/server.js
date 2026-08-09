// IMPORTANT: tracing must be imported FIRST before any other modules
import './tracing.js';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import traceRoutes, { requestRecorder } from './routes/traces.js';
import { errorLogger, requestTimer, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// CORS - allow frontend to reach backend
app.use(cors({
  origin: [
    'https://d1odyai7xs2p0i.cloudfront.net',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());

// Record all requests for the trace viewer
app.use(requestRecorder);

// Request timing (tracks duration for every request)
app.use(requestTimer);

// Routes
app.use('/api/auth', authRoutes);
app.use('/', healthRoutes);
app.use('/', traceRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last middleware)
app.use(errorLogger);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Health check:  http://localhost:${PORT}/health`);
  console.log(`🔭 Trace viewer:  http://localhost:${PORT}/health/traces`);
});
