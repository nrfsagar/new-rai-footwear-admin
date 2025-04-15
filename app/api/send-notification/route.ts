

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';
import { NotificationPayload, ApiResponse } from '@/types/notification';
import { getTokens } from '@/lib/actions/notification';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await req.json() as NotificationPayload;

    // Validate request body
    if (!body.title || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Get tokens from database
    const tokens = await getTokens();

    if (!tokens.length) {
      return NextResponse.json(
        { success: false, error: 'No notification tokens found' },
        { status: 404 }
      );
    }

    // Prepare messages array
    const messages = tokens.map(({ token }) => ({
      to: token,
      title: body.title,
      body: body.message,
      data: body.data || {},
      sound: 'default',
    }));

    // Send to Expo Push Service
    const response = await axios.post(
      'https://exp.host/--/api/v2/push/send',
      // Key fix: Send the messages directly, not as an array
      messages.length === 1 ? messages[0] : messages,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      }
    );

    // Validate the response
    if (response.data.data?.status === 'error') {
      throw new Error(response.data.data.message || 'Failed to send notifications');
    }

    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Push notification error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}