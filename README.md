# Interactive Image Generation with Background Removal

This web app generates images using the Pollinations.ai API and processes them to remove backgrounds using GitHub Actions, creating transparent PNGs for use in creative projects.

## Features

- Blue sky background interface
- Image generation using Pollinations.ai with comic book style preset
- Automated background removal via GitHub Actions
- Display of transparent PNG images

## How It Works

1. Enter a text prompt to generate an image (all images are generated in cartoon/comic book style)
2. Image is generated via the Pollinations.ai API with white background
3. Generated image is sent to GitHub Actions for background removal
4. Processed transparent PNG is displayed in the web app

## Setup Instructions

### Local Development

1. Clone this repository
2. Open `index.html` in your browser to test the basic interface
3. Images will be generated but background removal will require GitHub Actions setup

### GitHub Actions Setup

To enable the background removal functionality:

1. Push this repository to GitHub
2. Enable GitHub Actions for your repository
3. Create a Personal Access Token (PAT) with `repo` scope
4. Add the token as a repository secret named `GITHUB_TOKEN`
5. The workflow will now process images when triggered

### Customizing the Style Preset

All prompts are automatically prefixed with "cartoon style comic book style drawing with white background" to ensure consistency and make background removal easier. If you want to change this preset:

1. Open `app.js`
2. Find the `config` object near the top of the file
3. Modify the `stylePrompt` property to your preferred style
4. Save the file and reload the page

```javascript
const config = {
    // Other settings...
    stylePrompt: 'your preferred style description, '
};
```

### Triggering the Workflow

The GitHub Actions workflow can be triggered via the repository dispatch event. This would typically be done from your application using the GitHub API. Example implementation:

```javascript
// This would be integrated into your app.js
async function triggerBackgroundRemoval(imageUrl) {
  const response = await fetch(
    'https://api.github.com/repos/{username}/{repo}/dispatches',
    {
      method: 'POST',
      headers: {
        'Authorization': 'token YOUR_GITHUB_TOKEN',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'process-image',
        client_payload: {
          image_url: imageUrl
        }
      })
    }
  );
  
  return response.ok;
}
```

## Technologies Used

- HTML/CSS/JavaScript (Frontend)
- Pollinations.ai API (Image Generation)
- GitHub Actions (CI/CD and Image Processing)
- backgroundremover Python package (Background Removal)

## Future Enhancements

- Real-time status updates during processing
- Gallery of previously generated images
- Additional image customization options
- Integration with other generative AI services
