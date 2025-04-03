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

  export interface INotificationDevice extends Document {
    token: string;
    user?: string;
    lastActive: Date;
    createdAt: Date;
  }
  
  export interface RegisterDeviceRequest {
    token: string;
    userId?: string;
    platform:string
    email:string
  }
  