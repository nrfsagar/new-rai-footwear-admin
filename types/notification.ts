// types/notification.ts
export interface NotificationPayload {
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
  
//   export interface DeviceToken {
//     token: string;
//     userId?: string;
//     createdAt: Date;
//   }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  