// # Hier bauen wir gleich die MongoDB-Verbindung mit Mongoose
// const mongoose = require("mongoose")
import mongoose from "mongoose";

try {
  const connection = await mongoose.connect(process.env.MONGO_URI!);
  console.log("✔️ connected to MongoDB");
  console.log(`Using db: ${connection.connection.name}`);
} catch (error) {
  console.error("❌ MongoDB connection error: ", error);
  process.exit(1);
}

// ! Without `!` and a better error handling with a helper function - the "Patrick" way:

// function getEnv(key: string): string {
//   const value = process.env[key];
//   if (!value) throw new Error(`Missing env var: ${key}`);
//   return value;
// }

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(getEnv("MONGO_URI"));
//     console.log(`✔️ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error);
//     process.exit(1);
//   }
// };

// await connectDB();
