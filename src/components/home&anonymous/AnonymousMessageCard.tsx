import React from 'react';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { Trash2, Clock, Star, Share2, MoreHorizontal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useToast } from '@/app/hooks/use-toast';
import type { ApiResponse } from '@/shared/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  createdAt: Date | string;
  userId: string;
}

interface MessageCardProps {
  message: Message;
  onMessageDelete: (messageId: string) => void;
}

export function MessageCard({ message, onMessageDelete }: MessageCardProps): JSX.Element {
  const { toast } = useToast();
  const [isStarred, setIsStarred] = React.useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/anonymous/delete-message/${message.id}`
      );
      
      if (response.data.success) {
        toast({
          title: "Message deleted",
          description: "The message has been removed from your inbox",
        });
        onMessageDelete(message.id);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Deletion failed",
        description: axiosError.response?.data.message ?? "Could not delete message",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleShare = (e: MouseEvent): void => {
    e.preventDefault();
    toast({
      title: "Share feature",
      description: "Coming soon!",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
    >
      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsStarred(!isStarred)}>
              <Star className="mr-2 h-4 w-4" /> 
              {isStarred ? 'Unstar' : 'Star'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this message?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The message will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="relative p-6">
        {isStarred && (
          <Badge 
            variant="secondary" 
            className="absolute left-4 top-4"
          >
            Starred
          </Badge>
        )}
        
        <div className="space-y-4">
          <div className="min-h-[80px] space-y-2">
            <p className="text-sm/relaxed">
              {message.content}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <time dateTime={dayjs(message.createdAt).format()}>
                {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
              </time>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setIsStarred(!isStarred)}
            >
              <Star 
                className={`h-4 w-4 transition-colors ${
                  isStarred ? 'fill-primary text-primary' : ''
                }`} 
              />
            </Button>
          </div>
        </div>
      </div>
      
      <div 
        className={`absolute inset-x-0 bottom-0 h-1 transition-colors ${
          isStarred ? 'bg-primary' : 'bg-transparent'
        }`}
      />
    </motion.div>
  );
}