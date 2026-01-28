const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        // Only use memory server if explicitly set to localhost
        if (uri && uri.includes('localhost')) {
            console.log('Starting MongoDB Memory Server (localhost detected)...');
            mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log('Memory server started at:', uri);
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.error('Full error:', err);
        console.error('URI used:', process.env.MONGODB_URI?.substring(0, 50) + '...');

        // fallback to memory server if connection fails
        if (!mongod) {
            console.log('Falling back to MongoDB Memory Server...');
            try {
                mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                console.log('Memory server started at:', uri);
                await mongoose.connect(uri);
                console.log('Connected to in-memory MongoDB');
            } catch (memErr) {
                console.error('Memory server also failed:', memErr.message);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
