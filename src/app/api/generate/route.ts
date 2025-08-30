import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../../config';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    const { productName, userImageBase64 } = await request.json();
    
    if (!productName || !userImageBase64) {
      return NextResponse.json(
        { error: 'Product name and user image are required' },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBbf1j8tO10dxKh4iwg5ueYqm4uyUwJUK0');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    // Create prompt for virtual try-on
    const prompt = `
      Create a realistic image showing a person wearing the ${productName}.
      
      CRITICAL REQUIREMENTS:
      - Use the person's photo as the base
      - Dress them in the ${productName} naturally
      - Keep their face, hair, body shape, and background exactly the same
      - Only change the clothing to match the product
      - Make it look like they're actually wearing the garment
      - Maintain identical lighting, shadows, pose, and background
      
      The result should look like a real photo of the person wearing the ${productName}.
    `;

    // Call Gemini API
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: userImageBase64.split(',')[1], // Remove data:image/jpeg;base64, prefix
                mimeType: 'image/jpeg'
              }
            }
          ]
        }
      ]
    });

    const response = await result.response;
    
    // Extract generated image
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const content = response.candidates[0].content;
      if (content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return NextResponse.json({
              success: true,
              data: {
                generatedImage: `data:image/jpeg;base64,${part.inlineData.data}`
              }
            });
          }
        }
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
