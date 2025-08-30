# Virtual Try-On Shopify App

A Shopify app that provides virtual try-on functionality using Google Gemini AI. Users can upload their photo and "try on" clothing items virtually.

## Features

- **Virtual Try-On Widget**: Embeddable in product pages
- **AI-Powered**: Uses Google Gemini AI for realistic image generation
- **Dual Upload**: Upload person image (required) + garment image (optional)
- **Real-time Processing**: Generates try-on images in seconds
- **Responsive Design**: Works on all devices

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory for local development:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-image-preview
```

**For Netlify deployment**, set these environment variables in your Netlify dashboard:
- Go to Site settings → Environment variables
- Add `GEMINI_API_KEY` with your actual API key
- Add `GEMINI_MODEL` with `gemini-2.5-flash-image-preview`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### 4. Deploy to Netlify

1. **Push your changes to Git:**
   ```bash
   git add .
   git commit -m "Add virtual try-on functionality"
   git push
   ```

2. **Netlify will automatically build and deploy** your app

3. **Set environment variables** in Netlify dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `GEMINI_MODEL`: `gemini-2.5-flash-image-preview`

4. **Your widget will now work** with the new API endpoint

## API Endpoints

### POST `/.netlify/functions/tryon`

**Netlify Function** that accepts JSON data:
- `personImage` (required): Base64 encoded user photo
- `garmentImage` (optional): Base64 encoded garment image

Returns: Base64 encoded PNG image of the person wearing the garment

**Local Development:**
- `POST /api/tryon` (Next.js API route)

## Theme App Extension

The widget is implemented as a Shopify Theme App Extension that can be added to product pages.

### Publishing the Extension

1. **Build the extension:**
   ```bash
   cd virtual-try-on-by-tia-lorens
   shopify app build
   ```

2. **Push the extension:**
   ```bash
   shopify extension push
   ```

3. **Publish a new version:**
   - Go to Shopify Partners Dashboard
   - Find your app
   - Go to Extensions
   - Click "Publish" on the latest version

### Adding to Your Store

1. Go to **Online Store → Customize**
2. Open a product template
3. Add the "Virtual Try-On Widget" block
4. Save and publish

## How It Works

1. **User uploads their photo** (required)
2. **User optionally uploads garment image**
3. **AI processes the images** using Gemini
4. **Generated image shows** person wearing the garment
5. **User can download** or try again

## Technical Details

- **Frontend**: Liquid templates + JavaScript
- **Backend**: Next.js API routes
- **AI**: Google Gemini 2.5 Flash Image Preview
- **Image Processing**: Base64 conversion, PNG output
- **Error Handling**: Retry logic, detailed logging
- **Security**: No API keys exposed to frontend

## Troubleshooting

### Common Issues

1. **"Failed to generate image"**
   - Check GEMINI_API_KEY is set correctly
   - Verify image file sizes are under 10MB
   - Check server logs for detailed error messages

2. **Widget not appearing**
   - Ensure extension is published
   - Check block is added to product template
   - Verify theme supports app blocks

3. **CORS errors**
   - Check origin headers in API response
   - Verify store domain is allowed

### Debug Mode

Enable console logging by checking browser developer tools. The widget logs:
- Product context data
- API responses
- Error details
- Generated image information

## Support

For issues or questions:
1. Check server logs for error details
2. Verify environment variables are set
3. Test API endpoint directly with Postman/curl
4. Check Shopify Partners Dashboard for extension status
