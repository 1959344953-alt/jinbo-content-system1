import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { db } from "../queries/connection";
import { entries } from "../../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const entryRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        region: z.string().optional(),
        search: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const filters = [];
      if (input?.region) filters.push(eq(entries.region, input.region));
      if (input?.status) filters.push(eq(entries.approveStatus, input.status));

      let query;
      if (filters.length > 0) {
        query = db.select().from(entries).where(and(...filters)).orderBy(desc(entries.createdAt));
      } else {
        query = db.select().from(entries).orderBy(desc(entries.createdAt));
      }

      let result = await query;

      if (input?.search) {
        const s = input.search.toLowerCase();
        result = result.filter(
          (r) =>
            r.orgName.toLowerCase().includes(s) ||
            r.accountName.toLowerCase().includes(s) ||
            r.region.includes(s)
        );
      }

      return result.map(r => ({
        ...r,
        screenshotUploaded: Boolean(r.screenshotUploaded),
        received: Boolean(r.received),
        screenshotData: r.screenshotData ?? "",
        orgAddress: r.orgAddress ?? "",
        publishDate: r.publishDate ?? "",
        contentLink: r.contentLink ?? "",
        approveDate: r.approveDate ?? "",
        approver: r.approver ?? "",
        dataCollectDate: r.dataCollectDate ?? "",
        readCount: r.readCount ?? 0,
        likes: r.likes ?? 0,
        favorites: r.favorites ?? 0,
        comments: r.comments ?? 0,
        interactCount: r.interactCount ?? 0,
        tier: r.tier ?? "",
        rewardCount: r.rewardCount ?? 0,
        sendDate: r.sendDate ?? "",
        trackingNo: r.trackingNo ?? "",
        receiveDate: r.receiveDate ?? "",
        note: r.note ?? "",
      }));
    }),

  stats: publicQuery.query(async () => {
    const all = await db.select().from(entries);

    const totalEntries = all.length;
    const approvedCount = all.filter((e) => e.approveStatus === "已通过").length;
    const pendingCount = all.filter((e) => e.approveStatus === "待审核").length;
    const rejectedCount = all.filter((e) => e.approveStatus === "未通过").length;
    const totalNeedles = all.reduce((s, e) => s + (e.rewardCount ?? 0), 0);
    const sentNeedles = all
      .filter((e) => e.sendStatus === "已发放")
      .reduce((s, e) => s + (e.rewardCount ?? 0), 0);

    const tierCounts = {
      基础: all.filter((e) => e.tier === "基础").length,
      进阶: all.filter((e) => e.tier === "进阶").length,
      高阶: all.filter((e) => e.tier === "高阶").length,
    };

    const platformCounts = {
      小红书: all.filter((e) => e.platform === "小红书").length,
      抖音: all.filter((e) => e.platform === "抖音").length,
      视频号: all.filter((e) => e.platform === "视频号").length,
    };

    const regionList = [
      "北一区", "北二区", "北三区",
      "西一区", "西二区",
      "东一区一组", "东一区二组", "东二区", "东三区", "东四区",
      "南一区广州区域", "南一区深圳区域", "南二区",
    ];
    const regionCounts = regionList.map((r) => ({
      region: r,
      count: all.filter((e) => e.region === r).length,
      needles: all
        .filter((e) => e.region === r)
        .reduce((s, e) => s + (e.rewardCount ?? 0), 0),
    }));

    return {
      totalEntries,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalNeedles,
      sentNeedles,
      tierCounts,
      platformCounts,
      regionCounts,
    };
  }),

  create: publicQuery
    .input(
      z.object({
        region: z.string(),
        recordDate: z.string(),
        orgName: z.string(),
        orgAddress: z.string().optional(),
        city: z.string(),
        platform: z.string(),
        accountType: z.string(),
        accountName: z.string(),
        contentType: z.string(),
        product: z.string(),
        publishDate: z.string().optional(),
        contentLink: z.string().optional(),
        approveStatus: z.string().optional(),
        dataCollectDate: z.string().optional(),
        screenshotUploaded: z.boolean().optional(),
        screenshotData: z.string().optional(),
        readCount: z.number().optional(),
        likes: z.number().optional(),
        favorites: z.number().optional(),
        comments: z.number().optional(),
        interactCount: z.number().optional(),
        tier: z.string().optional(),
        rewardCount: z.number().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.insert(entries).values({
        region: input.region,
        recordDate: input.recordDate,
        orgName: input.orgName,
        orgAddress: input.orgAddress ?? "",
        city: input.city,
        platform: input.platform,
        accountType: input.accountType,
        accountName: input.accountName,
        contentType: input.contentType,
        product: input.product,
        publishDate: input.publishDate ?? "",
        contentLink: input.contentLink ?? "",
        approveStatus: input.approveStatus ?? "待审核",
        dataCollectDate: input.dataCollectDate ?? "",
        screenshotUploaded: input.screenshotUploaded ? 1 : 0,
        screenshotData: input.screenshotData ?? "",
        readCount: input.readCount ?? 0,
        likes: input.likes ?? 0,
        favorites: input.favorites ?? 0,
        comments: input.comments ?? 0,
        interactCount: input.interactCount ?? 0,
        tier: input.tier ?? "",
        rewardCount: input.rewardCount ?? 0,
        note: input.note ?? "",
      }).returning();
      return result[0];
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        region: z.string().optional(),
        recordDate: z.string().optional(),
        orgName: z.string().optional(),
        orgAddress: z.string().optional(),
        city: z.string().optional(),
        platform: z.string().optional(),
        accountType: z.string().optional(),
        accountName: z.string().optional(),
        contentType: z.string().optional(),
        product: z.string().optional(),
        publishDate: z.string().optional(),
        contentLink: z.string().optional(),
        approveStatus: z.string().optional(),
        approveDate: z.string().optional(),
        approver: z.string().optional(),
        dataCollectDate: z.string().optional(),
        screenshotUploaded: z.boolean().optional(),
        screenshotData: z.string().optional(),
        readCount: z.number().optional(),
        likes: z.number().optional(),
        favorites: z.number().optional(),
        comments: z.number().optional(),
        interactCount: z.number().optional(),
        tier: z.string().optional(),
        rewardCount: z.number().optional(),
        sendStatus: z.string().optional(),
        sendDate: z.string().optional(),
        trackingNo: z.string().optional(),
        received: z.boolean().optional(),
        receiveDate: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        if (key === "screenshotUploaded") {
          updateData[key] = value ? 1 : 0;
        } else if (key === "received") {
          updateData[key] = value ? 1 : 0;
        } else {
          updateData[key] = value;
        }
      }

      await db.update(entries).set(updateData).where(eq(entries.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(entries).where(eq(entries.id, input.id));
      return { success: true };
    }),

  approve: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["已通过", "未通过"]),
      approver: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.update(entries).set({
        approveStatus: input.status,
        approveDate: new Date().toISOString().split("T")[0],
        approver: input.approver ?? "品牌战略部",
      }).where(eq(entries.id, input.id));
      return { success: true };
    }),

  send: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["已发放", "已拒发"]),
      trackingNo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = {
        sendStatus: input.status,
      };
      if (input.status === "已发放") {
        updateData.sendDate = new Date().toISOString().split("T")[0];
      }
      if (input.trackingNo !== undefined) {
        updateData.trackingNo = input.trackingNo;
      }
      await db.update(entries).set(updateData).where(eq(entries.id, input.id));
      return { success: true };
    }),

  receive: publicQuery
    .input(z.object({
      id: z.number(),
      received: z.boolean(),
      receiveDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.update(entries).set({
        received: input.received ? 1 : 0,
        receiveDate: input.received ? (input.receiveDate ?? new Date().toISOString().split("T")[0]) : "",
      }).where(eq(entries.id, input.id));
      return { success: true };
    }),
});
