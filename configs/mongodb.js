import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
      console.log("Database name:", mongoose.connection.name);
      console.log("Database host:", mongoose.connection.host);
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
  }
};

export default connectDB;