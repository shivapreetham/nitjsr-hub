import { NextResponse } from 'next/server';
import { cohere } from '@ai-sdk/cohere';
import {generateText} from 'ai';
// import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const prompt = `if there are unfinished parts of a sentence, fill them in .If there are incorrect usage of words, correct them. No no sexual talk.No bad words. keep the messages a short if possible.The topic is  ${topic}`;

      const { text } = await generateText({
        model: cohere('command-r-plus'),
        prompt: prompt,
      });
       
      return NextResponse.json({ message: text });

  } catch (error) {
      //error occurde in ai 
      console.error('An unexpected error occurred in ai:', error);
      throw error;
  }
}


