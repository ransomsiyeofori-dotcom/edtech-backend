const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://Ransomsiyeofori:Daniel1993@cluster0.v6ugs3k.mongodb.net/?appName=Cluster0")
.then(() => {
  console.log("Database connected");
})
.catch((error) => {
  console.log(error);
});

app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phone, dateOfBirth, password, terms } = req.body;
    
        const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      fullName,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword,
      terms
    });

    await newUser.save();

    res.status(201).json({ message: "Signup successful", user: newUser });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});