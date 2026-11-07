
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import instructorRoutes from './routes/instructors.js';

const app = express();

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5175',
  credentials: false
}));

app.use(express.json());

// Reject MongoDB operators in client input
app.use((req, res, next) => {
  if (
    mongoSanitize.has(req.body) ||
    mongoSanitize.has(req.query)
  ) {
    return res.status(400).json({
      message: 'Invalid request input'
    });
  }

  // Sanitize parsed JSON request bodies
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }

  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructors', instructorRoutes);

// Not found
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server Error'
  });
});

export default app;
