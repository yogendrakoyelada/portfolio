import { Client, Databases, Storage, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a5d44b2003550cf12b1');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const DATABASE_ID = '6a5d45ee000552801c9d';
export const COLLECTION_ID = 'portfolio';
export const DOCUMENT_ID = 'main';
export const BUCKET_ID = 'portfolio-images';
