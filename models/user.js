const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String
    },
    password: {
        type: String
    },
    joinTime: {
        type: Date,
        default: Date.now
    },
    googleId: {
        type: String
    },
    discordId: {
        type: String
    }
});

module.exports = mongoose.model('User', userSchema);
