import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';
import {
  GEMINI_API_KEY,
  GEMINI_MODEL_NAME
} from '@/config';

// Initialize Gemini API Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

export async function GET() {
  try {
    // 1. Load the local test image
    const imagePath = path.join(process.cwd(), 'public', 'test-person.jpg');
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    // 2. Prepare the request parts
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };
    
    const textPrompt = `Create a photorealistic fashion image showing this person wearing a stylish black plush tracksuit from Tia Lorens brand. The tracksuit should fit naturally on their body. Keep the same person but change their clothing to the tracksuit. Clean studio background with professional lighting.`;

    console.log('Sending request to Gemini API...');
    // 3. Call the Gemini API
    const response = await model.generateContent([textPrompt, imagePart]);
    console.log('Received response from Gemini API.');

    const responseText = response.response.text();
    console.log('Response text:', responseText);
    
    // Check if the response contains image data
    const candidates = response.response.candidates;
    const firstCandidate = candidates?.[0];
    const parts = firstCandidate?.content?.parts;
    
    // Look for image data in the response
    let generatedImage = null;
    if (parts) {
      for (const part of parts) {
        if ('inlineData' in part && part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          
          // Save the output for verification
          const outputPath = path.join(process.cwd(), 'public', 'test-output.png');
          await fs.writeFile(outputPath, base64Data, 'base64');
          
          generatedImage = `data:${mimeType};base64,${base64Data}`;
          break;
        }
      }
    }
    
    if (generatedImage) {
      console.log('Test successful. Image generated and saved to public/test-output.png');
      return NextResponse.json({ 
        status: 'success',
        message: 'Test successful! Image generated and saved to public/test-output.png.',
        output_path: '/test-output.png',
        model_used: GEMINI_MODEL_NAME
      });
    } else {
      console.log('No image generated, but API call successful. Response:', responseText);
      return NextResponse.json({ 
        status: 'partial_success',
        message: 'API call successful but no image generated. This model may not support image generation.',
        response: responseText,
        model_used: GEMINI_MODEL_NAME
      });
    }

  } catch (error) {
    console.error("[GEMINI API TEST] Internal Server Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ 
      status: 'error',
      message: 'Gemini API test failed.',
      details: errorMessage 
    }, { status: 500 });
  }
}
