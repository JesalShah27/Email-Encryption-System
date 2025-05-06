
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { encryptMessage, signMessage } from '@/utils/cryptoUtils';
import { getUserEmail, getUserPrivateKey, getContactPublicKey, getAllContacts } from '@/services/keyStorage';
import { saveEmail } from '@/services/emailStorage';
import { Check, Send } from 'lucide-react';

const ComposeEmail: React.FC = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [encrypt, setEncrypt] = useState(true);
  const [sign, setSign] = useState(true);
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState<{ email: string; publicKey: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load contacts
    const allContacts = getAllContacts();
    setContacts(allContacts);
  }, []);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const recipientPublicKey = encrypt ? getContactPublicKey(to) : null;
    
    if (encrypt && !recipientPublicKey) {
      toast({
        title: "Cannot encrypt email",
        description: "Recipient's public key is not available. Add their key in the Key Management section or disable encryption.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);
      const fromEmail = getUserEmail() || '';
      
      let emailToSave: any = {
        id: uuidv4(),
        from: fromEmail,
        to,
        subject,
        body,
        date: new Date().toISOString(),
        encrypted: encrypt,
        read: false,
      };
      
      if (encrypt && recipientPublicKey) {
        const encryptedData = encryptMessage(recipientPublicKey, body);
        
        // Add signature if requested
        let signature;
        if (sign) {
          const privateKey = getUserPrivateKey();
          if (privateKey) {
            signature = signMessage(privateKey, body);
          }
        }
        
        emailToSave = {
          ...emailToSave,
          encryptedData,
          signature,
        };
      }
      
      const success = saveEmail(emailToSave);
      
      if (success) {
        toast({
          title: "Email sent",
          description: "Your message has been delivered securely",
        });
        
        // Clear form
        setTo('');
        setSubject('');
        setBody('');
      } else {
        throw new Error("Failed to save email");
      }
    } catch (error) {
      console.error("Send error:", error);
      toast({
        title: "Failed to send email",
        description: "There was an error sending your message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const canEncrypt = getContactPublicKey(to) !== null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Compose Email</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Secure Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  list="contact-list"
                />
                <datalist id="contact-list">
                  {contacts.map((contact) => (
                    <option key={contact.email} value={contact.email} />
                  ))}
                </datalist>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Message subject"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex items-center space-x-8 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="encrypt"
                    checked={encrypt}
                    onCheckedChange={setEncrypt}
                    disabled={!canEncrypt}
                  />
                  <Label htmlFor="encrypt" className="cursor-pointer">
                    Encrypt message
                  </Label>
                  {to && !canEncrypt && (
                    <span className="text-xs text-red-500">
                      (No public key available for this recipient)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sign"
                    checked={sign}
                    onCheckedChange={setSign}
                    disabled={!encrypt}
                  />
                  <Label htmlFor="sign" className="cursor-pointer">
                    Sign message
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSend} 
              disabled={sending || !to || !subject || !body}
              className="ml-auto"
            >
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Secure Email
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ComposeEmail;
