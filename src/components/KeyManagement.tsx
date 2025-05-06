
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { getUserEmail, getUserPublicKey, storeContactPublicKey, getAllContacts } from '@/services/keyStorage';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Plus, Copy, Check, X } from 'lucide-react';

const KeyManagement: React.FC = () => {
  const [contactEmail, setContactEmail] = useState('');
  const [contactPublicKey, setContactPublicKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [contacts, setContacts] = useState<{ email: string; publicKey: string }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const userPublicKey = getUserPublicKey() || '';
  const userEmail = getUserEmail() || '';
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const allContacts = getAllContacts();
    setContacts(allContacts);
  };

  const handleAddContact = () => {
    if (!contactEmail || !contactPublicKey) {
      toast({
        title: "Missing information",
        description: "Please provide both email and public key",
        variant: "destructive"
      });
      return;
    }
    
    if (!contactEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = storeContactPublicKey(contactEmail, contactPublicKey);
      
      if (success) {
        toast({
          title: "Contact added",
          description: "Public key has been stored successfully",
        });
        
        // Clear form and reload contacts
        setContactEmail('');
        setContactPublicKey('');
        loadContacts();
        setDialogOpen(false);
      } else {
        throw new Error("Failed to store public key");
      }
    } catch (error) {
      console.error("Error storing key:", error);
      toast({
        title: "Error adding contact",
        description: "Failed to store the public key",
        variant: "destructive"
      });
    }
  };

  const copyPublicKey = () => {
    navigator.clipboard.writeText(userPublicKey);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
    
    toast({
      title: "Public key copied",
      description: "Your public key has been copied to clipboard",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Key Management</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {/* Your public key */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-primary" />
              Your Public Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>User Email</Label>
              <div className="p-2 border rounded bg-gray-50">{userEmail}</div>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Public Key (share this with others)</Label>
              <div className="relative">
                <Textarea 
                  value={userPublicKey} 
                  readOnly 
                  className="font-mono text-xs h-32"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-2 right-2"
                  onClick={copyPublicKey}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-500">
              Your public key can be safely shared with anyone who wants to send you encrypted emails.
            </div>
          </CardFooter>
        </Card>
        
        {/* Contacts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Contact Public Keys</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Contact Key</DialogTitle>
                    <DialogDescription>
                      Add a contact's email address and their public key to send them encrypted messages.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email Address</Label>
                      <Input
                        id="contact-email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="public-key">Public Key</Label>
                      <Textarea
                        id="public-key"
                        value={contactPublicKey}
                        onChange={(e) => setContactPublicKey(e.target.value)}
                        placeholder="-----BEGIN PUBLIC KEY-----..."
                        className="font-mono text-xs h-32"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleAddContact}>
                      <Check className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Key className="mx-auto h-8 w-8 mb-2" />
                <p>No contact keys added yet</p>
                <p className="text-sm mt-2">
                  Add contacts to send them encrypted emails
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {contacts.map((contact) => (
                  <div key={contact.email} className="py-3">
                    <div className="font-medium">{contact.email}</div>
                    <div className="text-xs font-mono text-gray-500 truncate mt-1">
                      {contact.publicKey.substring(0, 64)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeyManagement;
