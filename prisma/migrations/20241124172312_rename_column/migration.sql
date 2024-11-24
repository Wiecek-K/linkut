/*
  Warnings:

  - You are about to drop the column `shortUrl` on the `link` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortUrlCode]` on the table `Link` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortUrlCode` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Link_shortUrl_key` ON `link`;

-- AlterTable
ALTER TABLE `link` DROP COLUMN `shortUrl`,
    ADD COLUMN `shortUrlCode` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Link_shortUrlCode_key` ON `Link`(`shortUrlCode`);
