import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { name: "North South University" },
      create: {
        name: "North South University",
        slug: "north-south-university",
        district: "Dhaka",
      },
      update: { slug: "north-south-university", district: "Dhaka" },
    }),
    prisma.university.upsert({
      where: { name: "BRAC University" },
      create: {
        name: "BRAC University",
        slug: "brac-university",
        district: "Dhaka",
      },
      update: { slug: "brac-university", district: "Dhaka" },
    }),
    prisma.university.upsert({
      where: { name: "Independent University, Bangladesh" },
      create: {
        name: "Independent University, Bangladesh",
        slug: "independent-university-bangladesh",
        district: "Dhaka",
      },
      update: { slug: "independent-university-bangladesh", district: "Dhaka" },
    }),
  ]);

  if (!(await prisma.chapter.findFirst({ where: { title: "NSU Chapter" } }))) {
    await prisma.chapter.create({
      data: {
        university_id: universities[0].id,
        title: "NSU Chapter",
        description: "Campus chapter for NSU members.",
        contact_email: "nsu@punab.org",
        member_count: 120,
        is_published: true,
      },
    });
  }
  if (!(await prisma.chapter.findFirst({ where: { title: "BRACU Chapter" } }))) {
    await prisma.chapter.create({
      data: {
        university_id: universities[1].id,
        title: "BRACU Chapter",
        description: "Campus chapter for BRAC University members.",
        contact_email: "bracu@punab.org",
        member_count: 95,
        is_published: true,
      },
    });
  }

  const layer = await prisma.leadershipLayer.upsert({
    where: { slug: "executive" },
    create: {
      title: "Executive committee",
      slug: "executive",
      description: "National coordination and secretariat.",
      sort_order: 0,
      is_published: true,
    },
    update: {
      title: "Executive committee",
      description: "National coordination and secretariat.",
      sort_order: 0,
      is_published: true,
    },
  });

  await prisma.leadershipLayer.upsert({
    where: { slug: "honorary" },
    create: {
      title: "Honorary Position",
      slug: "honorary",
      description: "Distinguished honorary roles and advisors.",
      sort_order: 100,
      is_published: false,
    },
    update: {
      title: "Honorary Position",
      description: "Distinguished honorary roles and advisors.",
      sort_order: 100,
    },
  });

  const memberCount = await prisma.leadershipMember.count({ where: { layer_id: layer.id } });
  if (memberCount === 0) {
    await prisma.leadershipMember.createMany({
      data: [
        {
          layer_id: layer.id,
          name: "Ahsan Rahman",
          position: "President",
          bio: "Leads national coordination and policy engagement.",
          sort_order: 1,
          is_published: true,
        },
        {
          layer_id: layer.id,
          name: "Nabila Islam",
          position: "General Secretary",
          bio: "Coordinates chapter communication and programs.",
          sort_order: 2,
          is_published: true,
        },
        {
          layer_id: layer.id,
          name: "Farhan Kabir",
          position: "Organizing Secretary",
          bio: "Supports membership growth and events.",
          sort_order: 3,
          is_published: true,
        },
      ],
    });
  }

  await Promise.all([
    prisma.notice.upsert({
      where: { slug: "official-committee-circular-2026" },
      create: {
        title: "Official Committee Circular 2026",
        slug: "official-committee-circular-2026",
        excerpt: "Circular regarding chapter reporting process.",
        body: "All chapters must submit monthly reports by the 5th of each month.",
        is_published: true,
        published_at: new Date(Date.now() - 7 * 86400000),
      },
      update: { is_published: true },
    }),
    prisma.notice.upsert({
      where: { slug: "membership-verification-window" },
      create: {
        title: "Membership Verification Window",
        slug: "membership-verification-window",
        excerpt: "Verification process and document checklist.",
        body: "Members are requested to verify profile and university details this month.",
        is_published: true,
        published_at: new Date(Date.now() - 2 * 86400000),
      },
      update: { is_published: true },
    }),
  ]);

  const soon = new Date();
  soon.setDate(soon.getDate() + 14);
  const later = new Date();
  later.setDate(later.getDate() + 21);

  await prisma.event.upsert({
    where: { slug: "national-student-leadership-forum" },
    create: {
      title: "National Student Leadership Forum",
      slug: "national-student-leadership-forum",
      description: "Discussion on student leadership and coordination.",
      location: "Dhaka",
      start_at: soon,
      end_at: new Date(soon.getTime() + 4 * 3600000),
      is_published: true,
    },
    update: { is_published: true },
  });

  await prisma.event.upsert({
    where: { slug: "chapter-coordination-workshop" },
    create: {
      title: "Chapter Coordination Workshop",
      slug: "chapter-coordination-workshop",
      description: "Operations workshop for chapter representatives.",
      location: "Online",
      start_at: later,
      end_at: new Date(later.getTime() + 2 * 3600000),
      is_published: true,
    },
    update: { is_published: true },
  });

  const album = await prisma.galleryAlbum.upsert({
    where: { slug: "national-activities" },
    create: {
      title: "National Activities",
      slug: "national-activities",
      description: "Photos from national PUNAB programs.",
      is_published: true,
      sort_order: 1,
      featured_on_home: true,
    },
    update: {
      description: "Photos from national PUNAB programs.",
      is_published: true,
      sort_order: 1,
      featured_on_home: true,
    },
  });

  const imgCount = await prisma.galleryImage.count({ where: { album_id: album.id } });
  if (imgCount === 0) {
    await prisma.galleryImage.createMany({
      data: [
        {
          album_id: album.id,
          storage_path: "seed/national-1.jpg",
          public_url:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
          caption: "Opening session",
          alt_text: "Opening session at PUNAB event",
          sort_order: 1,
          is_featured: true,
          is_cover: true,
        },
        {
          album_id: album.id,
          storage_path: "seed/national-2.jpg",
          public_url:
            "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1200&auto=format&fit=crop",
          caption: "Panel discussion",
          alt_text: "Panel discussion with student leaders",
          sort_order: 2,
          is_featured: true,
          is_cover: false,
        },
        {
          album_id: album.id,
          storage_path: "seed/national-3.jpg",
          public_url:
            "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=1200&auto=format&fit=crop",
          caption: "Networking segment",
          alt_text: "Participants networking at event venue",
          sort_order: 3,
          is_featured: false,
          is_cover: false,
        },
      ],
    });
  }

  const settings = [
    ["hero.title", "Private University National Association of Bangladesh"],
    ["hero.subtitle", "A national platform for private university communities."],
    ["hero.cta_primary", "Explore chapters"],
    ["hero.cta_secondary", "Read notices"],
    ["hero.image_url", ""],
    ["footer.blurb", "PUNAB connects private university communities across Bangladesh."],
    ["footer.address", "PUNAB office, Bashundhara, Dhaka"],
    ["footer.email", "punabofficial@gmail.com"],
    ["about.intro", "PUNAB unites students, teachers, and alumni across private universities."],
    ["contact.intro", "Reach the secretariat for organizational and partnership communication."],
    ["join.intro", "Start or complete your membership application."],
    ["join.body", "Use an active university email where possible so admins can verify your chapter."],
    ["home.who_title", "Who we are"],
    ["home.who_body", "PUNAB is a national association of private university societies."],
    ["home.who_body_2", "We collaborate on programmes, representation, and shared resources."],
    ["home.mission_title", "Mission"],
    ["home.mission_body", "Empower student voices and strengthen chapter networks."],
    ["home.vision_title", "Vision"],
    ["home.vision_body", "A coordinated national platform for private university communities."],
    ["home.coord_title", "Coordination"],
    ["home.coord_body", "Chapters share updates through notices, events, and the national secretariat."],
    ["home.coord_bullet_1", "Structured reporting windows"],
    ["home.coord_bullet_2", "Chapter liaison support"],
    ["home.coord_bullet_3", "National programmes and workshops"],
    ["home.featured_label", "Official updates"],
    ["home.featured_title", "Where to watch for news"],
    [
      "home.featured_body",
      "Time-sensitive statements and flagship programmes are announced through this site.",
    ],
    ["home.cta_title", "Stay connected"],
    ["home.cta_body", "Join the network and keep your chapter profile current."],
  ] as const;

  for (const [key, value] of settings) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
