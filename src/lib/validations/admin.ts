import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1, "Body is required"),
  isPublished: z.boolean(),
  publishedAt: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  bannerUrl: z
    .string()
    .optional()
    .transform((s) => {
      const t = s?.trim();
      if (!t) {
        return undefined;
      }
      return ensureSupabasePublicObjectUrl(t);
    }),
  postUrl: z
    .string()
    .max(2048)
    .optional()
    .transform((s) => {
      const t = s?.trim();
      if (!t) {
        return undefined;
      }
      return /^https?:\/\//i.test(t) ? t : `https://${t}`;
    })
    .pipe(z.union([z.undefined(), z.string().url({ message: "Invalid post link" })])),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().optional(),
  isPublished: z.boolean(),
});

export const leadershipSchema = z.object({
  layerId: z.string().uuid("Select a leadership layer"),
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  bio: z.string().optional(),
  photoUrl: z
    .string()
    .optional()
    .transform((s) => {
      const t = s?.trim();
      if (!t) {
        return undefined;
      }
      return ensureSupabasePublicObjectUrl(t);
    }),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean(),
});

export const leadershipLayerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean(),
});

export const chapterSchema = z.object({
  universityId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  memberCount: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean(),
});

export const universitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  district: z.string().optional(),
});

export const forumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean(),
});

export const forumLabelSchema = z.object({
  forumId: z.string().uuid("Forum is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean(),
});

export const forumMemberSchema = z.object({
  forumId: z.string().uuid("Forum is required"),
  labelId: z.string().uuid("Select a label"),
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  bio: z.string().optional(),
  photoUrl: z
    .string()
    .optional()
    .transform((s) => {
      const t = s?.trim();
      if (!t) {
        return undefined;
      }
      return ensureSupabasePublicObjectUrl(t);
    }),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean(),
});
