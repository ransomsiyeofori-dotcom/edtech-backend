require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const contactRoute = require("./routes/contactRoute");

const resend = require("./email");

const app = express();

/* -------------------------- MIDDLEWARE -------------------------- */
app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);
app.use("/api", contactRoute);

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/* --------------------------- ROUTES ---------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({ message: "API running successfully" });
});

/*------------signup route--------*/

app.post("/signup", async (req, res) => {
  try {
    console.log("1. Request received");

    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      password,
      terms,
    } = req.body;

    console.log("2. Body parsed");

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    console.log("3. Validation passed");

    const existingUser = await User.findOne({ email });

    console.log("4. Checked existing user");

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("5. Password hashed");

    const newUser = await User.create({
      fullName,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword,
      terms,
    });

    console.log("6. User created");

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("7. Token created");
console.log("RETURNING TOKEN RESPONSE");
    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
    });

  } 
  //  CORRECT BACKEND (Deploy this to Render)
catch (error) {
  // Check if it's a MongoDB duplicate key constraint violation
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Email already exists" // 👈 Explicit friendly string
    });
  }

  // Log the actual server error on Render logs for your eyes only
  console.error("Backend Signup Error:", error);

  // Fallback for any other unexpected errors
  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}
});
/*------------ Login route -------------*/
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("USER FOUND:", user.email);

    if (!user.password) {
      return res.status(500).json({
        success: false,
        message: "User password missing in DB"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/*---------------- profile----------*/
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/*---------------Reset password route--------------*/

app.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("ROUTE HIT");
    console.log("BODY:", req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // EMAIL SENDING
    try {
      console.log("Before email send");
const result = await resend.emails.send({
  from: "onboarding@resend.dev",
  to: email,
  subject: "Password Reset OTP",
  html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
});

      console.log("EMAIL SENT:", result);
      console.log("After email send");

    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);

      return res.status(500).json({
        message: mailError.message || "Email sending failed",
      });
    }

    return res.json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("🔥 FULL ERROR START 🔥");
    console.error(error);
    console.log("🔥 FULL ERROR END 🔥");

    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
});

/* ------------------- DATABASE & SERVER LIFECYCLE ------------------- */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully");
    
    // START EXPRESS ONLY AFTER MONGOOSE SECURES THE CONNECTION
    app.listen(PORT, () => {
      console.log(`Server running safely on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Database connection error configuration failed:", error.message);
  });