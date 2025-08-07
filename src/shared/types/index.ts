import { Conversation, Message, User, Reaction } from '@prisma/client';

export type FullMessageType = Message & {
  sender: User | null;
  seen: User[];
  replyTo?: FullMessageType | null;
  replies?: FullMessageType[];
  reactions?: ReactionType[];
};

export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};

export type ReactionType = Reaction & {
  user: User;
};


