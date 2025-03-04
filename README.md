# Space Artwork Generator

A web application that generates cartoon-style images with transparent backgrounds, displaying them against a stunning space background.

## Features

- Generates cartoon-style comic book artwork with white backgrounds
- Automatically removes the background using the remove.bg API
- Displays images against a beautiful space background
- Allows downloading of transparent PNG images
- Simple and intuitive user interface

## How It Works

1. Enter a prompt describing what you'd like to see
2. Click "Generate Image" 
3. The app will:
   - Generate the image using Pollinations.ai API
   - Automatically remove the background using remove.bg API
   - Display the transparent image against a space background
4. Once the image is ready, you can download it with the "Download Space Artwork" button

## Technical Details

The application uses:
- Pollinations.ai API for image generation
- Remove.bg API for background removal
- Vanilla JavaScript, HTML, and CSS
- No server-side code required - runs entirely in the browser

## Setup

1. Clone this repository
2. Open `index.html` in your browser
3. Start generating space artwork!

## API Keys

The application uses the following API:
- Remove.bg API - Used for automatic background removal

## Customization

If you want to modify the style of generated images, you can adjust the `stylePrompt` prefix in `app.js`. The default is "cartoon style comic book style drawing with white background, " which provides good results for background removal.

## License

This project is open source and available under the MIT License.
