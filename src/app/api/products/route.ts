import { NextResponse } from 'next/server';

// Mock products inspired by Tia Lorens real products from tialorens.rs
const mockProducts = [
  {
    id: 'prod_001',
    name: 'Tia Lorens Black Plush Tracksuit',
    price: 8590,
    originalPrice: 9500,
    image: '/products/black-plush-tracksuit.jpg', // <-- Updated image path
    category: 'Plišane trenerke',
    description: 'Dodaj eleganciju i udobnost svom stilu uz Tia Lorens Black Plush trenerku.',
    inStock: true,
    isOnSale: true
  },
  {
    id: 'prod_002', 
    name: 'Elegant Summer Dress',
    price: 7200,
    originalPrice: null,
    image: '/placeholder.jpg',
    category: 'Ženski kompleti',
    description: 'Savršena haljina za letnje dane i posebne prilike.',
    inStock: true,
    isOnSale: false
  },
  {
    id: 'prod_003',
    name: 'Premium Yoga Set',
    price: 6800,
    originalPrice: 8000,
    image: '/placeholder.jpg',
    category: 'Ženske helanke',
    description: 'Visokokvalitetni set za jogu i fitnes aktivnosti.',
    inStock: false,
    isOnSale: true
  }
];

export async function GET() {
  // In a real app, this would fetch from a database or Shopify API
  return NextResponse.json({ data: mockProducts });
}
