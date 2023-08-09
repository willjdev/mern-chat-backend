const { Schema, model } = require('mongoose');

const messageSchema = Schema({
    sender: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    recipient: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    text: String,
    file: String
}, { timestamps: true });

module.exports = model( 'Message', messageSchema );