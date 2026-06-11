import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { UploadService } from '@/services/upload.service';
import { sendResponse } from '@/utils/responseHandlers';
import { BadRequestError } from '@/utils/apiErrors';

export class ProductController {
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      let imageUrl = req.body.imageUrl;

      if (req.file) {
        imageUrl = await UploadService.uploadImage(req.file.buffer, 'products');
      }

      const product = await ProductService.createProduct(sellerId, {
        ...req.body,
        imageUrl,
      });

      return sendResponse(res, 201, 'Product listing created successfully.', product);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      let updateData = { ...req.body };

      if (req.file) {
        updateData.imageUrl = await UploadService.uploadImage(req.file.buffer, 'products');
      }

      const product = await ProductService.updateProduct(id, userId, userRole, updateData);
      return sendResponse(res, 200, 'Product listing updated successfully.', product);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return sendResponse(res, 200, 'Product retrieved successfully.', product);
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      await ProductService.deleteProduct(id, userId, userRole);
      return sendResponse(res, 200, 'Product listing deleted successfully.', null);
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search,
        categoryId,
        cropType,
        grade,
        verification,
        minPrice,
        maxPrice,
        sortBy,
        order,
        page,
        limit,
      } = req.query;

      const filters = {
        search: search as string,
        categoryId: categoryId as string,
        cropType: cropType as string,
        grade: grade as string,
        verification: verification as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      };

      const result = await ProductService.listProducts(filters);
      return sendResponse(res, 200, 'Products retrieved successfully.', result.products, result.meta);
    } catch (error) {
      next(error);
    }
  }
}
