-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pseudo` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `credits` INTEGER NOT NULL DEFAULT 20,
    `suspended` BOOLEAN NOT NULL DEFAULT false,
    `profile_picture_url` VARCHAR(255) NULL,
    `creation_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `User_pseudo_key`(`pseudo`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_Role` (
    `user_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Brand_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Color_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plate_number` VARCHAR(20) NOT NULL,
    `first_registration_date` DATE NULL,
    `model` VARCHAR(100) NOT NULL,
    `seats_available` INTEGER NOT NULL,
    `is_electric` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `brand_id` INTEGER NULL,
    `color_id` INTEGER NULL,

    UNIQUE INDEX `Vehicle_plate_number_key`(`plate_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Carpooling` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pr├®vu',
    `departure_address` VARCHAR(255) NOT NULL,
    `arrival_address` VARCHAR(255) NOT NULL,
    `departure_datetime` DATETIME(0) NOT NULL,
    `arrival_datetime` DATETIME(0) NOT NULL,
    `price_per_passenger` INTEGER NOT NULL,
    `initial_seats_offered` INTEGER NOT NULL,
    `seats_remaining` INTEGER NOT NULL,
    `platform_commission_earned` INTEGER NOT NULL DEFAULT 2,
    `driver_id` INTEGER NOT NULL,
    `vehicle_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `passenger_id` INTEGER NOT NULL,
    `carpooling_id` INTEGER NOT NULL,
    `credits_paid` INTEGER NOT NULL,
    `participation_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_validated_by_passenger` BOOLEAN NULL,
    `cancellation_date` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User_Role` ADD CONSTRAINT `User_Role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Role` ADD CONSTRAINT `User_Role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `Brand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Carpooling` ADD CONSTRAINT `Carpooling_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Carpooling` ADD CONSTRAINT `Carpooling_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participation` ADD CONSTRAINT `Participation_passenger_id_fkey` FOREIGN KEY (`passenger_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participation` ADD CONSTRAINT `Participation_carpooling_id_fkey` FOREIGN KEY (`carpooling_id`) REFERENCES `Carpooling`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

