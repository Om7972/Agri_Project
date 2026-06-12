import { PrismaClient, Role, SubscriptionTier, SubscriptionStatus, DocumentType, DocumentStatus, ShipmentStatus, LogisticsStatus, PaymentGateway, TransactionStatus, ProductStatus, AuctionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.auditLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.exportDocument.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.logisticsBooking.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.auction.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.marketRate.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users and Profiles...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@mandiprime.com',
      passwordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          fullName: 'MandiPrime Administrator',
          phone: '+919999999999',
          companyName: 'MandiPrime HQ',
          address: 'Block A, Connaught Place',
          city: 'New Delhi',
          country: 'India',
        },
      },
    },
  });

  // 2. Farmer
  const farmer = await prisma.user.create({
    data: {
      email: 'farmer@mandiprime.com',
      passwordHash,
      role: Role.FARMER,
      profile: {
        create: {
          fullName: 'Rajesh Kumar',
          phone: '+919876543210',
          companyName: 'Kumar Organic Farms',
          address: '12, Village Kalan',
          city: 'Amritsar',
          country: 'India',
        },
      },
    },
  });

  // 3. Buyer
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@mandiprime.com',
      passwordHash,
      role: Role.BUYER,
      profile: {
        create: {
          fullName: 'Amit Patel',
          phone: '+919123456789',
          companyName: 'Patel Agro Trading',
          address: '45 Market Yard',
          city: 'Ahmedabad',
          country: 'India',
        },
      },
    },
  });

  // 4. Exporter
  const exporter = await prisma.user.create({
    data: {
      email: 'exporter@mandiprime.com',
      passwordHash,
      role: Role.EXPORTER,
      profile: {
        create: {
          fullName: 'Zayed Al-Maktoum',
          phone: '+971501234567',
          companyName: 'Gulf Coast Distributors',
          address: 'Sheikh Zayed Road',
          city: 'Dubai',
          country: 'Dubai',
        },
      },
    },
  });

  console.log('Seeding Categories...');
  const grains = await prisma.category.create({
    data: { name: 'Grains & Cereals', slug: 'grains-cereals', description: 'Wheat, Rice, Barley, Maize' },
  });
  const fruits = await prisma.category.create({
    data: { name: 'Fresh Fruits', slug: 'fresh-fruits', description: 'Apples, Mangoes, Grapes, Bananas' },
  });
  const spices = await prisma.category.create({
    data: { name: 'Spices & Condiments', slug: 'spices-condiments', description: 'Cardamom, Turmeric, Cumin, Pepper' },
  });

  console.log('Seeding Products...');
  const p1 = await prisma.product.create({
    data: {
      sellerId: farmer.id,
      categoryId: grains.id,
      title: 'Premium Basmati Rice (Pusa 1121)',
      description: 'Extra long grain organic Basmati rice, moisture content below 12%. Harvested from the fields of Punjab.',
      price: 85,
      unit: 'kg',
      stock: 5000,
      cropType: 'Basmati Rice',
      grade: 'Grade A',
      sellerVerification: 'Premium Verified',
      status: ProductStatus.ACTIVE,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      sellerId: farmer.id,
      categoryId: spices.id,
      title: 'Organic Green Cardamom (8mm Bold)',
      description: 'High grade green cardamom pods from Idukki, Kerala. Intensive aroma and brilliant green colour.',
      price: 1800,
      unit: 'kg',
      stock: 450,
      cropType: 'Cardamom',
      grade: 'Grade A+',
      sellerVerification: 'Gold Verified',
      status: ProductStatus.ACTIVE,
    },
  });

  console.log('Seeding Live Market Rates...');
  await prisma.marketRate.createMany({
    data: [
      {
        crop: 'Basmati Rice',
        priceIndia: 85,
        priceDubai: 120,
        changeIndia: 1.2,
        changeDubai: 1.8,
        unitIndia: 'INR/kg',
        unitDubai: 'AED/kg',
        locationIndia: 'Punjab Mandi',
        locationDubai: 'Al Aweer Market',
        sparkline: JSON.stringify([82, 83.5, 84, 83.2, 84.5, 85]),
      },
      {
        crop: 'Cardamom',
        priceIndia: 1800,
        priceDubai: 2400,
        changeIndia: -0.5,
        changeDubai: -0.2,
        unitIndia: 'INR/kg',
        unitDubai: 'AED/kg',
        locationIndia: 'Kochi Spices Exchange',
        locationDubai: 'Deira Souk',
        sparkline: JSON.stringify([1820, 1810, 1805, 1795, 1800, 1800]),
      },
      {
        crop: 'Alphonso Mango',
        priceIndia: 120,
        priceDubai: 190,
        changeIndia: 4.8,
        changeDubai: 5.2,
        unitIndia: 'INR/kg',
        unitDubai: 'AED/kg',
        locationIndia: 'Ratnagiri Mandi',
        locationDubai: 'Dubai Fruit Market',
        sparkline: JSON.stringify([110, 112, 115, 116, 118, 120]),
      },
    ],
  });

  console.log('Seeding Subscriptions...');
  const sub = await prisma.subscription.create({
    data: {
      userId: exporter.id,
      tier: SubscriptionTier.PROFESSIONAL,
      price: 2999,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    },
  });

  console.log('Seeding Auctions...');
  const auction = await prisma.auction.create({
    data: {
      creatorId: farmer.id,
      title: 'Bulk Export Grade Wheat Auction (50 MT)',
      description: 'Shorter stem high-yield wheat suitable for flour mills. Cleaned and packaged in 50kg bags.',
      cropType: 'Wheat',
      startPrice: 22000, // per Metric Ton
      reservePrice: 24000,
      status: AuctionStatus.ACTIVE,
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
    },
  });

  console.log('Seeding Bids...');
  await prisma.bid.create({
    data: {
      auctionId: auction.id,
      bidderId: exporter.id,
      bidAmount: 23500,
    },
  });

  console.log('Seeding Orders...');
  const order = await prisma.order.create({
    data: {
      buyerId: exporter.id,
      sellerId: farmer.id,
      totalAmount: 425000, // 5000kg * 85 INR
      status: 'ESCROW_FUNDED',
      paymentStatus: 'ESCROWED',
      items: {
        create: {
          productId: p1.id,
          quantity: 5000,
          price: 85,
        },
      },
    },
  });

  console.log('Seeding Logistics & Export Hub Trackers...');
  const shipment = await prisma.shipment.create({
    data: {
      orderId: order.id,
      trackingNumber: 'MP-894721',
      carrier: 'Gulf Ocean Freight Corp',
      origin: 'Kandla Port, India',
      destination: 'Jebel Ali Port, Dubai',
      status: ShipmentStatus.PORT_OF_ORIGIN,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    },
  });

  // Phytosanitary Certificate
  await prisma.exportDocument.create({
    data: {
      shipmentId: shipment.id,
      documentType: DocumentType.PHYTOSANITARY,
      fileUrl: 'https://cloudinary.com/mandiprime/docs/phyto-cert-894721.pdf',
      status: DocumentStatus.APPROVED,
      notes: 'Phytosanitary inspection cleared at Kandla laboratory.',
    },
  });

  // Bill of Lading
  await prisma.exportDocument.create({
    data: {
      shipmentId: shipment.id,
      documentType: DocumentType.BILL_OF_LADING,
      fileUrl: 'https://cloudinary.com/mandiprime/docs/lading-894721.pdf',
      status: DocumentStatus.PENDING,
    },
  });

  // Logistics Driver Assigned to carry goods to Kandla Port
  const driver = await prisma.logisticsBooking.create({
    data: {
      driverName: 'Sukhwinder Singh',
      driverPhone: '+919876543232',
      vehicleNumber: 'PB-02-CD-9876',
      vehicleType: 'Tata Prima 2825.K Tipper',
      status: LogisticsStatus.EN_ROUTE,
      currentLatitude: 28.6139,
      currentLongitude: 77.209,
    },
  });

  // Link shipment to driver logistics booking
  await prisma.shipment.update({
    where: { id: shipment.id },
    data: { logisticsBookingId: driver.id },
  });

  console.log('Seeding Audit Logs...');
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_BOOTSTRAP',
      details: 'Exchange node database tables successfully populated via Prisma seed script.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
