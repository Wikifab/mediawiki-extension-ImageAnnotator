INSERT INTO imagelinks(il_from, il_from_namespace, il_to) SELECT il_from, il_from_namespace, REPLACE(il_to, ' ', '_') FROM imagelinks WHERE il_to LIKE '% %' ON DUPLICATE KEY UPDATE il_from = VALUES(il_from);
DELETE FROM imagelinks WHERE il_to LIKE '% %';