const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    name: String,
    email: String,
    skills: String,
    interest: String
});

module.exports = mongoose.model('Volunteer', volunteerSchema);