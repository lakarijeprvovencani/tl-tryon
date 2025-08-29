import { NextResponse } from 'next/server';

// Shopify Store Configuration
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'tialorens.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

export async function GET() {
  try {
    if (!SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json({ 
        error: 'Shopify access token not configured' 
      }, { status: 500 });
    }

    // Fetch products from Shopify Admin API
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Shopify products to our format
    const products = data.products.map((product: any) => ({
      id: product.id,
      name: product.title,
      price: product.variants[0]?.price ? `$${product.variants[0].price}` : 'Price not available',
      image: product.images[0]?.src || '/placeholder.jpg',
      description: product.body_html || '',
      handle: product.handle,
      shopifyUrl: `https://${SHOPIFY_STORE_DOMAIN.replace('.myshopify.com', '')}.com/products/${product.handle}`
    }));

    return NextResponse.json({ 
      products,
      count: products.length,
      source: 'shopify'
    });

  } catch (error) {
    console.error('Shopify API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Failed to fetch Shopify products',
      details: errorMessage 
    }, { status: 500 });
  }
}
