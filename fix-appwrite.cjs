const { Client, Databases, Storage, Permission, Role, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a5d44b2003550cf12b1')
    .setKey('standard_831f321733d726e2983e474031fc0fa7be2ae76baf466ea2deb1bb0290b47a14937880817eb1a76cd0715a9365ac3f22abca64e35ba709896b82887258f108c46710cb0a0d539d264eb2add4473126cebcfc474b020c0032326d8f8e64b5847a61ba32609df2fe10f64d4d83b1ad3c3ddb102343682dcc943c28ef967f8eb7d5');

const databases = new Databases(client);
const storage = new Storage(client);
const databaseId = '6a5d45ee000552801c9d';
const collectionId = 'portfolio';

async function fix() {
  try {
    console.log('Updating Collection Permissions...');
    await databases.updateCollection(
      databaseId,
      collectionId,
      'Portfolio Data',
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.write(Role.any())
      ]
    );
    console.log('Collection permissions updated.');

    console.log('Updating Document Permissions...');
    // Sometimes document permissions override collection, so let's ensure the document is readable/writable by any
    await databases.updateDocument(
      databaseId,
      collectionId,
      'main',
      undefined, // don't change data
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.write(Role.any()),
        Permission.delete(Role.any())
      ]
    );
    console.log('Document permissions updated.');

    console.log('Creating Storage Bucket...');
    let bucketId = 'portfolio-images';
    try {
      await storage.createBucket(
        bucketId,
        'Portfolio Images',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ],
        false, // fileSecurity
        false, // antimalware
        undefined, // maxFileSize
        ['jpg', 'png', 'svg', 'jpeg', 'gif', 'webp'] // allowedFileExtensions
      );
      console.log('Bucket created: portfolio-images');
    } catch (e) {
      if (e.code === 409) {
        console.log('Bucket already exists, updating permissions...');
        await storage.updateBucket(
            bucketId,
            'Portfolio Images',
            [
              Permission.read(Role.any()),
              Permission.create(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any())
            ],
            false,
            false,
            undefined,
            ['jpg', 'png', 'svg', 'jpeg', 'gif', 'webp']
        );
      } else {
        throw e;
      }
    }

    console.log('Successfully fixed Appwrite!');
  } catch (error) {
    console.error('Error fixing Appwrite:', error);
  }
}

fix();
