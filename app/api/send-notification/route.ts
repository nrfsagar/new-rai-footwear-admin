// import { getTokens } from '@/lib/actions/notification';
// import axios from 'axios';

// export default async function handler(req:any, res:any) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const { title, message } = req.body;
    

//     // Replace with your actual database query to get tokens
//     // This is just an example endpoint to fetch tokens
//     // const tokensResponse = await axios.get('YOUR_API_URL/get-device-tokens');
//     const tokens = await getTokens();

//     // Send to Expo's Push Notification Service
//     const response = await axios.post('https://exp.host/--/api/v2/push/send',
//       tokens.map((token:any) => ({
//         to: token.token,
//         sound: 'default',
//         title: title,
//         body: message,
//       })),
//       {
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     res.status(200).json({ success: true, data: response.data });
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     res.status(500).json({ success: false, error: 'Failed to send notification' });
//   }
// }

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

    // Send to Expo Push Service
    const messages = tokens.map(({ token }) => ({
      to: token,
      title: body.title,
      body: body.message,
      data: body.data || {},
      sound: 'default',
    }));

    const response = await axios.post(
      'https://exp.host/--/api/v2/push/send',
      messages,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      data: response.data 
    });
  } catch (error) {
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