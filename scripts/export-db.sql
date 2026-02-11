-- Table: favorites
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `character_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_character` (`user_id`,`character_id`),
  KEY `character_id` (`character_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (6, 3, 4, Thu Feb 05 2026 15:01:42 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (7, 3, 7, Thu Feb 05 2026 15:01:44 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (9, 1, 11, Thu Feb 05 2026 15:01:57 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (24, 1, 95, Fri Feb 06 2026 16:17:32 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (25, 1, 85, Fri Feb 06 2026 16:17:38 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (28, 1, 20, Fri Feb 06 2026 17:04:24 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (30, 1, 4, Sat Feb 07 2026 09:24:39 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (35, 1, 15, Sat Feb 07 2026 16:23:17 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (36, 1, 14, Sat Feb 07 2026 16:23:17 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (37, 1, 52, Sat Feb 07 2026 16:23:31 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (39, 1, 66, Sat Feb 07 2026 16:23:36 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (40, 1, 76, Sat Feb 07 2026 16:23:41 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (41, 1, 80, Sat Feb 07 2026 16:23:42 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (42, 1, 86, Sat Feb 07 2026 16:23:47 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (43, 1, 12, Sat Feb 07 2026 16:59:20 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (45, 1, 62, Mon Feb 09 2026 14:53:40 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (46, 1, 9, Mon Feb 09 2026 14:54:14 GMT+0800 (中国标准时间));
INSERT INTO `favorites` (`id`, `user_id`, `character_id`, `created_at`) VALUES (49, 1, 2, Wed Feb 11 2026 11:41:04 GMT+0800 (中国标准时间));

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`) VALUES (1, 'Ease', '2119318733@qq.com', '$2b$10$SKbEn7JsQcONMFUT/E762ObuYxw4rjKhCIyZuCi7prEmef/EYOb0a', Thu Feb 05 2026 08:19:18 GMT+0800 (中国标准时间));
INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`) VALUES (3, '安逸QAQ', '14789509113@sina.com', '$2b$10$pcrtuP1rR2MiwwDYLZejrO5Z6aT6BjBcZYXkYMk9G5vWwISE1GCNS', Thu Feb 05 2026 15:01:32 GMT+0800 (中国标准时间));

