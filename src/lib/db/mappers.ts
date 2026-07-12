import type {
  Certificate,
  CertificateEmailLog,
  CertificateTemplate,
  JulyMemorialInvitation,
  Chapter,
  EventRow,
  Forum,
  ForumLabel,
  ForumMember,
  GalleryAlbum,
  GalleryImage,
  LeadershipLayer,
  LeadershipMember,
  Notice,
  PageRow,
  Profile,
  University,
} from "@/types/database";
import type {
  Certificate as PrismaCertificate,
  CertificateEmailLog as PrismaCertificateEmailLog,
  CertificateTemplate as PrismaCertificateTemplate,
  JulyMemorialInvitation as PrismaJulyMemorialInvitation,
  Chapter as PrismaChapter,
  Event as PrismaEvent,
  Forum as PrismaForum,
  ForumLabel as PrismaForumLabel,
  ForumMember as PrismaForumMember,
  GalleryAlbum as PrismaGalleryAlbum,
  GalleryImage as PrismaGalleryImage,
  LeadershipLayer as PrismaLeadershipLayer,
  LeadershipMember as PrismaLeadershipMember,
  Notice as PrismaNotice,
  Page as PrismaPage,
  Profile as PrismaProfile,
  University as PrismaUniversity,
} from "@prisma/client";

