import { Request, Response, NextFunction } from 'express';
import { InnovativeService } from '@/services/innovative.service';
import { sendResponse } from '@/utils/responseHandlers';

export class InnovativeController {
  
  // 1. Seller Verification Flow
  public static async requestVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InnovativeService.requestVerification(userId, req.body);
      return sendResponse(res, 200, 'Verification request submitted successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getVerificationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InnovativeService.getVerificationStatus(userId);
      return sendResponse(res, 200, 'Verification status retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async adminApproveVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { status } = req.body; // APPROVED or REJECTED
      const result = await InnovativeService.adminApproveVerification(userId, status);
      return sendResponse(res, 200, 'Verification status updated successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  // 2. Crop Quality Grading System
  public static async gradeCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const result = await InnovativeService.gradeCrop(productId, req.body);
      return sendResponse(res, 200, 'Quality grading applied successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getCropGrading(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const result = await InnovativeService.getCropGrading(productId);
      return sendResponse(res, 200, 'Quality grading data retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  // 3. Warehouse Marketplace
  public static async listWarehouseSpace(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const result = await InnovativeService.listWarehouseSpace(ownerId, req.body);
      return sendResponse(res, 201, 'Warehouse storage listing created.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getWarehouseSpaces(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InnovativeService.getWarehouseSpaces();
      return sendResponse(res, 200, 'Active warehouse space listings retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async bookWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.id;
      const result = await InnovativeService.bookWarehouse(farmerId, req.body);
      return sendResponse(res, 201, 'Warehouse space booked successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getWarehouseBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InnovativeService.getWarehouseBookings(userId);
      return sendResponse(res, 200, 'Warehouse bookings retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  // 4. Logistics Marketplace
  public static async registerCarrier(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InnovativeService.registerCarrier(req.body);
      return sendResponse(res, 201, 'Carrier registered in Logistics Marketplace.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getCarriers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InnovativeService.getCarriers();
      return sendResponse(res, 200, 'Available logistics carriers retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async bookTransport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InnovativeService.bookTransport(userId, req.body);
      return sendResponse(res, 201, 'Logistics transport booked successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getTransportBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InnovativeService.getTransportBookings(userId);
      return sendResponse(res, 200, 'Logistics transport bookings retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  // 5. Demand Forecast Dashboard
  public static async getDemandForecasts(req: Request, res: Response, next: NextFunction) {
    try {
      // Auto seed if empty
      await InnovativeService.seedDemandForecasts();
      const result = await InnovativeService.getDemandForecasts();
      return sendResponse(res, 200, 'Demand forecasts retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  // 6 & 7. Bulk Purchase & Procurement Requests
  public static async postBulkRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.id;
      const result = await InnovativeService.postBulkRequirement(buyerId, req.body);
      return sendResponse(res, 201, 'Bulk procurement request posted successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getBulkRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InnovativeService.getBulkRequirements();
      return sendResponse(res, 200, 'Active procurement requirements retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async submitFarmerQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.id;
      const result = await InnovativeService.submitFarmerQuotation(farmerId, req.body);
      return sendResponse(res, 201, 'Farmer quotation submitted successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getQuotationsForRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const { requirementId } = req.params;
      const result = await InnovativeService.getQuotationsForRequirement(requirementId);
      return sendResponse(res, 200, 'Quotations retrieved for procurement request.', result);
    } catch (error) {
      next(error);
    }
  }

  // 8. Trade Financing Module
  public static async applyForFinancing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InnovativeService.applyForFinancing(userId, req.body);
      return sendResponse(res, 201, 'Trade financing application submitted.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getFinanceApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InnovativeService.getFinanceApplications(userId);
      return sendResponse(res, 200, 'Trade financing applications retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  // 9. Commission-Free Direct Contacts
  public static async getDirectContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const result = await InnovativeService.getDirectContact(productId);
      return sendResponse(res, 200, 'Direct contact data retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  // 10. Crop Inventory Analytics
  public static async getFarmerInventoryAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.id;
      const result = await InnovativeService.getFarmerInventoryAnalytics(farmerId);
      return sendResponse(res, 200, 'Farmer inventory and sales analytics retrieved.', result);
    } catch (error) {
      next(error);
    }
  }
}
