import prisma from '@/config/db';
import { NotFoundError, BadRequestError } from '@/utils/apiErrors';

export class InnovativeService {
  
  // 1. Seller Verification Flow
  public static async requestVerification(userId: string, data: { aadharNumber?: string; gstNumber?: string; businessCertUrl?: string }) {
    // Check if verification request already exists
    const existing = await prisma.sellerVerification.findUnique({
      where: { userId },
    });

    if (existing) {
      return prisma.sellerVerification.update({
        where: { userId },
        data: {
          aadharNumber: data.aadharNumber || existing.aadharNumber,
          gstNumber: data.gstNumber || existing.gstNumber,
          businessCertUrl: data.businessCertUrl || existing.businessCertUrl,
          status: 'PENDING',
        },
      });
    }

    return prisma.sellerVerification.create({
      data: {
        userId,
        aadharNumber: data.aadharNumber,
        gstNumber: data.gstNumber,
        businessCertUrl: data.businessCertUrl,
        status: 'PENDING',
      },
    });
  }

  public static async getVerificationStatus(userId: string) {
    return prisma.sellerVerification.findUnique({
      where: { userId },
    });
  }

  public static async adminApproveVerification(userId: string, status: 'APPROVED' | 'REJECTED') {
    const verification = await prisma.sellerVerification.update({
      where: { userId },
      data: { status },
    });

    if (status === 'APPROVED') {
      // Update User profile and product listings to "Verified"
      await prisma.user.update({
        where: { id: userId },
        data: { trustScore: 98.0 }, // boost trust score
      });

      await prisma.product.updateMany({
        where: { sellerId: userId },
        data: { sellerVerification: 'Elite' },
      });
    }

    return verification;
  }

  // 2. Crop Quality Grading System
  public static async gradeCrop(productId: string, data: { grade: string; labReportUrl?: string; certificateUrl?: string; imagesUrl?: string }) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('Product not found.');

    // Update product grade as well
    await prisma.product.update({
      where: { id: productId },
      data: { grade: data.grade },
    });

