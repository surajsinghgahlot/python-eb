// const crypto = require('crypto');
import crypto from 'crypto'

// Alice's side
const alice = crypto.createDiffieHellman(2048);  // Generate a Diffie-Hellman key exchange object with a 2048-bit prime
const aliceKeys = alice.generateKeys();          // Generate Alice's public and private keys

const alicePublicKey = alice.getPublicKey();     // Get Alice's public key
const alicePrivateKey = alice.getPrivateKey();   // Get Alice's private key

console.log('Alice\'s Public Key:', alicePublicKey.toString('hex'));

// Bob's side
const bob = crypto.createDiffieHellman(alice.getPrime(), alice.getGenerator()); // Use the same prime and generator as Alice
const bobKeys = bob.generateKeys();                  // Generate Bob's public and private keys

const bobPublicKey = bob.getPublicKey();             // Get Bob's public key
const bobPrivateKey = bob.getPrivateKey();           // Get Bob's private key

console.log('Bob\'s Public Key:', bobPublicKey.toString('hex'));

// Alice computes the shared secret using Bob's public key
const aliceSecret = alice.computeSecret(bobPublicKey);

console.log('Shared Secret (Alice\'s calculation):', aliceSecret.toString('hex'));

// Bob computes the shared secret using Alice's public key
const bobSecret = bob.computeSecret(alicePublicKey);

console.log('Shared Secret (Bob\'s calculation):', bobSecret.toString('hex'));

// Both secrets should be identical
console.log('Secrets match:', aliceSecret.equals(bobSecret));
