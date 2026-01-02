import mongoose from 'mongoose';

try {
	const mongoURI = process.env.MONGO_URI;
	if (!mongoURI) throw new Error('Missing connection string');
	await mongoose.connect(mongoURI, { dbName: 'node-http' });
	console.log('\x1b[35mMongoDB connected via Mongoose\x1b[0m');
} catch (error) {
	console.error('MongoDB connection error:', error);
	process.exit(1);
}
