import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GEMINI_API_KEY,
  GEMINI_MODEL_NAME
} from '@/config';

// Initialize Gemini API Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

// Helper function to convert a data URL to a Google AI Part
function dataUrlToPart(dataUrl: string) {
  const base64Data = dataUrl.split(',')[1];
  const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

export async function POST(req: Request) {
  try {
    const { userImageBase64, productName } = await req.json();

    if (!userImageBase64 || !productName) {
      return NextResponse.json({ error: 'Missing user image or product name' }, { status: 400 });
    }
    
    // Prepare the parts for the generation request
    const imagePart = dataUrlToPart(userImageBase64);
    const textPrompt = `Create a photorealistic fashion image showing this person wearing a "${productName}". The clothing should fit naturally on their body. Keep the same person but change their clothing. Clean studio background with professional lighting.`;

    // Call the Gemini API to generate content
    const response = await model.generateContent([textPrompt, imagePart]);
    
    const responseText = response.response.text();
    
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
          generatedImage = `data:${mimeType};base64,${base64Data}`;
          break;
        }
      }
    }
    
    if (!generatedImage) {
      // If no image generated, return the original image with a message
      console.log("Gemini response:", responseText);
      return NextResponse.json({ 
        data: {
          generatedImage: userImageBase64,
          message: "Image generation not available in current model. Showing original image.",
          aiResponse: responseText
        } 
      });
    }

    return NextResponse.json({ 
      data: {
        generatedImage: generatedImage,
      } 
    });

  } catch (error) {
    console.error("Internal Server Error in generate route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
