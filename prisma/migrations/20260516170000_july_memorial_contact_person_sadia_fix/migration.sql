UPDATE "JulyMemorialInvitation"
SET "contactPerson" = REPLACE("contactPerson", 'Sadiq Tasneem', 'Sadia Tasneem')
WHERE "contactPerson" LIKE '%Sadiq Tasneem%';
