const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/question');
const answerRoutes = require('./routes/answer');
const notificationRoutes = require('./routes/notification');

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/notifications', notificationRoutes);

mongoose.connect(process.env.MONGO_URI, () => console.log('MongoDB connected'));

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
