export type Region =
  | "北一区" | "北二区" | "北三区"
  | "西一区" | "西二区"
  | "东一区一组" | "东一区二组" | "东二区" | "东三区" | "东四区"
  | "南一区广州区域" | "南一区深圳区域" | "南二区";

export type Platform = "小红书" | "抖音" | "视频号";
export type AccountType = "机构官方" | "KOS账号" | "职人号" | "医生认证";
export type ContentType = "图文" | "视频";
export type Product = "极纯" | "ColNet" | "WeaveCOL" | "HiveCOL" | "极纯+ColNet" | "极纯+WeaveCOL" | "ColNet+WeaveCOL" | "多款产品";
export type ApproveStatus = "待审核" | "已通过" | "未通过";
export type SendStatus = "待发放" | "已发放" | "已拒发";
export type Tier = "基础" | "进阶" | "高阶" | "";

export interface Entry {
  id: number;
  region: Region;
  recordDate: string;
  orgName: string;
  orgAddress: string;
  city: string;
  platform: Platform;
  accountType: AccountType;
  accountName: string;
  contentType: ContentType;
  product: Product;
  publishDate: string;
  contentLink: string;
  approveStatus: ApproveStatus;
  approveDate: string;
  approver: string;
  dataCollectDate: string;
  screenshotUploaded: boolean;
  screenshotData: string;
  readCount: number;
  likes: number;
  favorites: number;
  comments: number;
  interactCount: number;
  tier: Tier;
  rewardCount: number;
  sendStatus: SendStatus;
  sendDate: string;
  trackingNo: string;
  received: boolean;
  receiveDate: string;
  note: string;
  createdAt: Date;
}

export const REGIONS: Region[] = [
  "北一区", "北二区", "北三区",
  "西一区", "西二区",
  "东一区一组", "东一区二组", "东二区", "东三区", "东四区",
  "南一区广州区域", "南一区深圳区域", "南二区",
];

export const PLATFORMS: Platform[] = ["小红书", "抖音", "视频号"];
export const ACCOUNT_TYPES: AccountType[] = ["机构官方", "KOS账号", "职人号", "医生认证"];
export const CONTENT_TYPES: ContentType[] = ["图文", "视频"];
export const PRODUCTS: Product[] = ["极纯", "ColNet", "WeaveCOL", "HiveCOL", "极纯+ColNet", "极纯+WeaveCOL", "ColNet+WeaveCOL", "多款产品"];
export const APPROVE_STATUSES: ApproveStatus[] = ["待审核", "已通过", "未通过"];
export const SEND_STATUSES: SendStatus[] = ["待发放", "已发放", "已拒发"];

export interface User {
  region: Region;
  role: "region" | "admin";
}

export interface Stats {
  totalEntries: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalNeedles: number;
  sentNeedles: number;
  tierCounts: Record<string, number>;
  platformCounts: Record<string, number>;
  regionCounts: { region: string; count: number; needles: number }[];
}
