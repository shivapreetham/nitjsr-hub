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
import { createClient } from '@supabase/supabase-js';

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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

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
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setIsLoading(true);
    setUploadProgress(10);
    
    try {
      // Create unique file path with proper extension
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${currentUser.id}-${Date.now()}.${fileExtension}`;
      
      // Better file validation
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      setUploadProgress(30);
      
      // Properly chunked upload
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      setUploadProgress(70);
  
      if (uploadError) {
        console.error('Supabase error:', uploadError);
        throw uploadError;
      }
      
      setUploadProgress(80);
  
      // Get URL immediately after successful upload
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
  
      console.log('Upload successful, URL:', publicUrl);
      setImage(publicUrl);
      setUploadProgress(100);
      
      // Don't automatically submit after upload
      toast({
        title: 'Success',
        description: 'Image uploaded successfully. Click Update Profile to save changes.',
      });
  
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to upload image'
      });
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      // Remove old image if there's a new one and the old one is from Supabase
      if (image !== currentUser.image && currentUser?.image && currentUser.image.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
        const oldFileName = currentUser.image.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('profile-images').remove([oldFileName]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <Card className="relative w-full max-w-md mx-4 p-6 bg-white/90 dark:bg-gray-900/90 shadow-xl rounded-3xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="space-y-2 relative z-10">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
          </div>

          {/* Tabs */}
          <div className="flex p-1.5 bg-gray-100/80 dark:bg-gray-800/50 rounded-full backdrop-blur-sm">
            <button
              className={`flex-1 py-2 font-medium text-sm rounded-full transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`flex-1 py-1 font-medium text-sm rounded-full transition-all duration-200 ${
                activeTab === 'credentials'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
                  
                  <label className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                  </label>
                </div>
                
                {/* Upload progress bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full max-w-xs">
                    <div className="h-2 w-full bg-gray-200/80 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center  text-gray-500">Uploading: {uploadProgress}%</p>
                  </div>
                )}
                
                {/* Username field */}
                <div className="w-full space-y-1">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="rounded-xl border-gray-200/80 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
                  />
                </div>
                <div className="w-full space-y-1">
                  <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="rounded-xl border-gray-200/80 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
                  />
                </div>
                <div className="w-full space-y-1">
                  <Label htmlFor="hostel" className="text-sm font-medium text-gray-700 dark:text-gray-300">Hostel</Label>
                  <Input
                    id="hostel"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    placeholder="Enter your hostel"
                    className="rounded-xl border-gray-200/80 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
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
