// Use ES modules for Netlify
import { GoogleGenerativeAI } from '@google/generative-ai';

// Hardcoded configuration for now
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image-preview';
const GARMENT_DESC = "black plush tracksuit (jacket + pants)"; // Hardcoded for now
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse multipart form data
    const formData = event.body;
    
    // For now, we'll use a simple approach with base64 data
    // In production, you'd want to use a proper multipart parser
    let personImageBase64, garmentImageBase64;
    
    try {
      const parsed = JSON.parse(formData);
      personImageBase64 = parsed.personImage;
      garmentImageBase64 = parsed.garmentImage;
    } catch (e) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': event.headers.origin || '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid JSON data' }),
      };
    }

    // Validation
    if (!personImageBase64) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': event.headers.origin || '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Person image is required' }),
      };
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "image/png"
      }
    });

    // Prepare prompt and images
    const prompt = `Edit this image to show the person wearing a ${GARMENT_DESC}. 

CRITICAL REQUIREMENTS:
- Keep the person's face, hair, body shape, pose, and background EXACTLY the same
- Only edit the clothing area to show them wearing the ${GARMENT_DESC}
- The garment should look exactly like described (same color, style, fit)
- Maintain identical lighting, shadows, and background
- The result should look like a real photo edit where only the clothing changed
- Do NOT change anything else about the image

This is an EDIT operation - preserve the original image structure and only modify the clothing.`;

    // Prepare image parts
    const imageParts = [
      {
        inlineData: {
          data: personImageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ];

    // Add garment image if provided
    if (garmentImageBase64) {
      imageParts.push({
        inlineData: {
          data: garmentImageBase64,
          mimeType: 'image/jpeg'
        }
      });
    }

    // Call Gemini API with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 1;
    
    while (retryCount <= maxRetries) {
      try {
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                ...imageParts
              ]
            }
          ]
        });
        
        response = await result.response;
        break; // Success, exit retry loop
        
      } catch (error) {
        console.error(`Gemini API attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount === maxRetries) {
          throw error; // Re-throw on final attempt
        }
        
        retryCount++;
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Extract generated image
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const content = response.candidates[0].content;
      if (content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // Convert base64 to buffer
            const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
            
            // Return PNG image
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': event.headers.origin || '*',
                'Content-Type': 'image/png',
                'Cache-Control': 'no-cache'
              },
              body: imageBuffer.toString('base64'),
              isBase64Encoded: true
            };
          }
        }
      }
    }

    // If no image generated, return error
    return {
      statusCode: 502,
      headers: {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to generate image from Gemini API' }),
    };

  } catch (error) {
    console.error('Try-on generation error:', error);
    
    // Log detailed error for debugging
    if (error.response) {
      try {
        const errorText = await error.response.text();
        console.error('Gemini API error details:', errorText);
      } catch (e) {
        console.error('Could not read error response:', e);
      }
    }
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
