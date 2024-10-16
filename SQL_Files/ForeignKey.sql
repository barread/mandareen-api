ALTER TABLE `report_pro` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `report_pro` ADD CONSTRAINT FOREIGN KEY(`pro_id`) REFERENCES pro(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `followup` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `followup` ADD CONSTRAINT FOREIGN KEY(`pro_id`) REFERENCES pro(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `followup` ADD CONSTRAINT FOREIGN KEY(`care_id`) REFERENCES cares(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `diary` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `stats` ADD CONSTRAINT FOREIGN KEY(`id_patient`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `devices` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `subs_pro` ADD CONSTRAINT FOREIGN KEY(`pro_id`) REFERENCES pro(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `subs_pro` ADD CONSTRAINT FOREIGN KEY(`sub_id`) REFERENCES subscription(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `fav_recipes` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `fav_recipes` ADD CONSTRAINT FOREIGN KEY(`recipe_id`) REFERENCES recipes(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `objectives` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `recipe_comments` ADD CONSTRAINT FOREIGN KEY(`recipes_id`) REFERENCES recipes(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `notifs_answers` ADD CONSTRAINT FOREIGN KEY(`objectives_id`) REFERENCES objectives(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `sessions` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `session_moods` ADD CONSTRAINT FOREIGN KEY(`sessions_id`) REFERENCES sessions(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `session_recurr` ADD CONSTRAINT FOREIGN KEY(`pro_id`) REFERENCES pro(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `session_recurr` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `stats_requests` ADD CONSTRAINT FOREIGN KEY(`global_stats_id`) REFERENCES global_stats(`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `obj_sport` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `obj_meal` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `patient_likes` ADD CONSTRAINT FOREIGN KEY(`patient_id`) REFERENCES patient(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `patient_likes` ADD CONSTRAINT FOREIGN KEY(`recipe_id`) REFERENCES recipes(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `pro_bill` ADD CONSTRAINT FOREIGN KEY(`sub_id`) REFERENCES subs_pro(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
