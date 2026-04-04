require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./src/routes/auth');
const projectRoutes = require('./src/routes/projectRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const skillRoutes = require('./src/routes/skillRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const tagRoutes = require('./src/routes/tagRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const newRoutes = require('./src/routes/newRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve vanilla frontend static files
app.use(express.static(path.join(__dirname, 'vanilla_frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/v2', newRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';

mongoose.connect(MONGODB_URI)
  .then(() => { 
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });

module.exports = app;
