-- AddIndex profiles
CREATE INDEX IF NOT EXISTS "profiles_university_id_idx" ON "profiles"("university_id");
CREATE INDEX IF NOT EXISTS "profiles_membership_status_idx" ON "profiles"("membership_status");
CREATE INDEX IF NOT EXISTS "profiles_created_at_idx" ON "profiles"("created_at");

-- AddIndex chapters
CREATE INDEX IF NOT EXISTS "chapters_university_id_idx" ON "chapters"("university_id");

-- AddIndex leadership_members
CREATE INDEX IF NOT EXISTS "leadership_members_layer_id_idx" ON "leadership_members"("layer_id");

-- AddIndex forum_labels
CREATE INDEX IF NOT EXISTS "forum_labels_forum_id_idx" ON "forum_labels"("forum_id");

-- AddIndex forum_members
CREATE INDEX IF NOT EXISTS "forum_members_forum_id_idx" ON "forum_members"("forum_id");
CREATE INDEX IF NOT EXISTS "forum_members_label_id_idx" ON "forum_members"("label_id");

-- AddIndex gallery_images
CREATE INDEX IF NOT EXISTS "gallery_images_album_id_idx" ON "gallery_images"("album_id");
