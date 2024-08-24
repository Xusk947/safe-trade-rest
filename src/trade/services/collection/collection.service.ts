import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';
import { Items } from 'src/trade/utils/types';

@Injectable()
export class CollectionService {
    private logger = new Logger(CollectionService.name)

    constructor (
        private readonly prisma: PrismaService
    ) {} 

    
    public async addItemsToCollection(items: Items, collectionId: number) {
        if (items.FileItem) {
            await this.prisma.fileItem.createMany({
                data: items.FileItem.map((item) => {
                    return {
                        fileId: Number(item.fileId),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.TokenItem) {
            await this.prisma.tokenItem.createMany({
                data: items.TokenItem.map((item) => {
                    console.log(item.image)
                    console.log(item.image.length)
                    return {
                        ...item,
                        amount: Number(item.amount),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.NftItem) {
            await this.prisma.nftItem.createMany({
                data: items.NftItem.map((item) => {
                    return {
                        ...item,
                        collectionId: collectionId
                    }
                })
            })
        }
    }

    public async createCollection(items: Items, lastCollectionId?: number) {
        let collectionId = lastCollectionId

        if (!collectionId) {
            const collection = await this.prisma.itemsCollection.create({})
            collectionId = collection.id
        } else {
            const collection = await this.prisma.itemsCollection.findUnique({
                where: {
                    id: collectionId
                },
                include: {
                    FileItem: true,
                    NftItem: true,
                    TokenItem: true
                }
            })
            // Delete old items
            if (collection) {
                if (collection.FileItem) {
                    await this.prisma.fileItem.deleteMany({
                        where: {
                            collectionId
                        }
                    })
                }

                if (collection.NftItem) {
                    await this.prisma.nftItem.deleteMany({
                        where: {
                            collectionId
                        }
                    })
                }

                if (collection.TokenItem) {
                    await this.prisma.tokenItem.deleteMany({
                        where: {
                            collectionId
                        }
                    })
                }
            }
        }

        // Create Items 
        if (items.FileItem) {
            await this.prisma.fileItem.createMany({
                data: items.FileItem.map((item) => {
                    return {
                        fileId: Number(item.fileId),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.TokenItem) {
            await this.prisma.tokenItem.createMany({
                data: items.TokenItem.map((item) => {
                    return {
                        ...item,
                        image: item.image.length > 512 ? "" : item.image,
                        amount: Number(item.amount),
                        collectionId: collectionId
                    }
                })
            })
        }

        if (items.NftItem) {
            await this.prisma.nftItem.createMany({
                data: items.NftItem.map((item) => {
                    return {
                        ...item,
                        collectionId: collectionId
                    }
                })
            })
        }

        return collectionId
    }
}
