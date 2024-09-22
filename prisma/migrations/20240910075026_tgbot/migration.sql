-- CreateTable
CREATE TABLE `User` (
    `id` BIGINT NOT NULL,
    `firstname` VARCHAR(64) NOT NULL,
    `lastname` VARCHAR(64) NULL,
    `username` VARCHAR(32) NULL,
    `language` VARCHAR(2) NOT NULL,
    `is_premium` BOOLEAN NOT NULL,
    `photo_url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `betaTester` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserReferrals` (
    `referralId` BIGINT NOT NULL,
    `inviterId` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserReferrals_referralId_key`(`referralId`),
    PRIMARY KEY (`referralId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFarming` (
    `userId` BIGINT NOT NULL,
    `lastFarmingTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `farmingTime` INTEGER NOT NULL DEFAULT 0,
    `earnedPoints` DOUBLE NOT NULL DEFAULT 0,
    `referralPoints` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `UserFarming_userId_key`(`userId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `points` DOUBLE NOT NULL,
    `condition` VARCHAR(191) NOT NULL DEFAULT '',
    `category` VARCHAR(191) NOT NULL DEFAULT 'SMM',

    UNIQUE INDEX `Task_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `taskId` INTEGER NOT NULL,

    UNIQUE INDEX `UserTasks_userId_taskId_key`(`userId`, `taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInfo` (
    `userId` BIGINT NOT NULL,
    `wallet` VARCHAR(191) NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `userid` BIGINT NOT NULL,
    `adminType` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL DEFAULT 'Server',

    UNIQUE INDEX `Admin_userid_key`(`userid`),
    PRIMARY KEY (`userid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminPermissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creatorId` BIGINT NOT NULL,
    `traderId` BIGINT NULL,
    `creatorWallet` VARCHAR(191) NOT NULL,
    `traderWallet` VARCHAR(191) NULL,
    `creatorCollectionId` INTEGER NULL,
    `traderCollectionId` INTEGER NULL,
    `creatorConfirmed` INTEGER NOT NULL DEFAULT -1,
    `traderConfirmed` INTEGER NOT NULL DEFAULT -1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CREATED',
    `hash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tradeWalletId` INTEGER NULL,

    UNIQUE INDEX `Trade_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeWallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` VARCHAR(191) NOT NULL,
    `mnemonics` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TradeWallet_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradePayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TradePayment_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemsCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NftItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    `address` VARCHAR(128) NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `collection` VARCHAR(64) NULL,
    `collectionImageUrl` VARCHAR(255) NULL,
    `collectionId` INTEGER NOT NULL,

    UNIQUE INDEX `NftItem_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` VARCHAR(128) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `symbol` VARCHAR(16) NOT NULL,
    `image` VARCHAR(512) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `collectionId` INTEGER NOT NULL,

    UNIQUE INDEX `TokenItem_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileInput` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `savename` VARCHAR(191) NOT NULL,
    `fileextension` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `userId` BIGINT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FileInput_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileId` INTEGER NOT NULL,
    `collectionId` INTEGER NOT NULL,

    UNIQUE INDEX `FileItem_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserReferrals` ADD CONSTRAINT `UserReferrals_referralId_fkey` FOREIGN KEY (`referralId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserReferrals` ADD CONSTRAINT `UserReferrals_inviterId_fkey` FOREIGN KEY (`inviterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFarming` ADD CONSTRAINT `UserFarming_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTasks` ADD CONSTRAINT `UserTasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTasks` ADD CONSTRAINT `UserTasks_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserInfo` ADD CONSTRAINT `UserInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_traderId_fkey` FOREIGN KEY (`traderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_creatorCollectionId_fkey` FOREIGN KEY (`creatorCollectionId`) REFERENCES `ItemsCollection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_traderCollectionId_fkey` FOREIGN KEY (`traderCollectionId`) REFERENCES `ItemsCollection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_tradeWalletId_fkey` FOREIGN KEY (`tradeWalletId`) REFERENCES `TradeWallet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradePayment` ADD CONSTRAINT `TradePayment_id_fkey` FOREIGN KEY (`id`) REFERENCES `Trade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NftItem` ADD CONSTRAINT `NftItem_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `ItemsCollection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TokenItem` ADD CONSTRAINT `TokenItem_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `ItemsCollection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileInput` ADD CONSTRAINT `FileInput_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileItem` ADD CONSTRAINT `FileItem_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `FileInput`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileItem` ADD CONSTRAINT `FileItem_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `ItemsCollection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
