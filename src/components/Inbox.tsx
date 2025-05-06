
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllEmails, markEmailAsRead, deleteEmail } from '@/services/emailStorage';
import { getUserEmail, getUserPrivateKey, getContactPublicKey } from '@/services/keyStorage';
import { decryptMessage, verifySignature } from '@/utils/cryptoUtils';
import { useToast } from '@/hooks/use-toast';
import EncryptionBadge from './EncryptionBadge';
import { Mail, Trash } from 'lucide-react';
import type { Email } from '@/services/emailStorage';

const Inbox: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | undefined>(undefined);
  const { toast } = useToast();
  const userEmail = getUserEmail();

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = () => {
    const allEmails = getAllEmails();
    // Sort emails by date (newest first) and filter by recipient
    const userEmails = allEmails
      .filter(email => email.to === userEmail)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setEmails(userEmails);
  };

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);
    setDecryptedContent(null);
    setVerified(undefined);
    
    if (!email.read) {
      markEmailAsRead(email.id);
      loadEmails(); // Reload to update unread count
    }
    
    if (email.encrypted && email.encryptedData) {
      try {
        const privateKey = getUserPrivateKey();
        if (!privateKey) {
          toast({
            title: "Decryption failed",
            description: "Private key not found",
            variant: "destructive"
          });
          return;
        }
        
        const decrypted = decryptMessage(privateKey, email.encryptedData);
        setDecryptedContent(decrypted);
        
        // Verify signature if available
        if (email.signature) {
          const senderPublicKey = getContactPublicKey(email.from);
          if (senderPublicKey) {
            const isVerified = verifySignature(senderPublicKey, decrypted, email.signature);
            setVerified(isVerified);
            
            if (!isVerified) {
              toast({
                title: "Warning",
                description: "Email signature verification failed. The content may have been tampered with.",
                variant: "destructive"
              });
            }
          } else {
            setVerified(false);
            toast({
              title: "Cannot verify signature",
              description: "Sender's public key is not available",
            });
          }
        }
      } catch (error) {
        console.error("Decryption error:", error);
        toast({
          title: "Decryption failed",
          description: "Unable to decrypt this message",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteEmail = (id: string) => {
    deleteEmail(id);
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
      setDecryptedContent(null);
    }
    loadEmails();
    toast({
      title: "Email deleted",
      description: "The email has been removed from your inbox",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Inbox</h2>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Email list */}
        <div className="w-1/3 border-r overflow-y-auto">
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="h-12 w-12 mb-2" />
              <p>No emails in your inbox</p>
            </div>
          ) : (
            <div className="divide-y">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  className={`p-3 cursor-pointer ${
                    selectedEmail?.id === email.id ? 'bg-primary/10' : email.read ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-primary/5`}
                  onClick={() => handleSelectEmail(email)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{email.from}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(email.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium truncate">{email.subject}</div>
                  <div className="flex items-center justify-between mt-1">
                    <EncryptionBadge isEncrypted={email.encrypted} />
                    {!email.read && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Email detail view */}
        <div className="w-2/3 overflow-y-auto p-4">
          {selectedEmail ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedEmail.subject}</h3>
                    <div className="text-sm text-gray-500">
                      From: <span className="font-medium">{selectedEmail.from}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Date: {new Date(selectedEmail.date).toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <EncryptionBadge 
                        isEncrypted={selectedEmail.encrypted} 
                        isVerified={verified}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => handleDeleteEmail(selectedEmail.id)}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="border-t pt-4 whitespace-pre-wrap">
                  {selectedEmail.encrypted ? (
                    decryptedContent ? decryptedContent : "Decrypting..."
                  ) : (
                    selectedEmail.body
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="h-16 w-16 mb-2" />
              <p>Select an email to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
