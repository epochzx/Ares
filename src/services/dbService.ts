/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleError} from '../utils/errorHandler';
import { MongoClient } from 'mongodb';

let mongoClient: MongoClient | null = null;

export async function getDocuments(collectionName: string, query: object, sort?: object): Promise<any[]> {
    try {
        const mongoClient = await getMongoClient();
        const db = mongoClient.db('main');

        const collection = db.collection(collectionName);

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

export async function getOneDocument(collectionName: string, query: object): Promise<any | null> {
    try {
        const mongoClient = await getMongoClient();
        const db = mongoClient.db('main');

        const collection = db.collection(collectionName);
        return await collection.findOne(query);
    } catch (error) {
        await handleError(error as Error, `Error getting data from  database`);
        throw new Error(`Failed to get data from the database: ${error}`);
    }
}

export async function createDocument(collectionName: string, document: object): Promise<any | null> {
    try {
        const mongoClient = await getMongoClient();
        const db = mongoClient.db('main');

        const collection = db.collection(collectionName);
        await collection.insertOne(document);

        return true;
    } catch (error) {
        await handleError(error as Error, `Error writing data to the database`);
        throw new Error(`Failed to write data to the database: ${error}`);
    }
}

export async function deleteDocument(collectionName: string, query: object): Promise<any | null> {
    try {
        const mongoClient = await getMongoClient();
        const db = mongoClient.db('main');

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

export async function updateDocument(collectionName: string, query: object, updateParams: object): Promise<any | null> {
    try {
        const mongoClient = await getMongoClient();
        const db = mongoClient.db('main');

        const collection = db.collection(collectionName);
        await collection.updateOne(query, { $set: updateParams });

        return true;
    } catch (error) {
        await handleError(error as Error, `Error writing data to the database`);
        throw new Error(`Failed to write data to the database: ${error}`);
    }
}

export async function getMongoClient(): Promise<MongoClient> {
    try {
        if (!mongoClient) {
            mongoClient = new MongoClient(process.env.mongodb as string);

            await mongoClient.connect();
            console.log('✅  Successfully connected to MongoDB');

            return mongoClient;
        } else {
            return mongoClient;
        }
    } catch (error) {
        await handleError(error as Error, `MongoDB Client Connection Failure`);
        throw new Error(error as string);
    }
}