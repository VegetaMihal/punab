-- Set hero secondary CTA copy for July Awards promo (site_settings).

INSERT INTO "site_settings" ("key", "value", "updated_at")
VALUES ('hero.cta_secondary', 'July Award 2026', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = EXCLUDED."updated_at";
