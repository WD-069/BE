import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
 
const connectDB = async() => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('You successfully connected to MongoDB!');
  } catch(err) {
    console.error("Failed to connect to with error: ", err)
    process.exit(1);
  } 
}
export default connectDB;