    return prisma.qualityGrading.upsert({
      where: { productId },
      update: {
        grade: data.grade,
        labReportUrl: data.labReportUrl,
        certificateUrl: data.certificateUrl,
        imagesUrl: data.imagesUrl,
      },
      create: {
        productId,
        grade: data.grade,
        labReportUrl: data.labReportUrl,
        certificateUrl: data.certificateUrl,
        imagesUrl: data.imagesUrl,
      },
    });
  }

  public static async getCropGrading(productId: string) {
    return prisma.qualityGrading.findUnique({
      where: { productId },
    });
  }

  // 3. Warehouse Storage Space
  public static async listWarehouseSpace(ownerId: string, data: { name: string; location: string; capacityTons: number; ratePerTonDay: number; description?: string }) {
    return prisma.warehouseSpace.create({
      data: {
        ownerId,
        name: data.name,
        location: data.location,
        capacityTons: data.capacityTons,
        availableTons: data.capacityTons,
        ratePerTonDay: data.ratePerTonDay,
        description: data.description,
      },
    });
  }

  public static async getWarehouseSpaces() {
    return prisma.warehouseSpace.findMany({
      where: { status: 'ACTIVE' },
    });
  }

  public static async bookWarehouse(farmerId: string, data: { warehouseId: string; quantityTons: number; startDate: Date; endDate: Date }) {
    const warehouse = await prisma.warehouseSpace.findUnique({ where: { id: data.warehouseId } });
    if (!warehouse) throw new NotFoundError('Warehouse not found.');
    if (warehouse.availableTons < data.quantityTons) {
      throw new BadRequestError('Requested storage capacity exceeds available warehouse capacity.');
    }

    const durationDays = Math.max(1, Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)));
    const totalCost = data.quantityTons * warehouse.ratePerTonDay * durationDays;

    // Create booking
    const booking = await prisma.warehouseBooking.create({
      data: {
        warehouseId: data.warehouseId,
        farmerId,
        quantityTons: data.quantityTons,
        startDate: data.startDate,
        endDate: data.endDate,
        totalCost,
      },
    });

    // Update available capacity
    await prisma.warehouseSpace.update({
      where: { id: data.warehouseId },
      data: {
        availableTons: { decrement: data.quantityTons },
      },
    });

    return booking;
  }

  public static async getWarehouseBookings(userId: string) {
    return prisma.warehouseBooking.findMany({
      where: { farmerId: userId },
      include: { warehouse: true },
    });
  }

  // 4. Logistics Marketplace
  public static async registerCarrier(data: { driverName: string; driverPhone: string; vehicleNumber: string; vehicleType: string; capacityTons: number; ratePerKm: number; activeRoute?: string }) {
    return prisma.transportCarrier.create({
      data,
    });
  }

  public static async getCarriers() {
    return prisma.transportCarrier.findMany({
      where: { currentStatus: 'AVAILABLE' },
    });
  }

  public static async bookTransport(userId: string, data: { carrierId: string; fromLocation: string; toLocation: string; estimatedKm: number }) {
    const carrier = await prisma.transportCarrier.findUnique({ where: { id: data.carrierId } });
    if (!carrier) throw new NotFoundError('Carrier not found.');

    const totalCost = data.estimatedKm * carrier.ratePerKm;

    const booking = await prisma.transportBooking.create({
      data: {
        carrierId: data.carrierId,
        userId,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        estimatedKm: data.estimatedKm,
        totalCost,
      },
    });

    // Mark carrier as booked
    await prisma.transportCarrier.update({
      where: { id: data.carrierId },
      data: { currentStatus: 'BOOKED' },
    });

    return booking;
  }

  public static async getTransportBookings(userId: string) {
    return prisma.transportBooking.findMany({
      where: { userId },
      include: { carrier: true },
    });
  }

  // 5. Demand Forecast Dashboard
  public static async seedDemandForecasts() {
    const counts = await prisma.demandForecast.count();
    if (counts > 0) return prisma.demandForecast.findMany();

    // Seed mock data
    const mockForecasts = [
      { cropType: 'Wheat', demandScore: 92.5, demandLevel: 'HIGH', expectedPriceTrend: 'UP', opportunityDetails: 'Export opportunities in SEA are expanding. Recommend warehousing till November.' },
      { cropType: 'Onions', demandScore: 88.0, demandLevel: 'HIGH', expectedPriceTrend: 'UP', opportunityDetails: 'Local festival demands peak near October. High margins expected.' },
      { cropType: 'Cotton', demandScore: 45.0, demandLevel: 'LOW', expectedPriceTrend: 'DOWN', opportunityDetails: 'Global surplus has driven rates down. Consider shifting yield next season.' },
      { cropType: 'Soybeans', demandScore: 75.0, demandLevel: 'MEDIUM', expectedPriceTrend: 'STABLE', opportunityDetails: 'Steady industrial supply contracts available. Focus on organic Grade A.' },
      { cropType: 'Rice', demandScore: 94.0, demandLevel: 'HIGH', expectedPriceTrend: 'UP', opportunityDetails: 'Premium Basmati shows high demand indicators in Dubai.' },
    ];

    for (const f of mockForecasts) {
      await prisma.demandForecast.create({ data: f });
    }

    return prisma.demandForecast.findMany();
  }

  public static async getDemandForecasts() {
    return prisma.demandForecast.findMany();
  }

  // 6 & 7. Bulk Purchase & Procurement Requests
  public static async postBulkRequirement(buyerId: string, data: { cropType: string; quantityTons: number; budgetPrice: number; deliveryDate: Date }) {
    return prisma.bulkRequirement.create({
      data: {
        buyerId,
        cropType: data.cropType,
        quantityTons: data.quantityTons,
        budgetPrice: data.budgetPrice,
        deliveryDate: data.deliveryDate,
      },
    });
  }

  public static async getBulkRequirements() {
    return prisma.bulkRequirement.findMany({
      where: { status: 'OPEN' },
      include: { quotations: true },
    });
  }

  public static async submitFarmerQuotation(farmerId: string, data: { requirementId: string; offeredPrice: number; quantityTons: number; notes?: string }) {
    return prisma.farmerQuotation.create({
      data: {
        requirementId: data.requirementId,
        farmerId,
        offeredPrice: data.offeredPrice,
        quantityTons: data.quantityTons,
        notes: data.notes,
      },
    });
  }

  public static async getQuotationsForRequirement(requirementId: string) {
    return prisma.farmerQuotation.findMany({
      where: { requirementId },
    });
  }

  // 8. Trade Financing Module
  public static async applyForFinancing(userId: string, data: { type: string; amount: number; collateralDetails?: string; documentsUrl?: string }) {
    return prisma.tradeFinanceApplication.create({
      data: {
        userId,
        type: data.type,
        amount: data.amount,
        collateralDetails: data.collateralDetails,
        documentsUrl: data.documentsUrl,
      },
    });
  }

  public static async getFinanceApplications(userId: string) {
    return prisma.tradeFinanceApplication.findMany({
      where: { userId },
    });
  }

  // 9. Commission-Free Direct Contacts
  public static async getDirectContact(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundError('Product listing not found.');

    return {
      fullName: product.seller.profile?.fullName || 'Verified Farmer',
      phone: product.seller.profile?.phone || 'Not Shared',
      email: product.seller.email,
      address: product.seller.profile?.address || 'India',
    };
  }

  // 10. Crop Inventory & Revenue Analytics
  public static async getFarmerInventoryAnalytics(farmerId: string) {
    const products = await prisma.product.findMany({
      where: { sellerId: farmerId },
    });

    const orders = await prisma.order.findMany({
      where: {
        sellerId: farmerId,
        status: 'COMPLETED',
      },
    });

    const totalSalesCount = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalAvailableStock = products.reduce((sum, p) => sum + p.stock, 0);

    return {
      listingsCount: products.length,
      totalAvailableStock,
      totalSalesCount,
      totalRevenue,
      inventory: products.map((p) => ({
        id: p.id,
        title: p.title,
        cropType: p.cropType,
        stock: p.stock,
        unit: p.unit,
        price: p.price,
        grade: p.grade,
        status: p.status,
      })),
    };
  }
}
