import  { Schema, model, models } from "mongoose";

const AppNotificationSchema = new Schema({
    token: {
        type: String,
        required: true,
        index: true,
      }, 
      name: {
        type: String,
        required: false,
      },
      phone: {  
        type: String,
        required: false,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      xvalue:{
        type: Number,
        default: 0,
      },
      email:{
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }})

const AppNotification = models?.AppNotification || model("AppNotification", AppNotificationSchema);

export default AppNotification;
