

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
    
    console.log(`Found ${tokens.length} registered devices`);

    if (!tokens.length) {
      return NextResponse.json(
        { success: false, error: 'No registered devices found. Users need to open the app and allow notifications first.' },
        { status: 404 }
      );
    }

    // Filter out any invalid tokens
    const validTokens = tokens.filter(({ token }) => token && token.startsWith('ExponentPushToken'));
    
    if (!validTokens.length) {
      return NextResponse.json(
        { success: false, error: 'No valid Expo push tokens found. Tokens must start with "ExponentPushToken".' },
        { status: 404 }
      );
    }

    console.log(`Sending to ${validTokens.length} valid tokens`);

    // Prepare messages array
    const messages = validTokens.map(({ token }) => ({
      to: token,
      title: body.title,
      body: body.message,
      data: body.data || {},
      sound: 'default',
      priority: 'high',
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

    console.log('Expo Push Response:', JSON.stringify(response.data, null, 2));

    // Validate the response
    if (response.data.data?.status === 'error') {
      throw new Error(response.data.data.message || 'Failed to send notifications');
    }

    // Check for any ticket errors
    const ticketData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    const errors = ticketData.filter((ticket: any) => ticket?.status === 'error');
    
    if (errors.length > 0) {
      console.log('Some notifications failed:', errors);
    }

    return NextResponse.json({
      success: true,
      data: {
        sent: validTokens.length - errors.length,
        failed: errors.length,
        response: response.data
      }
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