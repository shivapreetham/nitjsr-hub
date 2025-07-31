import { NextResponse } from 'next/server';
import { cohere } from '@ai-sdk/cohere';
import {generateText} from 'ai';
// import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const prompt = `Create a list of three comments formatted as a single string. Each comment should be separated by '||'. these comments should be like feedbacks or confessions which we want to send to a person in a anomymous way and keep the messages a short if possible.NO vulgar or sexual talk.No bad words.Keep things on spicier end , let the responses be a bit quirky The topic is  ${topic}`;

      const { text } = await generateText({
        // model: google('gemini-1.5-pro-latest'),
        model: cohere('command-r-plus'),
        prompt: prompt,
      });
       
      return NextResponse.json({ message: text });

  } catch (error) {
      console.error('An unexpected error occurred in ai:', error);
      throw error;
  }
}


