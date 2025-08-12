import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate that the email matches the session user
    if (email !== session.user.email) {
      return NextResponse.json(
        { success: false, message: 'Email mismatch' },
        { status: 400 }
      );
    }

    // Get the scraping server URL from environment variables
    const scrapingServerUrl = process.env.SCRAPING_SERVER_BASE_URL;
    
    if (!scrapingServerUrl) {
      return NextResponse.json(
        { success: false, message: 'Scraping server not configured' },
        { status: 500 }
      );
    }

    // Send request to the scraping server
    const scrapingResponse = await fetch(scrapingServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!scrapingResponse.ok) {
      const errorText = await scrapingResponse.text();
      console.error('Scraping server error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to communicate with scraping server' 
        },
        { status: 502 }
      );
    }

    const scrapingResult = await scrapingResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Scraping request sent successfully',
      data: scrapingResult
    });

  } catch (error) {
    console.error('Error sending scraping request:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}