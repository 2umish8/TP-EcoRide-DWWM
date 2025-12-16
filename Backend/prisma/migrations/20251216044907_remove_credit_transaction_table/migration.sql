/*
  Warnings:

  - You are about to drop the `credittransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `credittransaction` DROP FOREIGN KEY `CreditTransaction_user_id_fkey`;

-- DropTable
DROP TABLE `credittransaction`;
