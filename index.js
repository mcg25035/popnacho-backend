const express = require('express');
const mongoose = require('mongoose');
const assert = require('assert');
const passport = require('passport');
require('./config/passport');
const session = require('express-session');
const redis = require('redis');
const {RedisStore} = require('connect-redis');
const routes = require('express-routes');
const socketIO = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// MongoDB Configuration
const mongoUser = process.env.MONGODB_USER;
const mongoPass = process.env.MONGODB_PASS;
const mongoAddr = process.env.MONGODB_ADDR || 'localhost';
const mongoPort = process.env.MONGODB_PORT || 27017;
const mongoDBName = 'popnacho';

const mongoURI = `mongodb://${mongoUser}:${mongoPass}@${mongoAddr}:${mongoPort}/${mongoDBName}`;

// Define the Test model outside the function
const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));

let redisClient;
let redisStore;

async function checkRedisConnection() {
    try {
        const testKey = 'testKey';
        const testValue = 'testValue';
        await redisClient.set(testKey, testValue);
        const retrievedValue = await redisClient.get(testKey);
        assert.strictEqual(retrievedValue, testValue, 'Redis read/write operation failed');
        await redisClient.del(testKey);
        console.log('Redis read/write operation test passed');
    } catch (error) {
        console.error('Redis connection or operation error:', error);
        process.exit(1);
    }
}

async function initializeRedis() {
    // Configure Redis client
    redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    try {
        await redisClient.connect();
        console.log('Redis connection successful!');
    } catch (error) {
        console.error('Redis connection error:', error);
        process.exit(1);
    }

    // Initialize store.
    redisStore = new RedisStore({
        client: redisClient,
        prefix: 'popnacho:session:',
    });
}

async function checkMongoDBConnection() {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: 'admin' // Specify the authentication database
        });
        console.log('MongoDB connection and authentication successful!');

        // Perform a simple CRUD operation to verify authentication
        const testDoc = new Test({ name: 'test' });
        await testDoc.save();
        const foundDoc = await Test.findOne({ name: 'test' });
        assert.strictEqual(foundDoc.name, 'test', 'CRUD operation failed');
        await Test.deleteOne({ name: 'test' });
        console.log('CRUD operation test passed');

    } catch (error) {
        console.error('MongoDB connection or authentication error:', error);
    }
}

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
// require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Start the server after checking the MongoDB connection
const port = process.env.PORT || 3000;
async function startServer() {
    await initializeRedis();
    await checkRedisConnection();
    await checkMongoDBConnection();

    mongoose.connect(mongoURI).then(() => {
        console.log('Connected to MongoDB');
        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }).catch(err => {
        console.error('MongoDB connection error:', err);
    });
}

// Configure Redis client - REMOVE DUPLICATE
// const redisClient = redis.createClient({
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));

startServer();
