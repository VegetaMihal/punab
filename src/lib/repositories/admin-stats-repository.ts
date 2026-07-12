import { prisma } from "@/lib/db/prisma";

export async function getAdminDashboardCounts(): Promise<{
  siteSettings: number;
  galleries: number;
  notices: number;
  events: number;
  leadership: number;
  chapters: number;
  forums: number;
  members: number;
}> {
  const [
    siteSettings,
    galleries,
    notices,
    events,
    leadership,
    chapters,
    forums,
    members,
  ] = await Promise.all([
    prisma.siteSetting.count(),
    prisma.galleryAlbum.count(),
    prisma.notice.count(),
    prisma.event.count(),
    prisma.leadershipMember.count(),
    prisma.chapter.count(),
    prisma.forum.count(),
    prisma.profile.count(),
  ]);
  return {
    siteSettings,
    galleries,
    notices,
    events,
    leadership,
    chapters,
    forums,
    members,
  };
}
