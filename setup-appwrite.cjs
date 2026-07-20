const { Client, Databases, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a5d44b2003550cf12b1')
    .setKey('standard_831f321733d726e2983e474031fc0fa7be2ae76baf466ea2deb1bb0290b47a14937880817eb1a76cd0715a9365ac3f22abca64e35ba709896b82887258f108c46710cb0a0d539d264eb2add4473126cebcfc474b020c0032326d8f8e64b5847a61ba32609df2fe10f64d4d83b1ad3c3ddb102343682dcc943c28ef967f8eb7d5');

const databases = new Databases(client);
const databaseId = '6a5d45ee000552801c9d';

async function setup() {
  try {
    console.log('Creating collection...');
    const collection = await databases.createCollection(
      databaseId,
      ID.custom('portfolio'),
      'Portfolio Data',
      [] // permissions
    );
    console.log('Collection created:', collection.$id);

    console.log('Creating attribute...');
    await databases.createStringAttribute(databaseId, collection.$id, 'jsonString', 100000, true);
    
    // Wait for attribute to be available
    console.log('Waiting for attribute to be ready...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('Reading data.json...');
    const dataPath = path.join(__dirname, 'public', 'data', 'data.json');
    const dataString = fs.readFileSync(dataPath, 'utf8');

    console.log('Creating document...');
    const document = await databases.createDocument(
      databaseId,
      collection.$id,
      ID.custom('main'),
      { jsonString: dataString }
    );
    
    console.log('Successfully set up Appwrite!');
    console.log('Collection ID:', collection.$id);
    console.log('Document ID:', document.$id);

  } catch (error) {
    console.error('Error setting up Appwrite:', error);
  }
}

setup();
