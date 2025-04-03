import mongoose, { Schema, model, models } from "mongoose";

const AppNotificationSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
      platform:{
        type: String,
      },
      email:{
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }})

const AppNotification = models?.AppNotification || model("AppNotification", AppNotificationSchema);

export default AppNotification;
