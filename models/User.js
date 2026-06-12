const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  phone: {
    type: String,
    required: true
  },

  dateOfBirth: {
    type: Date,
    required: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  terms: {
    type: Boolean,
    required: true
  },
  resetOtp: {
  type: String
},

resetOtpExpires: {
  type: Date
},

}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;