export function toCertificate(c: PrismaCertificate): Certificate {
  return {
    id: c.id,
    certificateNumber: c.certificateNumber,
    certificateTitle: c.certificateTitle,
    certificateType: c.certificateType,
    recipientName: c.recipientName,
    recipientEmail: c.recipientEmail,
    universityName: c.universityName,
    eventName: c.eventName,
    role: c.role,
    achievement: c.achievement,
    timePeriod: c.timePeriod,
    reason: c.reason,
    issueDate: c.issueDate.toISOString(),
    templateId: c.templateId,
    pdfUrl: c.pdfUrl,
    verificationUrl: c.verificationUrl,
    status: c.status as Certificate["status"],
    signatoryName1: c.signatoryName1,
    signatoryDesignation1: c.signatoryDesignation1,
    signatoryName2: c.signatoryName2,
    signatoryDesignation2: c.signatoryDesignation2,
    signatorySignature1Url: c.signatorySignature1Url,
    signatorySignature2Url: c.signatorySignature2Url,
    customFields: c.customFields,
    emailSentAt: c.emailSentAt ? c.emailSentAt.toISOString() : null,
    revokedAt: c.revokedAt ? c.revokedAt.toISOString() : null,
    revokedReason: c.revokedReason,
    createdById: c.createdById,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function toCertificateTemplate(t: PrismaCertificateTemplate): CertificateTemplate {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    type: t.type,
    htmlContent: t.htmlContent,
    cssContent: t.cssContent,
    isActive: t.isActive,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export function toCertificateEmailLog(l: PrismaCertificateEmailLog): CertificateEmailLog {
  return {
    id: l.id,
    certificateId: l.certificateId,
    recipientEmail: l.recipientEmail,
    subject: l.subject,
    status: l.status,
    sentAt: l.sentAt.toISOString(),
  };
}

export function toJulyMemorialInvitation(r: PrismaJulyMemorialInvitation): JulyMemorialInvitation {
  return {
    id: r.id,
    templateSlug: r.templateSlug,
    recipientName: r.recipientName,
    recipientDesignation: r.recipientDesignation,
    recipientInstitution: r.recipientInstitution,
    contactPerson: r.contactPerson,
    specialContact: r.specialContact,
    isChiefGuest: r.isChiefGuest,
    responseStatus: r.responseStatus as JulyMemorialInvitation["responseStatus"],
    pdfGeneratedAt: r.pdfGeneratedAt?.toISOString() ?? null,
    createdById: r.createdById,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toProfile(p: PrismaProfile): Profile {
  return {
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role as Profile["role"],
    admin_scopes: (p.admin_scopes ?? []).filter(
      (s): s is Profile["admin_scopes"][number] =>
        s === "invitations" || s === "certificates" || s === "july_award_cards" || s === "july_award_participants",
    ),
    membership_status: p.membership_status as Profile["membership_status"],
    phone: p.phone,
    university_id: p.university_id,
    university_other: p.university_other,
    department: p.department,
    student_id: p.student_id,
    session: p.session,
    district: p.district,
    photo_url: p.photo_url,
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  };
}

export function toUniversity(u: PrismaUniversity): University {
  return {
    id: u.id,
    name: u.name,
    slug: u.slug,
    district: u.district,
    created_at: u.created_at.toISOString(),
    updated_at: u.updated_at.toISOString(),
  };
}

export function toChapter(c: PrismaChapter): Chapter {
  return {
    id: c.id,
    university_id: c.university_id,
    title: c.title,
    description: c.description,
    contact_email: c.contact_email,
    member_count: c.member_count,
    image_url: c.image_url,
    is_published: c.is_published,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  };
}

export function toLeadershipLayer(l: PrismaLeadershipLayer): LeadershipLayer {
  return {
    id: l.id,
    title: l.title,
    slug: l.slug,
    description: l.description,
    sort_order: l.sort_order,
    is_published: l.is_published,
    created_at: l.created_at.toISOString(),
    updated_at: l.updated_at.toISOString(),
  };
}

export function toLeadershipMember(m: PrismaLeadershipMember): LeadershipMember {
  return {
    id: m.id,
    layer_id: m.layer_id,
    name: m.name,
    position: m.position,
    bio: m.bio,
    photo_url: m.photo_url,
    sort_order: m.sort_order,
    is_published: m.is_published,
    created_at: m.created_at.toISOString(),
    updated_at: m.updated_at.toISOString(),
  };
}

export function toForum(f: PrismaForum): Forum {
  return {
    id: f.id,
    title: f.title,
    slug: f.slug,
    description: f.description,
    sort_order: f.sort_order,
    is_published: f.is_published,
    created_at: f.created_at.toISOString(),
    updated_at: f.updated_at.toISOString(),
  };
}

export function toForumLabel(l: PrismaForumLabel): ForumLabel {
  return {
    id: l.id,
    forum_id: l.forum_id,
    title: l.title,
    description: l.description,
    sort_order: l.sort_order,
    is_published: l.is_published,
    created_at: l.created_at.toISOString(),
    updated_at: l.updated_at.toISOString(),
  };
}

export function toForumMember(m: PrismaForumMember): ForumMember {
  return {
    id: m.id,
    forum_id: m.forum_id,
    label_id: m.label_id,
    name: m.name,
    position: m.position,
    bio: m.bio,
    photo_url: m.photo_url,
    sort_order: m.sort_order,
    is_published: m.is_published,
    created_at: m.created_at.toISOString(),
    updated_at: m.updated_at.toISOString(),
  };
}

export function toNotice(n: PrismaNotice): Notice {
  return {
    id: n.id,
    title: n.title,
    slug: n.slug,
    excerpt: n.excerpt,
    body: n.body,
    is_published: n.is_published,
    published_at: n.published_at ? n.published_at.toISOString() : null,
    created_at: n.created_at.toISOString(),
    updated_at: n.updated_at.toISOString(),
  };
}

export function toEventRow(e: PrismaEvent): EventRow {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    location: e.location,
    banner_url: e.banner_url,
    post_url: e.post_url,
    start_at: e.start_at.toISOString(),
    end_at: e.end_at ? e.end_at.toISOString() : null,
    is_published: e.is_published,
    created_at: e.created_at.toISOString(),
    updated_at: e.updated_at.toISOString(),
  };
}

export function toGalleryAlbum(a: PrismaGalleryAlbum): GalleryAlbum {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    description: a.description,
    cover_image_url: a.cover_image_url,
    is_published: a.is_published,
    sort_order: a.sort_order,
    featured_on_home: a.featured_on_home,
    created_at: a.created_at.toISOString(),
    updated_at: a.updated_at.toISOString(),
  };
}

export function toGalleryImage(i: PrismaGalleryImage): GalleryImage {
  return {
    id: i.id,
    album_id: i.album_id,
    storage_path: i.storage_path,
    public_url: i.public_url,
    caption: i.caption,
    alt_text: i.alt_text,
    sort_order: i.sort_order,
    is_featured: i.is_featured,
    is_cover: i.is_cover,
    created_at: i.created_at.toISOString(),
    updated_at: i.updated_at.toISOString(),
  };
}

export function toPageRow(p: PrismaPage): PageRow {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    body: p.body,
    meta_description: p.meta_description,
    is_published: p.is_published,
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  };
}
