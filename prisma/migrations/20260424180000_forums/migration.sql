-- CreateTable
CREATE TABLE "forums" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_labels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_id" UUID NOT NULL,
    "label_id" UUID,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "photo_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forums_slug_key" ON "forums"("slug");

-- AddForeignKey
ALTER TABLE "forum_labels" ADD CONSTRAINT "forum_labels_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_members" ADD CONSTRAINT "forum_members_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_members" ADD CONSTRAINT "forum_members_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "forum_labels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed Debate Forum + default labels (admin fills members)
INSERT INTO "forums" ("id", "title", "slug", "description", "sort_order", "is_published", "created_at", "updated_at")
VALUES (
    gen_random_uuid(),
    'Debate Forum',
    'debate',
    NULL,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "forum_labels" ("id", "forum_id", "title", "description", "sort_order", "is_published", "created_at", "updated_at")
SELECT gen_random_uuid(), f.id, 'Debate Moderator', NULL, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "forums" f WHERE f.slug = 'debate';

INSERT INTO "forum_labels" ("id", "forum_id", "title", "description", "sort_order", "is_published", "created_at", "updated_at")
SELECT gen_random_uuid(), f.id, 'Media Moderator', NULL, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "forums" f WHERE f.slug = 'debate';
