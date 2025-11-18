-- Create smart_notes table
CREATE TABLE IF NOT EXISTS `smart_notes` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `tags` json DEFAULT NULL,
  `folder_id` varchar(255) DEFAULT NULL,
  `project_id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  KEY `idx_smart_notes_user_id` (`user_id`),
  KEY `idx_smart_notes_folder_id` (`folder_id`),
  KEY `idx_smart_notes_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
