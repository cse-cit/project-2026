import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const withDatabaseName = (uri, dbName) => {
    if (!uri) {
        throw new Error('MONGODB_URI is missing in .env');
    }

    const [baseUri, queryString] = uri.split('?');
    const normalizedBase = baseUri.replace(/\/$/, '');
    const hasDatabaseName = /mongodb(\+srv)?:\/\/[^/]+\/[^?]+/.test(normalizedBase);

    if (hasDatabaseName) {
        return uri;
    }

    return `${normalizedBase}/${dbName}${queryString ? `?${queryString}` : ''}`;
};

const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        await mongoose.connect(withDatabaseName(process.env.MONGODB_URI, 'quickgpt'));
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;
