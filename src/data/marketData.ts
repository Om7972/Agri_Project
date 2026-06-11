export interface MarketRate {
  id: string;
  crop: string;
  priceIndia: number; // in INR/quintal
  priceDubai: number; // in AED/metric ton
  changeIndia: number; // percentage
  changeDubai: number; // percentage
  sparkline: { time: string; value: number }[];
  locationIndia: string;
  locationDubai: string;
  unitIndia: string;
  unitDubai: string;
}

export interface FeaturedProduct {
  id: string;
  crop: string;
  category: 'grain' | 'cotton' | 'fruit' | 'vegetable' | 'pulse';
  titleIndia: string;
  titleDubai: string;
  image: string;
  rating: number;
  sellerName: string;
  sellerVerification: 'Premium' | 'Verified' | 'Elite';
  priceIndia: number;
  priceDubai: number;
  unitIndia: string;
  unitDubai: string;
  stockIndia: string;
  stockDubai: string;
  grade: string;
}

export interface DashboardMetric {
  title: string;
  indiaValue: string;
  dubaiValue: string;
  change: string;
  changeType: 'up' | 'down';
}

export const marketRatesData: MarketRate[] = [
  {
    id: 'wheat',
    crop: 'Premium Sharbati Wheat',
    priceIndia: 2750,
    priceDubai: 1450,
    changeIndia: 2.4,
    changeDubai: 1.8,
    sparkline: [
      { time: 'Mon', value: 2680 },
      { time: 'Tue', value: 2700 },
      { time: 'Wed', value: 2720 },
      { time: 'Thu', value: 2710 },
      { time: 'Fri', value: 2740 },
      { time: 'Sat', value: 2750 },
    ],
    locationIndia: 'Madhya Pradesh Mandi',
    locationDubai: 'Jebel Ali Import Hub',
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
  },
  {
    id: 'rice',
    crop: '1121 Basmati Rice (XXL)',
    priceIndia: 9500,
    priceDubai: 4800,
    changeIndia: 3.8,
    changeDubai: 4.2,
    sparkline: [
      { time: 'Mon', value: 9100 },
      { time: 'Tue', value: 9200 },
      { time: 'Wed', value: 9400 },
      { time: 'Thu', value: 9350 },
      { time: 'Fri', value: 9450 },
      { time: 'Sat', value: 9500 },
    ],
    locationIndia: 'Karnal Market, Haryana',
    locationDubai: 'Al Awir Wholesale, Dubai',
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
  },
  {
    id: 'cotton',
    crop: 'Long Staple Shankar-6 Cotton',
    priceIndia: 6200,
    priceDubai: 2900,
    changeIndia: -1.2,
    changeDubai: -0.8,
    sparkline: [
      { time: 'Mon', value: 6300 },
      { time: 'Tue', value: 6280 },
      { time: 'Wed', value: 6250 },
      { time: 'Thu', value: 6220 },
      { time: 'Fri', value: 6180 },
      { time: 'Sat', value: 6200 },
    ],
    locationIndia: 'Rajkot Mandi, Gujarat',
    locationDubai: 'Dubai Textile & Commodity Centre',
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
  },
  {
    id: 'sugarcane',
    crop: 'High-Yield Raw Sugarcane',
    priceIndia: 350,
    priceDubai: 180,
    changeIndia: 0.9,
    changeDubai: 1.1,
    sparkline: [
      { time: 'Mon', value: 345 },
      { time: 'Tue', value: 347 },
      { time: 'Wed', value: 348 },
      { time: 'Thu', value: 349 },
      { time: 'Fri', value: 350 },
      { time: 'Sat', value: 350 },
    ],
    locationIndia: 'Meerut Mandi, Uttar Pradesh',
    locationDubai: 'Al Khaleej Sugar Refinery',
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
  },
  {
    id: 'maize',
    crop: 'Yellow Feed-Grade Maize',
    priceIndia: 2200,
    priceDubai: 980,
    changeIndia: 1.5,
    changeDubai: 2.1,
    sparkline: [
      { time: 'Mon', value: 2150 },
      { time: 'Tue', value: 2160 },
      { time: 'Wed', value: 2180 },
      { time: 'Thu', value: 2170 },
      { time: 'Fri', value: 2195 },
      { time: 'Sat', value: 2200 },
    ],
    locationIndia: 'Davangere Mandi, Karnataka',
    locationDubai: 'Jebel Ali Agri Terminal',
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
  },
  {
    id: 'soybean',
    crop: 'Yellow Oilseed Soybean',
    priceIndia: 4850,
    priceDubai: 2250,
    changeIndia: -0.5,
    changeDubai: 0.3,
    sparkline: [
      { time: 'Mon', value: 4900 },
      { time: 'Tue', value: 4880 },
      { time: 'Wed', value: 4850 },
      { time: 'Thu', value: 4820 },
      { time: 'Fri', value: 4840 },
      { time: 'Sat', value: 4850 },
    ],
    locationIndia: 'Indore Mandi, Madhya Pradesh',
    locationDubai: 'Dubai Multi Commodities Centre',
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
  },
];

