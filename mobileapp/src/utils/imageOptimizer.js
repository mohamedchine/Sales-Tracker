import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';

const PRODUCT_IMAGES_DIR = FileSystem.documentDirectory + 'product-images/';

export async function ensureProductImagesDir() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(PRODUCT_IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PRODUCT_IMAGES_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to create product images directory:', error);
    throw error;
  }
}

function generateUniqueFilename() {
  return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
}

function getImageDimensions(imageUri) {
  return new Promise((resolve, reject) => {
    Image.getSize(
      imageUri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
}

export async function optimizeImage(imageUri, options = {}) {
  const { maxWidth = 1200, compress = 0.6 } = options;

  try {
    const { width: originalWidth, height: originalHeight } = await getImageDimensions(imageUri);

    let resizeWidth = originalWidth;
    let resizeHeight = originalHeight;

    if (originalWidth > maxWidth) {
      const ratio = maxWidth / originalWidth;
      resizeWidth = maxWidth;
      resizeHeight = Math.round(originalHeight * ratio);
    }

    const manipulationResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: resizeWidth, height: resizeHeight } }],
      {
        compress,
        format: SaveFormat.JPEG,
      }
    );

    return {
      uri: manipulationResult.uri,
      width: resizeWidth,
      height: resizeHeight,
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  }
}

export async function saveImagePermanently(optimizedUri, oldImageUri = null) {
  try {
    await ensureProductImagesDir();
    const filename = generateUniqueFilename();
    const permanentUri = PRODUCT_IMAGES_DIR + filename;

    await FileSystem.copyAsync({
      from: optimizedUri,
      to: permanentUri,
    });

    try {
      await FileSystem.deleteAsync(optimizedUri, { idempotent: true });
    } catch (error) {
      console.warn('Could not delete temporary image:', error);
    }

    if (oldImageUri && oldImageUri.startsWith(PRODUCT_IMAGES_DIR)) {
      try {
        await FileSystem.deleteAsync(oldImageUri, { idempotent: true });
      } catch (error) {
        console.warn('Could not delete old image:', error);
      }
    }

    return permanentUri;
  } catch (error) {
    console.error('Failed to save image permanently:', error);
    throw error;
  }
}

export async function processPickedImage(
  result,
  onSuccess,
  onError,
  options = {},
  oldImageUri = null
) {
  if (!result.canceled && result.assets?.[0]?.uri) {
    try {
      const originalUri = result.assets[0].uri;
      const { uri: optimizedUri } = await optimizeImage(originalUri, options);
      const permanentUri = await saveImagePermanently(optimizedUri, oldImageUri);

      if (onSuccess) {
        onSuccess(permanentUri);
      }
    } catch (error) {
      console.error('Image processing failed:', error);
      if (onError) {
        onError(error);
      }
    }
  }
}

export async function deleteImage(imageUri) {
  if (!imageUri || !imageUri.startsWith(PRODUCT_IMAGES_DIR)) {
    return;
  }

  try {
    await FileSystem.deleteAsync(imageUri, { idempotent: true });
  } catch (error) {
    console.warn('Could not delete image:', error);
  }
}
