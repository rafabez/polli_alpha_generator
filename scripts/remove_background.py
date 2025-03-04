import os
from backgroundremover.bg import remove
import sys
from pathlib import Path

def remove_background():
    # Create output directory if it doesn't exist
    os.makedirs('processed_images', exist_ok=True)
    
    # Get the filename of the image to process
    with open('current_image.txt', 'r') as f:
        input_path = f.read().strip()
    
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} does not exist")
        sys.exit(1)
    
    # Generate output path
    input_filename = os.path.basename(input_path)
    name_without_ext = os.path.splitext(input_filename)[0]
    output_path = f"processed_images/{name_without_ext}_transparent.png"
    
    print(f"Removing background from {input_path}")
    
    # Remove background using backgroundremover library
    try:
        # Handle file paths as binary data
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
            
            # Use an intermediate temporary file if needed
            temp_output_path = output_path + ".tmp"
            
            # Use the remove function with binary data 
            remove(input_data, temp_output_path)
            
            # Rename the temp file to the final output path
            if os.path.exists(temp_output_path):
                if os.path.exists(output_path):
                    os.remove(output_path)
                os.rename(temp_output_path, output_path)
                
        print(f"Background removed successfully. Saved as {output_path}")
    except Exception as e:
        print(f"Error removing background: {e}")
        # Print more detailed error information
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Save the processed image path for future reference
    with open('processed_image.txt', 'w') as f:
        f.write(output_path)
    
    return output_path

if __name__ == "__main__":
    remove_background()
