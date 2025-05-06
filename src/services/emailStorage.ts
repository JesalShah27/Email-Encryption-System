
import { EncryptedMessage } from '../utils/cryptoUtils';

// Types
export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  encrypted: boolean;
  read: boolean;
  encryptedData?: EncryptedMessage;
  signature?: string;
}

// Local storage key
const EMAILS_STORAGE = 'secure_mail_emails';

// Save a new email
export const saveEmail = (email: Email): boolean => {
  try {
    const storedEmailsJson = localStorage.getItem(EMAILS_STORAGE) || '[]';
    const storedEmails: Email[] = JSON.parse(storedEmailsJson);
    
    storedEmails.push(email);
    localStorage.setItem(EMAILS_STORAGE, JSON.stringify(storedEmails));
    return true;
  } catch (error) {
    console.error("Error saving email:", error);
    return false;
  }
};

// Get all emails
export const getAllEmails = (): Email[] => {
  try {
    const storedEmailsJson = localStorage.getItem(EMAILS_STORAGE) || '[]';
    return JSON.parse(storedEmailsJson);
  } catch (error) {
    console.error("Error retrieving emails:", error);
    return [];
  }
};

// Get a specific email by ID
export const getEmailById = (id: string): Email | null => {
  try {
    const storedEmailsJson = localStorage.getItem(EMAILS_STORAGE) || '[]';
    const storedEmails: Email[] = JSON.parse(storedEmailsJson);
    
    const email = storedEmails.find(e => e.id === id);
    return email || null;
  } catch (error) {
    console.error("Error retrieving email:", error);
    return null;
  }
};

// Mark an email as read
export const markEmailAsRead = (id: string): boolean => {
  try {
    const storedEmailsJson = localStorage.getItem(EMAILS_STORAGE) || '[]';
    const storedEmails: Email[] = JSON.parse(storedEmailsJson);
    
    const emailIndex = storedEmails.findIndex(e => e.id === id);
    if (emailIndex >= 0) {
      storedEmails[emailIndex].read = true;
      localStorage.setItem(EMAILS_STORAGE, JSON.stringify(storedEmails));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error marking email as read:", error);
    return false;
  }
};

// Delete an email
export const deleteEmail = (id: string): boolean => {
  try {
    const storedEmailsJson = localStorage.getItem(EMAILS_STORAGE) || '[]';
    const storedEmails: Email[] = JSON.parse(storedEmailsJson);
    
    const updatedEmails = storedEmails.filter(e => e.id !== id);
    localStorage.setItem(EMAILS_STORAGE, JSON.stringify(updatedEmails));
    return true;
  } catch (error) {
    console.error("Error deleting email:", error);
    return false;
  }
};

// Get unread email count
export const getUnreadCount = (): number => {
  try {
    const storedEmailsJson = localStorage.getItem(EMAILS_STORAGE) || '[]';
    const storedEmails: Email[] = JSON.parse(storedEmailsJson);
    
    return storedEmails.filter(e => !e.read).length;
  } catch (error) {
    console.error("Error counting unread emails:", error);
    return 0;
  }
};
