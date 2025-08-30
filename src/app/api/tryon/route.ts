import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBbf1j8tO10dxKh4iwg5ueYqm4uyUwJUK0');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    // Get person and garment images
    const personFile = formData.get('person') as File;
    const garmentFile = formData.get('garment') as File;
    
    // Validate files exist
    if (!personFile || !garmentFile) {
      return NextResponse.json(
        { error: 'Both person and garment images are required' },
        { status: 400 }
      );
    }
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(personFile.type) || !allowedTypes.includes(garmentFile.type)) {
      return NextResponse.json(
        { error: 'Only JPEG and PNG images are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (personFile.size > maxSize || garmentFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Convert files to base64
    const personBuffer = Buffer.from(await personFile.arrayBuffer());
    const garmentBuffer = Buffer.from(await garmentFile.arrayBuffer());
    
    const personBase64 = personBuffer.toString('base64');
    const garmentBase64 = garmentBuffer.toString('base64');
    
    // Create prompt for Gemini - EDIT existing image
    const prompt = `
      Edit the first image (person) by replacing their current clothing with the garment from the second image.
      
      CRITICAL REQUIREMENTS:
      - EDIT the existing person image, do not create a new one
      - Keep the person's face, hair, body shape, and background EXACTLY the same
      - Only change the clothing - replace their current clothes with the garment from image 2
      - Maintain identical lighting, shadows, pose, and background
      - Make the new garment fit naturally on their existing body
      - The result should look like the same photo but with different clothes
      
      DO NOT: Change anything else about the person or image
      DO: Only edit the clothing to match the garment from image 2
    `;
    
    // Call Gemini API with both images
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: personBase64,  // Use base64 string, not Buffer
                mimeType: personFile.type
              }
            },
            {
              inlineData: {
                data: garmentBase64,  // Use base64 string, not Buffer
                mimeType: garmentFile.type
              }
            }
          ]
        }
      ]
      // Remove generationConfig.responseMimeType as it's not supported
    });
    
    const response = await result.response;
    
    // Extract generated image from response
    let generatedImageBuffer: Buffer | null = null;
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const content = response.candidates[0].content;
      if (content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // Convert base64 to buffer
            generatedImageBuffer = Buffer.from(part.inlineData.data, 'base64');
            break;
          }
        }
      }
    }
    
    if (!generatedImageBuffer) {
      console.error('No image generated from Gemini API');
      return NextResponse.json(
        { error: 'Failed to generate image from Gemini API' },
        { status: 500 }
      );
    }
    
    // Return the generated image as PNG
    return new NextResponse(generatedImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error in tryon API:', error);
    
    // Log full error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
