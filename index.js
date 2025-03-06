const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis').default;
const routes = require('express-routes');
const socketIO = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configure Redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Initialize store.
const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'popnacho:session:',
});

// Session middleware
app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Passport configuration
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const leaderboardRoutes = require('./routes/leaderboard');
app.use('/auth', authRoutes);
app.use('/leaderboard', leaderboardRoutes);

// Socket.IO
io.on('connection', socket => {
    console.log('User connected');

    socket.on('pop', async (userId) => {
        try {
            let popCount = await PopCount.findOne({ user: userId });
            if (!popCount) {
                popCount = new PopCount({ user: userId, count: 0 });
            }

            popCount.count += 1;
            await popCount.save();

            io.emit('popUpdate', { userId: userId, count: popCount.count });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
