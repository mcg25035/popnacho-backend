const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const popCountSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('PopCount', popCountSchema);
