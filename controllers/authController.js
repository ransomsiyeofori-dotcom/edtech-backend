const User = require("../models/User");


const verifyOtp = async (req, res) => {
 try { const { email, otp } = req.body;
 
  if(!email || !otp) { return res.status(400).json({ success: false,
                message: "Email and OTP are required"});}
   
 }
   
 
};

module.exports = { verifyOtp };