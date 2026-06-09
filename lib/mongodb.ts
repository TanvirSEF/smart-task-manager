import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URL;

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!uri || !clientPromise) {
    throw new Error("Missing DATABASE_URL environment variable. Please configure it in your Vercel project settings.");
  }
  const conn = await clientPromise;
  const db = conn.db();
  return { client: conn, db };
}
