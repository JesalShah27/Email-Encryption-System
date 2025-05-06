import { KeyPair } from '../utils/cryptoUtils';

// Types for key storage
interface StoredPublicKey {
  email: string;
  publicKey: string;
}

// Local storage keys
const PRIVATE_KEY_STORAGE = 'secure_mail_private_key';
const PUBLIC_KEY_STORAGE = 'secure_mail_public_key';
const USER_EMAIL_STORAGE = 'secure_mail_user_email';
const CONTACT_KEYS_STORAGE = 'secure_mail_contact_keys';

// Store the user's key pair securely
export const storeUserKeys = (email: string, keyPair: KeyPair) => {
  try {
    localStorage.setItem(PRIVATE_KEY_STORAGE, keyPair.privateKey);
    localStorage.setItem(PUBLIC_KEY_STORAGE, keyPair.publicKey);
    localStorage.setItem(USER_EMAIL_STORAGE, email);
    return true;
  } catch (error) {
    console.error("Error storing keys:", error);
    return false;
  }
};

// Get the user's private key
export const getUserPrivateKey = (): string | null => {
  return localStorage.getItem(PRIVATE_KEY_STORAGE);
};

// Get the user's public key
export const getUserPublicKey = (): string | null => {
  return localStorage.getItem(PUBLIC_KEY_STORAGE);
};

// Get the user's email
export const getUserEmail = (): string | null => {
  return localStorage.getItem(USER_EMAIL_STORAGE);
};

// Store a contact's public key
export const storeContactPublicKey = (email: string, publicKey: string): boolean => {
  try {
    const storedKeysJson = localStorage.getItem(CONTACT_KEYS_STORAGE) || '[]';
    const storedKeys: StoredPublicKey[] = JSON.parse(storedKeysJson);
    
    // Check if the contact already exists
    const existingIndex = storedKeys.findIndex(k => k.email === email);
    if (existingIndex >= 0) {
      storedKeys[existingIndex].publicKey = publicKey;
    } else {
      storedKeys.push({ email, publicKey });
    }
    
    localStorage.setItem(CONTACT_KEYS_STORAGE, JSON.stringify(storedKeys));
    return true;
  } catch (error) {
    console.error("Error storing contact public key:", error);
    return false;
  }
};

// Get a contact's public key by email
export const getContactPublicKey = (email: string): string | null => {
  try {
    const storedKeysJson = localStorage.getItem(CONTACT_KEYS_STORAGE) || '[]';
    const storedKeys: StoredPublicKey[] = JSON.parse(storedKeysJson);
    
    const contact = storedKeys.find(k => k.email === email);
    return contact ? contact.publicKey : null;
  } catch (error) {
    console.error("Error retrieving contact public key:", error);
    return null;
  }
};

// Get all stored contacts with their public keys
export const getAllContacts = (): StoredPublicKey[] => {
  try {
    const storedKeysJson = localStorage.getItem(CONTACT_KEYS_STORAGE) || '[]';
    return JSON.parse(storedKeysJson);
  } catch (error) {
    console.error("Error retrieving contacts:", error);
    return [];
  }
};

// Check if the current user has keys set up
export const hasUserKeys = (): boolean => {
  return !!(getUserPrivateKey() && getUserPublicKey() && getUserEmail());
};

// Clear all stored keys (for logout)
export const clearAllKeys = (): void => {
  localStorage.removeItem(PRIVATE_KEY_STORAGE);
  localStorage.removeItem(PUBLIC_KEY_STORAGE);
  localStorage.removeItem(USER_EMAIL_STORAGE);
  // Optionally, you might want to keep the contact keys
};
