
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { generateKeyPair } from '@/utils/cryptoUtils';
import { storeUserKeys } from '@/services/keyStorage';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

interface UserSetupProps {
  onComplete: () => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setGenerating(true);
      toast({
        title: "Generating keys",
        description: "This may take a moment...",
      });

      // Generate key pair
      const keyPair = await generateKeyPair();
      
      // Store keys and user info
      const success = storeUserKeys(email, keyPair);
      
      if (success) {
        toast({
          title: "Keys generated successfully",
          description: "Your encryption keys have been created and stored securely.",
        });
        onComplete();
      } else {
        throw new Error("Failed to store keys");
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast({
        title: "Key generation failed",
        description: "There was an error creating your encryption keys. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-crypto-blue to-crypto-blue-light p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Set Up Secure Email</CardTitle>
          <CardDescription>
            Generate your encryption keys to start sending secure emails
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSetup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={generating}
            >
              {generating ? "Generating Keys..." : "Generate Encryption Keys"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserSetup;
