import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config();

const mongoClient = new MongoClient("mongodb://localhost:27017")

try {
    await mongoClient.connect()
} catch (error) {
    
}

const db = mongoClient.db("MyWallet")

export default db