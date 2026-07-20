const { Client, Storage, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a5d44b2003550cf12b1')
    .setKey('standard_831f321733d726e2983e474031fc0fa7be2ae76baf466ea2deb1bb0290b47a14937880817eb1a76cd0715a9365ac3f22abca64e35ba709896b82887258f108c46710cb0a0d539d264eb2add4473126cebcfc474b020c0032326d8f8e64b5847a61ba32609df2fe10f64d4d83b1ad3c3ddb102343682dcc943c28ef967f8eb7d5');

const storage = new Storage(client);
const bucketId = 'portfolio-images';

async function relaxBucket() {
  try {
    console.log('Updating Storage Bucket Permissions...');
    await storage.updateBucket(
        bucketId,
        'Portfolio Images',
        [
          Permission.read(Role.any()), 
          Permission.create(Role.users()), 
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ],
        false, // fileSecurity
        false, // antimalware
        undefined, // maxFileSize
        [] // allowedFileExtensions - EMPTY MEANS ALLOW ALL
    );

    console.log('Successfully relaxed bucket restrictions!');
  } catch (error) {
    console.error('Error:', error);
  }
}

relaxBucket();
