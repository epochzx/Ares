/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { handleError } from '../utils/errorHandler';
import { MongoClient, Document, WithId, Db } from 'mongodb';
import settings from '../settings.json';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

async function handleDatabaseOperation<T>(operation: () => Promise<T>, force?: boolean): Promise<T> {
    if (!force) {
        if (!mongoClient || !db) {
            throw new Error('MongoClient or DB not initialised');
        }
    }

    try {
        return await operation();
    } catch (error) {
        await handleError(error as Error, `Database operation failed`);
        throw new Error('Database operation failed');
    }
}

export async function getDocuments<T extends Document>(collectionName: string, query: object, sort?: object): Promise<WithId<T>[]> {
    return await handleDatabaseOperation(async () => {
        const collection = db!.collection<T>(collectionName);

        if (!sort) {
            return await collection.find(query).toArray();
        } else {
            return await collection.find(query, sort).toArray();
        }
    });
}

export async function getOneDocument<T extends Document>(collectionName: string, query: object): Promise<WithId<T> | null> {
    return await handleDatabaseOperation(() => {
        const collection = db!.collection<T>(collectionName);
        return collection.findOne(query);
    });
}

export async function createDocument(collectionName: string, document: object): Promise<boolean> {
    return await handleDatabaseOperation(async () => {
        const collection = db!.collection(collectionName);
        await collection.insertOne(document);

        return true;
    });
}

export async function deleteDocument(collectionName: string, query: object): Promise<boolean | undefined> {
    return await handleDatabaseOperation(async () => {
        const collection = db!.collection(collectionName);
        const document = await getOneDocument(collectionName, query);

        if (document == null) {
            return;
        }

        await collection.deleteOne(query);

        return true;
    });
}

export async function updateDocument(collectionName: string, query: object, updateParams: object): Promise<boolean> {
    return await handleDatabaseOperation(async () => { 
        if (!mongoClient || !db) { 
            throw new Error(`MongoClient or DB missing`);
        }

        const collection = db.collection(collectionName);
        await collection.updateOne(query, { $set: updateParams });

        return true;
    });
}
    
export async function initMongoClient(): Promise<void> {
    if (!settings.loadMongoDB) {
        console.log(`✖️   MongoDB loading has been disabled`);
        return;
    }

    return await handleDatabaseOperation(async () => {
        if (!mongoClient) {
            mongoClient = new MongoClient(process.env.mongodb as string);
            db = mongoClient.db('main');

            console.log(`✅  Successfully connected to MongoDB`);
        }
    }, true);
}

export async function closeMongoClient(): Promise<void> {
    return await handleDatabaseOperation(async () => {
        if (mongoClient) {
            await mongoClient.close();
            mongoClient = null;
        }
    });
}