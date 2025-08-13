import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error('Tambahkan MONGODB_URI ke .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // globalThis agar TypeScript tahu ada property ini
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // Gunakan optional chaining agar aman
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
