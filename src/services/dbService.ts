/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleError} from '../utils/errorHandler';
import { MongoClient, Document, WithId } from 'mongodb';
import settings from '../settings.json';

let mongoClient: MongoClient | null = null;

export async function getDocuments(collectionName: string, query: object, sort?: object): Promise<any> {
    try {
        const mongoClient = await getMongoClient();

        if (!mongoClient) { return null; }
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

export async function getOneDocument<T extends Document>(collectionName: string, query: object): Promise<WithId<T> | null> {
    try {
        const mongoClient = await getMongoClient();

        if (!mongoClient) { return null; }
        const db = mongoClient.db('main');

        const collection = db.collection<T>(collectionName);
        return await collection.findOne(query);
    } catch (error) {
        await handleError(error as Error, `Error getting data from  database`);
        throw new Error(`Failed to get data from the database: ${error}`);
    }
}

export async function createDocument(collectionName: string, document: object): Promise<boolean | undefined> {
    try {
        const mongoClient = await getMongoClient();

        if (!mongoClient) { return; }
        const db = mongoClient.db('main');

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
        const mongoClient = await getMongoClient();

        if (!mongoClient) { return; }
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

export async function updateDocument(collectionName: string, query: object, updateParams: object): Promise<boolean | undefined> {
    try {
        const mongoClient = await getMongoClient();

        if (!mongoClient) { return; }
        const db = mongoClient.db('main');

        const collection = db.collection(collectionName);
        await collection.updateOne(query, { $set: updateParams });

        return true;
    } catch (error) {
        await handleError(error as Error, `Error writing data to the database`);
        throw new Error(`Failed to write data to the database: ${error}`);
    }
}

export async function getMongoClient(): Promise<MongoClient | null> {
    if (!settings.loadMongoDB) {
        console.log(`✖️   MongoDB loading has been disabled`);
        return null;
    }

    try {
        if (!mongoClient) {
            mongoClient = new MongoClient(process.env.mongodb as string);

            await mongoClient.connect();
            console.log('✅  Successfully connected to MongoDB');
        }

        return mongoClient;
    } catch (error) {
        await handleError(error as Error, `MongoDB Client Connection Failure`);
        throw new Error(error as string);
    }
}