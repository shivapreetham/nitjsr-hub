'use client';

import { useState, useMemo } from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/app/hooks/use-toast';
import Image from 'next/image';
import { X, Upload, User as UserIcon, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FileUpload from '@/components/shared/FileUpload';
// Define types for programMap and branchMap
type ProgramMap = {
  cs: string;
  ec: string;
  ee: string;
  ce: string;
  me: string;
  mm: string;
  pi: string;
  csca: string;
  phd: string;
};

type BranchMap = {
  ug: string;
  pg: string;
};

interface SettingsModalProps {
  currentUser: User;
  isOpen?: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen = false,
  onClose,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(currentUser?.image || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [NITUsername, setNITUsername] = useState(currentUser?.NITUsername || '');
  const [NITPassword, setNITPassword] = useState(currentUser?.NITPassword || '');
  // Additional fields
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '');
  const [hostel, setHostel] = useState(currentUser?.hostel || '');
  
  const [activeTab, setActiveTab] = useState('profile');

  // Move programMap and branchMap outside of useMemo for correct type inference
  const programMap: ProgramMap = {
    cs: 'Computer Science and Engineering',
    ec: 'Electronics and Communication Engineering',
    ee: 'Electrical Engineering',
    ce: 'Civil Engineering',
    me: 'Mechanical Engineering',
    mm: 'Metallurgical and Materials Engineering',
    pi: 'Production and Industrial Engineering',
    csca: 'Master in Computer Applications',
    phd: 'PhD',
  };

  const branchMap: BranchMap = {
    ug: 'Undergraduate',
    pg: 'Postgraduate',
  };

  // Parse user details from email
  const userDetails = useMemo(() => {
    const email = currentUser?.email || '';
    const match = email.match(/^(\d{4})(ug|pg)([a-z]+)/i);
    
    if (!match) return null;
    
    const [, batch, branchCode, programCode] = match;
    
    return {
      batch,
      program: programMap[programCode.toLowerCase() as keyof ProgramMap] || programCode.toUpperCase(),
      branch: branchMap[branchCode.toLowerCase() as keyof BranchMap] || branchCode.toUpperCase()
    };
  }, [currentUser?.email, programMap, branchMap]);

  const handleImageUpload = (url: string) => {
    setImage(url);
    toast({
      title: 'Success',
      description: 'Image uploaded successfully. Click Update Profile to save changes.',
    });
  };

  const handleUploadError = (error: string) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error
    });
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      // Remove old image if there's a new one and the old one is from Cloudflare R2
      if (image !== currentUser.image && currentUser?.image && currentUser.image.includes(process.env.CLOUDFLARE_R2_PUBLIC_URL!)) {
        try {
          await axios.post('/api/cloudflare/delete', {
            imageUrl: currentUser.image
          });
        } catch (deleteError) {
          console.warn('Failed to delete old image:', deleteError);
          // Continue with profile update even if old image deletion fails
        }
      }
      
      // Prepare update data
      const updateData: {
        image?: string;
        username?: string;
        NITUsername?: string;
        NITPassword?: string;
        mobileNumber?: string;
        hostel?: string;
      } = {};
      
      // Only include fields that have changed
      if (image !== currentUser.image) updateData.image = image;
      if (username !== currentUser.username) updateData.username = username;
      if (NITUsername !== currentUser.NITUsername) updateData.NITUsername = NITUsername;
      if (NITPassword !== currentUser.NITPassword) updateData.NITPassword = NITPassword;
      if (mobileNumber !== currentUser.mobileNumber) updateData.mobileNumber = mobileNumber;
      if (hostel !== currentUser.hostel) updateData.hostel = hostel;
      
      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        toast({
          variant: 'default',
          title: 'No changes',
          description: 'No changes were made to your profile',
        });
        onClose();
        return;
      }
      
      // Send update to API
      await axios.post('/api/chat/profile', updateData);
      
      router.refresh();
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
      onClose();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-md mx-4 p-6 bg-card shadow-xl rounded-lg border border-border overflow-hidden">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-all duration-200"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Profile Settings</h2>
            <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              className={`flex-1 py-2 px-3 font-medium text-sm rounded-md transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`flex-1 py-2 px-3 font-medium text-sm rounded-md transition-all duration-200 ${
                activeTab === 'credentials'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('credentials')}
            >
              Credentials
            </button>
          </div>

          {activeTab === 'profile' && (
            <>
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative h-32 w-32 group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-sm animate-pulse-slow"></div>
                  {image ? (
                    <Image
                      src={image}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover border-4 border-white/80 dark:border-gray-800/80 shadow-lg z-10"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full flex items-center justify-center bg-gray-200/80 dark:bg-gray-800/80 border-4 border-white/80 dark:border-gray-700/80 z-10">
                      <UserIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  
                </div>
                
                {/* File Upload Component */}
                <div className="w-full max-w-xs">
                  <FileUpload
                    onUpload={handleImageUpload}
                    onError={handleUploadError}
                    maxSize={5}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                    uploadType="profile"
                    buttonText="Upload Profile Picture"
                    showPreview={false}
                    disabled={isLoading}
                  />
                </div>
                
                {/* Username field */}
                <div className="w-full space-y-1">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-background/70 backdrop-blur-sm border-border/50 focus:border-primary hover:border-border transition-all duration-200"
                  />
                </div>
                <div className="w-full space-y-1">
                  <Label htmlFor="mobileNumber" className="text-sm font-medium text-foreground">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="bg-background/70 backdrop-blur-sm border-border/50 focus:border-primary hover:border-border transition-all duration-200"
                  />
                </div>
                <div className="w-full space-y-1">
                  <Label htmlFor="hostel" className="text-sm font-medium text-foreground">Hostel</Label>
                  <Input
                    id="hostel"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    placeholder="Enter your hostel"
                    className="bg-background/70 backdrop-blur-sm border-border/50 focus:border-primary hover:border-border transition-all duration-200"
                  />
                </div>
              </div>

              {/* User Details */}
              {userDetails && (
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <div className="space-y-1 text-center p-4 bg-white/60 dark:bg-gray-800/40 rounded-2xl shadow-sm backdrop-blur-sm border border-gray-100 dark:border-gray-700/30 hover:shadow-md transition-all duration-200">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Batch</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.batch}</div>
                  </div>
                  <div className="space-y-1 text-center p-4 bg-white/60 dark:bg-gray-800/40 rounded-2xl shadow-sm backdrop-blur-sm border border-gray-100 dark:border-gray-700/30 hover:shadow-md transition-all duration-200">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.branch}</div>
                  </div>
                  <div className="col-span-2 space-y-1 text-center p-4 bg-white/60 dark:bg-gray-800/40 rounded-2xl shadow-sm backdrop-blur-sm border border-gray-100 dark:border-gray-700/30 hover:shadow-md transition-all duration-200">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.program}</div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="NITUsername" className="text-sm font-medium text-gray-700 dark:text-gray-300">NIT Username</Label>
                <div className="relative">
                  <Input
                    id="NITUsername"
                    value={NITUsername}
                    onChange={(e) => setNITUsername(e.target.value)}
                    placeholder="Enter your NIT username"
                    className="pl-12 rounded-xl border-gray-200/80 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
                  />
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 bg-gray-50/80 dark:bg-gray-700/50 border-r border-gray-200/80 dark:border-gray-700/50 rounded-l-xl backdrop-blur-sm">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="NITPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">NIT Password</Label>
                <div className="relative">
                  <Input
                    id="NITPassword"
                    type="password"
                    value={NITPassword}
                    onChange={(e) => setNITPassword(e.target.value)}
                    placeholder="Enter your NIT password"
                    className="pl-12 rounded-xl border-gray-200/80 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
                  />
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 bg-gray-50/80 dark:bg-gray-700/50 border-r border-gray-200/80 dark:border-gray-700/50 rounded-l-xl backdrop-blur-sm">
                    <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  Your credentials are securely stored and used only for accessing NIT services.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-5 py-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="rounded-xl px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsModal;
