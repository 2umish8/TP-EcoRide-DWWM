-- AlterTable
ALTER TABLE `carpooling` MODIFY `status` VARCHAR(50) NOT NULL DEFAULT 'prévu';

-- CreateTable
CREATE TABLE `CreditTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `transaction_type` VARCHAR(50) NOT NULL,
    `amount` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `transaction_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
