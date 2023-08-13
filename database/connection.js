const mongoose = require("mongoose");

// Connect MongoDB at default port 27017.

const connection = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/my_social_network");
    console.log("database connection established");
  } catch (err) {
    throw new Error("Error in DB connection: " + err);
  }
};

module.exports = connection;
