CREATE TABLE `appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`date` text NOT NULL,
	`start_minutes` integer NOT NULL,
	`duration` integer DEFAULT 45 NOT NULL,
	`type` text DEFAULT 'Primera consulta' NOT NULL,
	`mode` text DEFAULT 'Presencial' NOT NULL,
	`status` text DEFAULT 'pendiente' NOT NULL,
	`source` text DEFAULT 'professional' NOT NULL,
	`request_key` text,
	`request_code` text,
	`request_notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "appointment_status_valid" CHECK("appointments"."status" IN ('pendiente','confirmado','atendido','cancelado','ausente')),
	CONSTRAINT "appointment_time_valid" CHECK("appointments"."start_minutes" >= 0 AND "appointments"."duration" BETWEEN 15 AND 240 AND "appointments"."start_minutes"+"appointments"."duration" <= 1440)
);
--> statement-breakpoint
CREATE INDEX `appointments_date_idx` ON `appointments` (`date`,`start_minutes`);--> statement-breakpoint
CREATE UNIQUE INDEX `request_key_unique` ON `appointments` (`request_key`);--> statement-breakpoint
CREATE TABLE `schedule_blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`start_minutes` integer NOT NULL,
	`duration` integer NOT NULL,
	`reason` text NOT NULL,
	CONSTRAINT "block_time_valid" CHECK("schedule_blocks"."start_minutes" >= 0 AND "schedule_blocks"."duration" BETWEEN 15 AND 1440 AND "schedule_blocks"."start_minutes"+"schedule_blocks"."duration" <= 1440)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`appointment_id` integer,
	`date` text NOT NULL,
	`reason` text NOT NULL,
	`notes` text NOT NULL,
	`goal` text NOT NULL,
	`indications` text NOT NULL,
	`weight` real NOT NULL,
	`height` real NOT NULL,
	`fat` real DEFAULT 0 NOT NULL,
	`muscle` real DEFAULT 0 NOT NULL,
	`waist` real DEFAULT 0 NOT NULL,
	`hip` real DEFAULT 0 NOT NULL,
	`custom_json` text DEFAULT '{}' NOT NULL,
	`draft` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "consultation_measurements_valid" CHECK("consultations"."weight" > 0 AND "consultations"."height" > 0)
);
--> statement-breakpoint
CREATE INDEX `consultations_patient_date_idx` ON `consultations` (`patient_id`,`date`);--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`age` integer DEFAULT 0 NOT NULL,
	`dni` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`goal` text DEFAULT 'Primera consulta' NOT NULL,
	`insurance` text DEFAULT 'Particular' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`allergies` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "patient_age_valid" CHECK("patients"."age" BETWEEN 0 AND 120)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_dni_unique` ON `patients` (`dni`) WHERE "patients"."dni" <> '';--> statement-breakpoint
CREATE TABLE `app_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "revision_nonnegative" CHECK("app_state"."revision" >= 0)
);
--> statement-breakpoint
CREATE TRIGGER confirmed_appointments_insert BEFORE INSERT ON appointments
WHEN NEW.status IN ('confirmado','atendido') AND (
 EXISTS(SELECT 1 FROM appointments a WHERE a.date=NEW.date AND a.status IN ('confirmado','atendido') AND NEW.start_minutes<a.start_minutes+a.duration AND NEW.start_minutes+NEW.duration>a.start_minutes)
 OR EXISTS(SELECT 1 FROM schedule_blocks b WHERE b.date=NEW.date AND NEW.start_minutes<b.start_minutes+b.duration AND NEW.start_minutes+NEW.duration>b.start_minutes))
BEGIN SELECT RAISE(ABORT,'schedule_overlap'); END;
--> statement-breakpoint
CREATE TRIGGER confirmed_appointments_update BEFORE UPDATE ON appointments
WHEN NEW.status IN ('confirmado','atendido') AND (
 EXISTS(SELECT 1 FROM appointments a WHERE a.id<>NEW.id AND a.date=NEW.date AND a.status IN ('confirmado','atendido') AND NEW.start_minutes<a.start_minutes+a.duration AND NEW.start_minutes+NEW.duration>a.start_minutes)
 OR EXISTS(SELECT 1 FROM schedule_blocks b WHERE b.date=NEW.date AND NEW.start_minutes<b.start_minutes+b.duration AND NEW.start_minutes+NEW.duration>b.start_minutes))
BEGIN SELECT RAISE(ABORT,'schedule_overlap'); END;
--> statement-breakpoint
CREATE TRIGGER schedule_blocks_insert BEFORE INSERT ON schedule_blocks
WHEN EXISTS(SELECT 1 FROM appointments a WHERE a.date=NEW.date AND a.status IN ('confirmado','atendido') AND NEW.start_minutes<a.start_minutes+a.duration AND NEW.start_minutes+NEW.duration>a.start_minutes)
BEGIN SELECT RAISE(ABORT,'schedule_overlap'); END;
--> statement-breakpoint
CREATE TRIGGER consultation_immutable BEFORE UPDATE ON consultations WHEN OLD.draft=0
BEGIN SELECT RAISE(ABORT,'consultation_immutable'); END;
