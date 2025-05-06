
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Mail, Send, Key, User, Lock } from 'lucide-react';
import { getUserEmail } from '@/services/keyStorage';
import { getUnreadCount } from '@/services/emailStorage';

interface EmailSidebarProps {
  activeView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

const EmailSidebar: React.FC<EmailSidebarProps> = ({ 
  activeView, 
  onChangeView,
  onLogout
}) => {
  const userEmail = getUserEmail() || '';
  const unreadCount = getUnreadCount();

  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <div className="px-4 flex gap-2 items-center">
          <div className="bg-primary/20 p-2 rounded-md">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="font-semibold text-lg">SecureMail</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mail</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onChangeView('inbox')} 
                  isActive={activeView === 'inbox'}
                >
                  <Mail />
                  <span>Inbox</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onChangeView('compose')} 
                  isActive={activeView === 'compose'}
                >
                  <Send />
                  <span>Compose</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onChangeView('keys')} 
                  isActive={activeView === 'keys'}
                >
                  <Key />
                  <span>Key Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-3 text-xs text-sidebar-foreground/70 mb-2">
            <User className="h-4 w-4" />
            <span className="truncate">{userEmail}</span>
          </div>
          <Button variant="outline" className="w-full" onClick={onLogout}>
            Log Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default EmailSidebar;
