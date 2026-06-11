const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({});
  console.log("Database reset done (users only)");
  process.exit();
});