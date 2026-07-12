import { toLeadershipLayer, toLeadershipMember } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import { HONORARY_LEADERSHIP_LAYER_SLUG } from "@/lib/leadership-constants";
import type { LeadershipLayer, LeadershipMember } from "@/types/database";

/** Published executive leadership only (excludes reserved honorary layer). */
export async function getPublishedExecutiveLeadership(): Promise<{
  layers: LeadershipLayer[];
  members: LeadershipMember[];
}> {
  const layers = await prisma.leadershipLayer.findMany({
    where: { is_published: true, slug: { not: HONORARY_LEADERSHIP_LAYER_SLUG } },
    orderBy: { sort_order: "asc" },
  });
  const layerIds = layers.map((l) => l.id);
  const members =
    layerIds.length === 0
      ? []
      : await prisma.leadershipMember.findMany({
          where: { is_published: true, layer_id: { in: layerIds } },
          orderBy: { sort_order: "asc" },
        });
  return {
    layers: layers.map(toLeadershipLayer),
    members: members.map(toLeadershipMember),
  };
}

/** Published honorary position (layer slug `honorary` only). */
export async function getPublishedHonoraryLeadership(): Promise<{
  layers: LeadershipLayer[];
  members: LeadershipMember[];
}> {
  const layers = await prisma.leadershipLayer.findMany({
    where: { is_published: true, slug: HONORARY_LEADERSHIP_LAYER_SLUG },
    orderBy: { sort_order: "asc" },
  });
  const layerIds = layers.map((l) => l.id);
  const members =
    layerIds.length === 0
      ? []
      : await prisma.leadershipMember.findMany({
          where: { is_published: true, layer_id: { in: layerIds } },
          orderBy: { sort_order: "asc" },
        });
  return {
    layers: layers.map(toLeadershipLayer),
    members: members.map(toLeadershipMember),
  };
}

export async function listLeadershipLayersAdmin(): Promise<LeadershipLayer[]> {
  const rows = await prisma.leadershipLayer.findMany({
    orderBy: { sort_order: "asc" },
  });
  return rows.map(toLeadershipLayer);
}

export async function getLeadershipLayerAdmin(id: string): Promise<LeadershipLayer | null> {
  const row = await prisma.leadershipLayer.findUnique({ where: { id } });
  return row ? toLeadershipLayer(row) : null;
}

export async function listLeadershipMembersAdmin(): Promise<LeadershipMember[]> {
  const honorary = await prisma.leadershipLayer.findUnique({
    where: { slug: HONORARY_LEADERSHIP_LAYER_SLUG },
    select: { id: true },
  });
  const rows = await prisma.leadershipMember.findMany({
    where: honorary ? { NOT: { layer_id: honorary.id } } : {},
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
  });
  return rows.map(toLeadershipMember);
}

export async function getLeadershipMemberAdmin(id: string): Promise<LeadershipMember | null> {
  const row = await prisma.leadershipMember.findUnique({ where: { id } });
  return row ? toLeadershipMember(row) : null;
}

export async function listLeadershipLayerOptions(): Promise<{ id: string; title: string; slug: string }[]> {
  return prisma.leadershipLayer.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { sort_order: "asc" },
  });
}

export async function listLeadershipMembersAdminForLayer(layerId: string): Promise<LeadershipMember[]> {
  const rows = await prisma.leadershipMember.findMany({
    where: { layer_id: layerId },
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
  });
  return rows.map(toLeadershipMember);
}

export async function getHonoraryLeadershipLayerAdmin(): Promise<LeadershipLayer | null> {
  const row = await prisma.leadershipLayer.findUnique({
    where: { slug: HONORARY_LEADERSHIP_LAYER_SLUG },
  });
  return row ? toLeadershipLayer(row) : null;
}

/** Creates the reserved honorary layer if missing (admin DB writes). */
export async function ensureHonoraryLeadershipLayerAdmin(): Promise<LeadershipLayer> {
  const row = await prisma.leadershipLayer.upsert({
    where: { slug: HONORARY_LEADERSHIP_LAYER_SLUG },
    create: {
      title: "Honorary Position",
      slug: HONORARY_LEADERSHIP_LAYER_SLUG,
      description: "Distinguished honorary roles and advisors.",
      sort_order: 100,
      is_published: true,
    },
    update: {
      is_published: true,
    },
  });
  return toLeadershipLayer(row);
}

export async function listLeadershipLayersAdminFull(): Promise<LeadershipLayer[]> {
  const rows = await prisma.leadershipLayer.findMany({
    orderBy: { sort_order: "asc" },
  });
  return rows.map(toLeadershipLayer);
}
