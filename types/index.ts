export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "premium" | "admin";
  avatar?: string;
  storageUsed: number;
  storageLimit: number;
  linkLimit: number;
  linksCreated: number;
  adsEnabled: boolean;
  customBranding?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileRecord {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  originalName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  uploaderId: string;
  uploader?: User;
  downloadCount: number;
  isActive: boolean;
  missionEnabled: boolean;
  missionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShortLink {
  _id: string;
  slug: string;
  targetUrl: string;
  title: string;
  creatorId: string;
  creator?: User;
  clickCount: number;
  isActive: boolean;
  missionEnabled: boolean;
  missionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mission {
  _id: string;
  name: string;
  tasks: MissionTask[];
  countdownSeconds: number;
  humanVerification: boolean;
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
}

export interface MissionTask {
  _id: string;
  type: "telegram" | "youtube" | "instagram" | "external" | "custom";
  label: string;
  url: string;
  required: boolean;
}

export interface AnalyticsEvent {
  _id: string;
  resourceType: "file" | "link";
  resourceId: string;
  eventType: "view" | "mission_start" | "mission_complete" | "download" | "click";
  ip?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  referrer?: string;
  createdAt: Date;
}

export interface Ad {
  _id: string;
  name: string;
  type: "banner" | "popup" | "mission";
  imageUrl?: string;
  linkUrl: string;
  htmlContent?: string;
  placement: "top" | "bottom" | "sidebar" | "mission_page";
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AdminJwtPayload {
  adminId: string;
  role: "admin";
  iat: number;
  exp: number;
}

export interface MissionSession {
  resourceType: "file" | "link";
  resourceId: string;
  slug: string;
  completedTasks: string[];
  verified: boolean;
  expiresAt: number;
}
