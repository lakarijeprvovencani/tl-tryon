import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const testProducts = [
    {
      id: 'test-1',
      name: 'Black Plush Tracksuit',
      price: 25000,
      originalPrice: null,
      image: '/products/black-plush-tracksuit.jpg',
      category: 'Sportska odeća',
      description: 'Udoban plush tracksuit set za svakodnevno nošenje',
      inStock: true,
      isOnSale: false
    }
  ];

  return NextResponse.json({
    data: testProducts,
    success: true
  });
}
