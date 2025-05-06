
import forge from 'node-forge';

// Type definitions
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  encryptedData: string;
  iv: string;
  signature?: string;
}

const RSA_BITS = 2048;
const AES_BITS = 256;

// Generate RSA key pair
export const generateKeyPair = async (): Promise<KeyPair> => {
  return new Promise((resolve, reject) => {
    try {
      const rsa = forge.pki.rsa;
      console.log("Generating key pair...");
      rsa.generateKeyPair({ bits: RSA_BITS, workers: 2 }, (err, keypair) => {
        if (err) {
          console.error("Error generating key pair:", err);
          reject(err);
          return;
        }
        
        const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
        const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
        
        console.log("Key pair generated successfully");
        resolve({
          publicKey,
          privateKey
        });
      });
    } catch (error) {
      console.error("Exception in key generation:", error);
      reject(error);
    }
  });
};

// Encrypt email with recipient's public key
export const encryptMessage = (publicKeyPem: string, message: string): EncryptedMessage => {
  try {
    // Parse public key
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Generate a random AES key
    const aesKey = forge.random.getBytesSync(AES_BITS / 8);
    
    // Generate a random IV
    const iv = forge.random.getBytesSync(16);
    
    // Create cipher for AES encryption
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(message, 'utf8'));
    cipher.finish();
    const encryptedData = cipher.output.getBytes();
    
    // Encrypt the AES key with the RSA public key
    const encryptedKey = publicKey.encrypt(aesKey, 'RSA-OAEP');
    
    // Combine the encrypted key and encrypted data
    const combined = encryptedKey + encryptedData;
    
    return {
      encryptedData: forge.util.encode64(combined),
      iv: forge.util.encode64(iv)
    };
  } catch (error) {
    console.error("Error in encryption:", error);
    throw new Error("Encryption failed");
  }
};

// Decrypt email with user's private key
export const decryptMessage = (privateKeyPem: string, encryptedMessage: EncryptedMessage): string => {
  try {
    const { encryptedData, iv } = encryptedMessage;
    
    // Parse private key
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    
    // Decode the encrypted data and IV
    const combined = forge.util.decode64(encryptedData);
    const decodedIv = forge.util.decode64(iv);
    
    // Extract the encrypted AES key (RSA encryption output is always the same size as the key)
    const encryptedKey = combined.slice(0, privateKey.n.bitLength() / 8);
    const encryptedContent = combined.slice(privateKey.n.bitLength() / 8);
    
    // Decrypt the AES key
    const aesKey = privateKey.decrypt(encryptedKey, 'RSA-OAEP');
    
    // Decrypt the message with the AES key
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({iv: decodedIv});
    decipher.update(forge.util.createBuffer(encryptedContent));
    decipher.finish();
    
    return decipher.output.toString();
  } catch (error) {
    console.error("Error in decryption:", error);
    throw new Error("Decryption failed");
  }
};

// Sign a message with the sender's private key
export const signMessage = (privateKeyPem: string, message: string): string => {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    
    // Create SHA-256 hash of the message
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    
    // Sign the hash with the private key
    const signature = privateKey.sign(md);
    
    return forge.util.encode64(signature);
  } catch (error) {
    console.error("Error in signing:", error);
    throw new Error("Signing failed");
  }
};

// Verify a signature with the sender's public key
export const verifySignature = (publicKeyPem: string, message: string, signature: string): boolean => {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Create SHA-256 hash of the message
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    
    // Verify the signature
    return publicKey.verify(md.digest().getBytes(), forge.util.decode64(signature));
  } catch (error) {
    console.error("Error in signature verification:", error);
    return false;
  }
};
