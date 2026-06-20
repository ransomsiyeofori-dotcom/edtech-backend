const User = require("../models/User");


const verifyOtp = async (req, res) => {
 try { const { email, otp } = req.body;
 
  if(!email || !otp) { return res.status(400).json({ success: false,
                message: "Email and OTP are required"});}
  
  const user = await User.findOne({ email });

if (!user) {
    return res.status(404).json({
        success: false,
        message: "User not found"
    });
}

if (Date.now() > user.resetOtpExpires) {
    return res.status(400).json({
        success: false,
        message: "OTP has expired"
    });
}

if (otp !== user.resetOtp) {
    return res.status(400).json({
        success: false,
        message: "Invalid OTP"
    });
}

user.resetOtp = undefined;
user.resetOtpExpires = undefined;
await user.save();

return res.status(200).json({
    success: true,
    message: "OTP verified successfully"
});
 }
 
 catch (error) { return res.status(500).json({ success: false,
          message: "server error"
  });
 }
 
};

module.exports = { verifyOtp };