//responses that we get from the api endpoints during private anonymous messages

import { AnonymousMessage } from '@prisma/client';

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingAnonymousMessages?: boolean;
  anonymousMessages?: Array<AnonymousMessage>
};