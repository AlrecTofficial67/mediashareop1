import mongoose, { Schema, Document, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "premium", "admin"], default: "user" },
    avatar: { type: String },
    storageUsed: { type: Number, default: 0 },
    storageLimit: { type: Number, default: 100 * 1024 * 1024 },
    linkLimit: { type: Number, default: 10 },
    linksCreated: { type: Number, default: 0 },
    adsEnabled: { type: Boolean, default: true },
    customBranding: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const FileRecordSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    originalName: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    extension: { type: String, required: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    missionEnabled: { type: Boolean, default: true },
    missionId: { type: Schema.Types.ObjectId, ref: "Mission" },
  },
  { timestamps: true }
);

const ShortLinkSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    targetUrl: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clickCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    missionEnabled: { type: Boolean, default: true },
    missionId: { type: Schema.Types.ObjectId, ref: "Mission" },
  },
  { timestamps: true }
);

const MissionTaskSchema = new Schema({
  type: { type: String, enum: ["telegram", "youtube", "instagram", "external", "custom"], required: true },
  label: { type: String, required: true },
  url: { type: String, required: true },
  required: { type: Boolean, default: true },
});

const MissionSchema = new Schema(
  {
    name: { type: String, required: true },
    tasks: [MissionTaskSchema],
    countdownSeconds: { type: Number, default: 15 },
    humanVerification: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AnalyticsEventSchema = new Schema(
  {
    resourceType: { type: String, enum: ["file", "link"], required: true },
    resourceId: { type: Schema.Types.ObjectId, required: true, index: true },
    eventType: {
      type: String,
      enum: ["view", "mission_start", "mission_complete", "download", "click"],
      required: true,
    },
    ip: { type: String },
    userAgent: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    country: { type: String },
    referrer: { type: String },
  },
  { timestamps: true }
);

const AdSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["banner", "popup", "mission"], required: true },
    imageUrl: { type: String },
    linkUrl: { type: String, required: true },
    htmlContent: { type: String },
    placement: { type: String, enum: ["top", "bottom", "sidebar", "mission_page"], required: true },
    isActive: { type: Boolean, default: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserModel = models.User || model("User", UserSchema);
export const FileRecord = models.FileRecord || model("FileRecord", FileRecordSchema);
export const ShortLink = models.ShortLink || model("ShortLink", ShortLinkSchema);
export const Mission = models.Mission || model("Mission", MissionSchema);
export const AnalyticsEvent = models.AnalyticsEvent || model("AnalyticsEvent", AnalyticsEventSchema);
export const Ad = models.Ad || model("Ad", AdSchema);
