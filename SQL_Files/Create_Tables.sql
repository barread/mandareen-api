CREATE TABLE IF NOT EXISTS `admin`(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `login` VARCHAR(20) NOT NULL,
  `pass` VARCHAR(200) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `type` ENUM('Commercial', 'Admin', 'Super-Admin') NOT NULL,
  `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  UNIQUE KEY `login`(`login`)
) ENGINE = InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET = utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `subscription` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `name` VARCHAR(50) NOT NULL,
  `price` DECIMAL(15,2) NOT NULL,
  `max_patients` INT NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name`(`name`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `subs_pro`(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `pro_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `sub_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `pending` ENUM('Yes', 'No') NOT NULL DEFAULT 'Yes',
  `date_sub_start` DATE NOT NULL,
  `date_sub_end` DATE NOT NULL,
  `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET = utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `pro` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `email` VARCHAR(100) NOT NULL,
  `pass` VARCHAR(200) NOT NULL,
  `civ` ENUM('M', 'Mme') NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `city` VARCHAR(150) NOT NULL,
  `zipcode` INT NOT NULL,
  `adeli` VARCHAR(11) NOT NULL,
  `phone` VARCHAR(160) NOT NULL,
  `type` ENUM('Psy', 'Doctor') NOT NULL,
  `stripe_id` VARCHAR(500),
  `creation_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  UNIQUE KEY email(`email`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `patient` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `email` VARCHAR(100) NOT NULL,
  `pass` VARCHAR(200) NOT NULL,
  `civ` ENUM('M', 'Mme') NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `birthdate` DATE NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `cares` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `sickness_name` VARCHAR(100) NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sickness_name`(`sickness_name`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `report_pro` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `content` TEXT DEFAULT NULL,
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `pro_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `reporting_date` DATE NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `followup` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `care_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `pro_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `is_active` BOOLEAN NOT NULL DEFAULT 1,
  `date_inactive` DATE,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `diary` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `content` TEXT NOT NULL,
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `stats` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `id_patient` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `report_date` DATE NOT NULL,
  `app_time` TIME,
  `recipe_time` TIME,
  `diary_time` TIME,
  `music_genre` VARCHAR(255),
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `devices` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `token` VARCHAR(255) NOT NULL,
  `platform` VARCHAR(45) NOT NULL,
  `manufacturer` VARCHAR(45) NOT NULL,
  `model` VARCHAR(45) NOT NULL,
  `uuid` VARCHAR(45) NOT NULL,
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `app_version` VARCHAR(255) NOT NULL,
  `version` VARCHAR(255) NOT NULL,
  `mod_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `recipes` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `name` VARCHAR(255) NOT NULL,
  `nb_cal` INTEGER NOT NULL,
  `ingredients` VARCHAR(1024) NOT NULL,
  `description` VARCHAR(2048),
  `image` LONGBLOB DEFAULT NULL,
  `nb_likes` INT NOT NULL DEFAULT 0,
  `recipe_cooking_time` TIME NOT NULL DEFAULT 0,
  `recipe_type` ENUM('Entree', 'Plat', 'Dessert', 'Sauce', 'Accompagnement', 'Boisson') NOT NULL DEFAULT "Entree" ,
  `diet` BOOLEAN NOT NULL DEFAULT false,
  `difficulty` ENUM('Facile', 'Moyen', 'Difficile') NOT NULL Default "Facile",
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `recipe_comments` (
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `recipes_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `comment` TEXT NOT NULL,
  `notation` INTEGER NOT NULL DEFAULT 0,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `fav_recipes`
(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `recipe_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `objectives`
(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `obj_sleep` INT NOT NULL DEFAULT 0,
  `obj_cal` INT NOT NULL DEFAULT 0,
  `obj_sport` INT NOT NULL DEFAULT 0,
  `nb_sleep` INT NOT NULL DEFAULT 0,
  `nb_cal` INT NOT NULL DEFAULT 0,
  `nb_sport` INT NOT NULL DEFAULT 0,
  `due_date` DATE NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `notifs_answers`
(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `objectives_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `content` TEXT NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `sessions`
(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `text_situation` TEXT,
  `text_mood` TEXT,
  `mood_global_degree` INT NOT NULL DEFAULT 0,
  `text_automatic` TEXT,
  `automatic_global_degree` INT NOT NULL DEFAULT 0,
  `text_rational` TEXT,
  `rational_global_degree` INT NOT NULL DEFAULT 0,
  `text_result` TEXT,
  `result_global_degree` INT NOT NULL DEFAULT 0,
  `status` ENUM('En cours', 'Fini') NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `session_moods`
(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `sessions_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `mood_name` VARCHAR(100) NOT NULL,
  `mood_degree` INT NOT NULL DEFAULT 0,
  `result_mood_degree` INT NOT NULL DEFAULT 0,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `global_stats`
(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `nb_pro` INT NOT NULL DEFAULT 0,
  `nb_seance` INT NOT NULL DEFAULT 0,
  `pat_average` DECIMAL(15, 2) NOT NULL DEFAULT 0,
  `nb_rapport` INT NOT NULL DEFAULT 0,
  `nb_patient` INT NOT NULL DEFAULT 0,
  `time_average` TIME NOT NULL DEFAULT 0,
  `total_nb_req` INT NOT NULL DEFAULT 0,
  `total_nb_errors` INT NOT NULL DEFAULT 0,
  `cutoff_date` DATE NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cutoff_date`(`cutoff_date`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `stats_requests`
(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `global_stats_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `total_nb_req` INT NOT NULL DEFAULT 0,
  `interface` ENUM('Pro', 'Patient', 'Admin') NOT NULL,
  `cutoff_date` DATE NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date_interface`(`cutoff_date`, `interface`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `obj_sport`(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `reporting_date` DATE NOT NULL,
  `duration` TIME NOT NULL DEFAULT 0,
  `description` VARCHAR(1024) NOT NULL,
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `is_finished` BOOLEAN NOT NULL,
  `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET = utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `obj_meal`(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `reporting_date` DATE NOT NULL,
  `description` VARCHAR(1024) NOT NULL,
  `calories` INT NOT NULL DEFAULT 0,
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `is_finished` BOOLEAN NOT NULL,
  `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET = utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `session_recurr`(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `pro_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `recurrence` ENUM('Jamais', 'Quotidien', 'Hebdomadaire', 'Mensuel') NOT NULL,
  `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  UNIQUE KEY `pro_patient`(`pro_id`, `patient_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET = utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `patient_likes`(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `patient_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `recipe_id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  UNIQUE KEY `patient_recipe`(`patient_id`, `recipe_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET = utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `pro_bill`(
  `id` VARCHAR(100) NOT NULL DEFAULT 'default_value',
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `address` VARCHAR(256) NOT NULL,
  `zipcode` VARCHAR(50) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `sub_id` VARCHAR(100) NOT NULL,
  `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET = utf8 COLLATE utf8_general_ci;
