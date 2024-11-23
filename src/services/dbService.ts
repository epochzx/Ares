import { handleError } from '../utils/errorHandler';
import { MongoClient, Document, WithId, Db } from 'mongodb';
import mongoose from 'mongoose';
import settings from '../settings.json';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

export async function getDocuments<T extends Document>(collectionName: string, query: object, sort?: object): Promise<WithId<T>[]> {
    try {
        if (!mongoClient || !db) {
            return [];
        }

        const collection = db.collection<T>(collectionName);

        if (!sort) {
            return await collection.find(query).toArray();
        } else {
            return await collection.find(query, sort).toArray();
        }
    } catch (error) {
        await handleError(error as Error, `Error getting data from database`);
        throw new Error(`Failed to get data from the database: ${error}`);
    }
}

export async function getOneDocument<T extends Document>(collectionName: string, query: object): Promise<WithId<T> | null> {
    try {
        if (!mongoClient || !db) { 
            return null; 
        }

        const collection = db.collection<T>(collectionName);
        return await collection.findOne(query);
    } catch (error) {
        await handleError(error as Error, `Error getting data from  database`);
        throw new Error(`Failed to get data from the database: ${error}`);
    }
}

export async function createDocument(collectionName: string, document: object): Promise<boolean | undefined> {
    try {
        if (!mongoClient || !db) { 
            return; 
        }

        const collection = db.collection(collectionName);
        await collection.insertOne(document);

        return true;
    } catch (error) {
        await handleError(error as Error, `Error writing data to the database`);
        throw new Error(`Failed to write data to the database: ${error}`);
    }
}

export async function deleteDocument(collectionName: string, query: object): Promise<boolean | undefined> {
    try {
        if (!mongoClient || !db) { 
            return; 
        }

        const collection = db.collection(collectionName);
        const document = await getOneDocument(collectionName, query);

        if (document == null) {
            return;
        }

        await collection.deleteOne(query);

        return true;
    } catch (error) {
        await handleError(error as Error, `Error writing data to the database`);
        throw new Error(`Failed to write data to the database: ${error}`);
    }
}

export async function updateDocument(collectionName: string, query: object, updateParams: object): Promise<boolean | undefined> {
    try {
        if (!mongoClient || !db) { 
            return; 
        }

        const collection = db.collection(collectionName);
        await collection.updateOne(query, { $set: updateParams });

        return true;
    } catch (error) {
        await handleError(error as Error, `Error writing data to the database`);
        throw new Error(`Failed to write data to the database: ${error}`);
    }
}
    
export async function initMongoClient(): Promise<void> {
    if (!settings.loadMongoDB) {
        console.log(`✖️   MongoDB loading has been disabled`);
        return;
    }

    try {
        if (!mongoClient) {
            mongoClient = new MongoClient(process.env.mongodb as string);
            db = mongoClient.db('main');

            await mongoose.connect(process.env.mongodb as string).then(() => {
                console.log('✅  Successfully connected to MongoDB');
            });
        }
    } catch (error) {
        await handleError(error as Error, `MongoDB Client Connection Failure`);
        throw new Error(error as string);
    }
}