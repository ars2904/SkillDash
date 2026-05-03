-- SkillDash Advanced Upgrade Migration
-- Run this against your TiDB database (skilldash_db)
-- This migration is SAFE to run multiple times (uses IF NOT EXISTS)

-- =============================================
-- 1. NEW COLUMNS ON EXISTING TABLES
-- =============================================

-- Users table enhancements
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `bio` TEXT DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `location` VARCHAR(100) DEFAULT 'Remote';
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_banned` TINYINT(1) DEFAULT 0;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_admin` TINYINT(1) DEFAULT 0;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `last_active` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_verified` TINYINT(1) DEFAULT 1;

-- Jobs table enhancements
ALTER TABLE `jobs` ADD COLUMN IF NOT EXISTS `budget_amount` DECIMAL(15,2) DEFAULT NULL;
ALTER TABLE `jobs` ADD COLUMN IF NOT EXISTS `deadline` DATE DEFAULT NULL;
ALTER TABLE `jobs` ADD COLUMN IF NOT EXISTS `urgency` ENUM('low','medium','high','critical') DEFAULT 'medium';
ALTER TABLE `jobs` ADD COLUMN IF NOT EXISTS `skills_required` VARCHAR(500) DEFAULT NULL;

-- Update category column to support more types (if it's varchar, just ensure enough length)
ALTER TABLE `jobs` MODIFY COLUMN `category` VARCHAR(100) DEFAULT 'Development';

-- =============================================
-- 2. NEW TABLES
-- =============================================

-- Notifications table (was missing from original schema but referenced in code)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'info',
  `content` TEXT,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_notifications_unread` (`user_id`, `is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Admin activity log
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` ENUM('user','job','review','system') DEFAULT 'system',
  `target_id` INT DEFAULT NULL,
  `details` TEXT,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User skills (many-to-many via tags)
CREATE TABLE IF NOT EXISTS `user_skills` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `skill` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_skill` (`user_id`, `skill`),
  CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Reports system
CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reporter_id` INT NOT NULL,
  `reported_user_id` INT DEFAULT NULL,
  `reported_job_id` INT DEFAULT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `details` TEXT,
  `status` ENUM('pending','reviewed','resolved','dismissed') DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reporter_id` (`reporter_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Platform activity feed (for admin dashboard)
CREATE TABLE IF NOT EXISTS `platform_activity` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(50) NOT NULL,
  `user_id` INT DEFAULT NULL,
  `description` TEXT,
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_recent` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================
-- 3. INDEXES FOR PERFORMANCE
-- =============================================

-- Speed up job filtering
CREATE INDEX IF NOT EXISTS `idx_jobs_status` ON `jobs` (`status`);
CREATE INDEX IF NOT EXISTS `idx_jobs_category` ON `jobs` (`category`);
CREATE INDEX IF NOT EXISTS `idx_jobs_created` ON `jobs` (`created_at` DESC);

-- Speed up user search
CREATE INDEX IF NOT EXISTS `idx_users_username` ON `users` (`username`);
CREATE INDEX IF NOT EXISTS `idx_users_role` ON `users` (`role`);

-- =============================================
-- NOTE: Admin user will be auto-seeded by the 
-- backend on startup (with proper bcrypt hash).
-- Default credentials: admin@skilldash.com / admin123
-- =============================================
