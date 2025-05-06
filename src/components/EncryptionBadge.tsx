
import React from 'react';
import { Lock } from 'lucide-react';

interface EncryptionBadgeProps {
  isEncrypted: boolean;
  isVerified?: boolean;
}

const EncryptionBadge: React.FC<EncryptionBadgeProps> = ({ isEncrypted, isVerified }) => {
  if (!isEncrypted) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        Unencrypted
      </span>
    );
  }

  return (
    <div className="flex space-x-2">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <Lock className="w-3 h-3 mr-1" />
        Encrypted
      </span>
      
      {isVerified !== undefined && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isVerified 
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        }`}>
          {isVerified ? "Verified" : "Unverified"}
        </span>
      )}
    </div>
  );
};

export default EncryptionBadge;
