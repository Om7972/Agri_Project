import prisma from '@/config/db';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/apiErrors';
import { z } from 'zod';
import { createProductSchema } from '@/validators/products';
import { ProductStatus } from '@prisma/client';

type CreateProductInput = z.infer<typeof createProductSchema>;

export class ProductService {
  public static async createProduct(sellerId: string, input: CreateProductInput) {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new NotFoundError('Category not found.');
    }

    return prisma.product.create({
      data: {
        sellerId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        price: input.price,
        unit: input.unit,
        stock: input.stock,
        cropType: input.cropType,
        grade: input.grade,
        imageUrl: input.imageUrl,
        sellerVerification: input.sellerVerification || 'Standard',
        status: ProductStatus.ACTIVE,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                companyName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  public static async updateProduct(
    productId: string,
    userId: string,
    userRole: string,
    input: Partial<CreateProductInput>
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    // Authorization: Only owner (seller) or Admin can update
    if (product.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You are not authorized to update this product listing.');
    }

    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new NotFoundError('Category not found.');
      }
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        ...input,
      },
      include: {
        category: true,
      },
    });
  }

  public static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    return product;
  }

  public static async deleteProduct(productId: string, userId: string, userRole: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    if (product.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You are not authorized to delete this product listing.');
    }

    // Soft delete by archiving
    return prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  public static async listProducts(filters: {
    search?: string;
    categoryId?: string;
    cropType?: string;
    grade?: string;
    verification?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: ProductStatus.ACTIVE,
    };

    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { cropType: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.cropType) {
      whereClause.cropType = { equals: filters.cropType, mode: 'insensitive' };
    }

    if (filters.grade) {
      whereClause.grade = { equals: filters.grade, mode: 'insensitive' };
    }

    if (filters.verification) {
      whereClause.sellerVerification = filters.verification;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereClause.price = {};
      if (filters.minPrice !== undefined) {
        whereClause.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        whereClause.price.lte = filters.maxPrice;
      }
    }

    // Sorting
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.order || 'desc';
    const orderBy = { [sortField]: sortOrder };

    const [products, totalItems] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  companyName: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      products,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
