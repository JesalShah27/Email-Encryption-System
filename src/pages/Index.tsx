
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { hasUserKeys, clearAllKeys } from '@/services/keyStorage';
import UserSetup from '@/components/UserSetup';
import EmailSidebar from '@/components/EmailSidebar';
import Inbox from '@/components/Inbox';
import ComposeEmail from '@/components/ComposeEmail';
import KeyManagement from '@/components/KeyManagement';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const Index = () => {
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('inbox');
  const { toast } = useToast();

  useEffect(() => {
    // Check if user already has keys set up
    const hasKeys = hasUserKeys();
    setIsSetup(hasKeys);
    setIsLoading(false);
  }, []);

  const handleSetupComplete = () => {
    setIsSetup(true);
  };

  const handleLogout = () => {
    clearAllKeys();
    setIsSetup(false);
    toast({
      title: "Logged out",
      description: "Your session has been ended securely",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-crypto-blue to-crypto-blue-light">
        <div className="text-center text-white">
          <Lock className="animate-pulse h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Loading SecureMail...</h2>
        </div>
      </div>
    );
  }

  if (!isSetup) {
    return <UserSetup onComplete={handleSetupComplete} />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'inbox':
        return <Inbox />;
      case 'compose':
        return <ComposeEmail />;
      case 'keys':
        return <KeyManagement />;
      default:
        return <Inbox />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <EmailSidebar 
          activeView={activeView} 
          onChangeView={setActiveView}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col">
          <header className="p-4 border-b flex items-center">
            <SidebarTrigger />
            <div className="ml-4 flex items-center">
              <Lock className="h-5 w-5 text-primary mr-2" />
              <h1 className="text-lg font-medium">SecureMail Guardian</h1>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
