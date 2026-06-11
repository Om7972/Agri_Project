import { Request, Response, NextFunction } from 'express';
import prisma from '@/config/db';
import { sendResponse } from '@/utils/responseHandlers';
import { NotFoundError } from '@/utils/apiErrors';

export class MarketController {
  public static async listRates(req: Request, res: Response, next: NextFunction) {
    try {
      const rates = await prisma.marketRate.findMany();
      return sendResponse(res, 200, 'Market rates retrieved successfully.', rates);
    } catch (error) {
      next(error);
    }
  }

  public static async seedRates(req: Request, res: Response, next: NextFunction) {
    try {
      // Mock / Default commodity seed data
      const initialRates = [
        {
          crop: 'Wheat',
          priceIndia: 2450,
          priceDubai: 1350,
          changeIndia: 1.25,
          changeDubai: 0.85,
          unitIndia: 'Quintal',
          unitDubai: 'Ton',
          locationIndia: 'Punjab Board',
          locationDubai: 'Dubai Multi Commodities Centre (DMCC)',
          sparkline: [
            { value: 2400 },
            { value: 2420 },
            { value: 2410 },
            { value: 2430 },
            { value: 2425 },
            { value: 2450 },
          ],
        },
        {
          crop: 'Rice',
          priceIndia: 3600,
          priceDubai: 1950,
          changeIndia: 2.1,
          changeDubai: -1.05,
          unitIndia: 'Quintal',
          unitDubai: 'Ton',
          locationIndia: 'Haryana Mandi',
          locationDubai: 'Jebel Ali Port Terminal',
          sparkline: [
            { value: 3500 },
            { value: 3550 },
            { value: 3580 },
            { value: 3620 },
            { value: 3590 },
            { value: 3600 },
          ],
        },
        {
          crop: 'Cotton',
          priceIndia: 6800,
          priceDubai: 3200,
          changeIndia: -0.45,
          changeDubai: 1.5,
          unitIndia: 'Bale',
          unitDubai: 'Bale',
          locationIndia: 'Gujarat Trade Assoc',
          locationDubai: 'Al Awir Trade Complex',
          sparkline: [
            { value: 6900 },
            { value: 6850 },
            { value: 6820 },
            { value: 6840 },
            { value: 6810 },
            { value: 6800 },
          ],
        },
      ];

      for (const rate of initialRates) {
        await prisma.marketRate.upsert({
          where: { crop: rate.crop },
          update: rate,
          create: rate,
        });
      }

      return sendResponse(res, 201, 'Market rates seeded successfully.', null);
    } catch (error) {
      next(error);
    }
  }
}