export const featuredProductsData: FeaturedProduct[] = [
  {
    id: 'prod-wheat',
    crop: 'Wheat',
    category: 'grain',
    titleIndia: 'Organic Sharbati Premium Wheat',
    titleDubai: 'Imported Indian Sharbati Wheat (Grade A)',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600',
    rating: 4.9,
    sellerName: 'Bharat Farms Co-op',
    sellerVerification: 'Elite',
    priceIndia: 2900,
    priceDubai: 1550,
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
    stockIndia: '450 Quintals available',
    stockDubai: '120 Metric Tons available',
    grade: 'A++ Organic certified',
  },
  {
    id: 'prod-rice',
    crop: 'Rice',
    category: 'grain',
    titleIndia: 'Traditional Aged Basmati Rice 1121',
    titleDubai: 'Premium Royal Basmati Rice (Aged)',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600',
    rating: 4.8,
    sellerName: 'Karnal Agro Exporters',
    sellerVerification: 'Elite',
    priceIndia: 9800,
    priceDubai: 4950,
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
    stockIndia: '800 Quintals available',
    stockDubai: '250 Metric Tons available',
    grade: 'Super Extra Long Grain',
  },
  {
    id: 'prod-cotton',
    crop: 'Cotton',
    category: 'cotton',
    titleIndia: 'Organic Shankar-6 Raw Cotton Bales',
    titleDubai: 'Premium Long-Staple Shankar-6 Cotton',
    image: 'https://images.unsplash.com/photo-1594900010996-ef3cf7c4bd3f?q=80&w=600',
    rating: 4.7,
    sellerName: 'Gujarat Cotton Growers Union',
    sellerVerification: 'Verified',
    priceIndia: 6400,
    priceDubai: 3100,
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
    stockIndia: '1,200 Bales available',
    stockDubai: '450 Tons available',
    grade: 'Strict Low Middling (SLM)',
  },
  {
    id: 'prod-fruits',
    crop: 'Fruits',
    category: 'fruit',
    titleIndia: 'Devgad Alphonso Mangoes (Export Grade)',
    titleDubai: 'Premium Khalas Organic Dates (Fresh Crop)',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600', // Mangoes
    rating: 5.0,
    sellerName: 'Konkan Horticulture Group / Al Medina Dates',
    sellerVerification: 'Premium',
    priceIndia: 1500, // Per Dozen (INR)
    priceDubai: 85, // Per Box 5kg (AED)
    unitIndia: 'Dozen',
    unitDubai: '5kg Box',
    stockIndia: '200 Dozens available',
    stockDubai: '1,500 Boxes available',
    grade: 'Premium Sweet Export Quality',
  },
  {
    id: 'prod-vegetables',
    crop: 'Vegetables',
    category: 'vegetable',
    titleIndia: 'Nashik Red Onions (Size 55mm+)',
    titleDubai: 'Hydroponic Greenhouse Bell Peppers Mix',
    image: 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?q=80&w=600', // Peppers / Veggies
    rating: 4.6,
    sellerName: 'MahaVeg Co-operative / Gulf Hydro Farms',
    sellerVerification: 'Verified',
    priceIndia: 2400,
    priceDubai: 12, // Per kg (AED)
    unitIndia: 'Quintal',
    unitDubai: 'kg',
    stockIndia: '2,500 Quintals available',
    stockDubai: '3,000 kg available',
    grade: 'A-Grade Fresh Picked',
  },
  {
    id: 'prod-pulses',
    crop: 'Pulses',
    category: 'pulse',
    titleIndia: 'Organic Unpolished Chana Dal (Desi)',
    titleDubai: 'Imported Red Lentils (Premium Sortex)',
    image: 'https://images.unsplash.com/photo-1547058881-aa0edd92aab3?q=80&w=600', // Pulses
    rating: 4.8,
    sellerName: 'Rajasthan Pulse Processing',
    sellerVerification: 'Premium',
    priceIndia: 8200,
    priceDubai: 3600,
    unitIndia: 'Quintal',
    unitDubai: 'Metric Ton',
    stockIndia: '600 Quintals available',
    stockDubai: '180 Tons available',
    grade: 'Grade-A Sortex Cleaned',
  },
];

export const heroMetrics: DashboardMetric[] = [
  {
    title: 'Daily Volume',
    indiaValue: '₹84.2 Crore',
    dubaiValue: 'AED 37.1 Million',
    change: '+14.2%',
    changeType: 'up',
  },
  {
    title: 'Active Traders',
    indiaValue: '142,500+',
    dubaiValue: '18,200+',
    change: '+8.7%',
    changeType: 'up',
  },
  {
    title: 'Market Growth',
    indiaValue: '28.4% YoY',
    dubaiValue: '34.1% YoY',
    change: '+4.3%',
    changeType: 'up',
  },
  {
    title: 'Live Transactions',
    indiaValue: '3,842 /hr',
    dubaiValue: '412 /hr',
    change: '+22.5%',
    changeType: 'up',
  },
];

export const testimonialsData = [
  {
    id: 'test-1',
    name: 'Baldev Singh',
    role: 'Progressive Farmer (150+ Acres)',
    company: 'Sukhmani Farms, Punjab',
    location: 'Punjab, India',
    quote: 'MandiPrime has completely eliminated middlemen commission. I get transparent prices and instant payouts in my bank account. The location switch lets me check if export to Dubai is more profitable.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Tariq Al-Mansoor',
    role: 'Managing Director & Importer',
    company: 'Gulf Oasis General Trading LLC',
    location: 'Dubai, UAE',
    quote: 'Importing grains from India used to involve complex brokerage chains and zero quality guarantee. With MandiPrime Dubai, we buy direct from vetted cooperatives with complete logistics tracking and escrow protection.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Radhika Sharma',
    role: 'Chief Procurement Officer',
    company: 'Pinnacle Foods Exporters Ltd.',
    location: 'Mumbai, India',
    quote: 'The live charts and dynamic dashboard help us secure bulk contracts at the best prices. The system is as clean and reliable as a modern Bloomberg terminal but custom-built for agricultural commodities.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    rating: 5,
  },
];
