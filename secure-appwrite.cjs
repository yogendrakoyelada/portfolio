const { Client, Databases, Storage, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a5d44b2003550cf12b1')
    .setKey('standard_831f321733d726e2983e474031fc0fa7be2ae76baf466ea2deb1bb0290b47a14937880817eb1a76cd0715a9365ac3f22abca64e35ba709896b82887258f108c46710cb0a0d539d264eb2add4473126cebcfc474b020c0032326d8f8e64b5847a61ba32609df2fe10f64d4d83b1ad3c3ddb102343682dcc943c28ef967f8eb7d5');

const databases = new Databases(client);
const storage = new Storage(client);
const databaseId = '6a5d45ee000552801c9d';
const collectionId = 'portfolio';
const bucketId = 'portfolio-images';

async function secure() {
  try {
    console.log('Securing Collection Permissions...');
    // Anyone can read, but only authenticated users can update
    await databases.updateCollection(
      databaseId,
      collectionId,
      'Portfolio Data',
      [
        Permission.read(Role.any()),
        Permission.update(Role.users()),
        Permission.write(Role.users())
      ]
    );

    console.log('Securing Document Permissions...');
    await databases.updateDocument(
      databaseId,
      collectionId,
      'main',
      undefined,
      [
        Permission.read(Role.any()),
        Permission.update(Role.users()),
        Permission.write(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('Securing Storage Bucket Permissions...');
    await storage.updateBucket(
        bucketId,
        'Portfolio Images',
        [
          Permission.read(Role.any()), // Anyone can view images
          Permission.create(Role.users()), // Only admin can upload
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ],
        false,
        false,
        undefined,
        ['jpg', 'png', 'svg', 'jpeg', 'gif', 'webp']
    );

    console.log('Successfully secured Appwrite!');
  } catch (error) {
    console.error('Error securing Appwrite:', error);
  }
}

secure();
