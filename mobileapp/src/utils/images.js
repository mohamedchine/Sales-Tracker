import * as FileSystem from 'expo-file-system/legacy';

const IMAGES_DIR = `${FileSystem.documentDirectory}aswam-images/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

export async function saveProductImage(productId, sourceUri) {
  await ensureDir();
  const dest = `${IMAGES_DIR}${productId}.jpg`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteProductImage(productId) {
  const path = `${IMAGES_DIR}${productId}.jpg`;
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}

export async function imageToBase64(uri) {
  if (!uri) return null;
  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
  } catch {
    return null;
  }
}

export async function base64ToImage(productId, base64) {
  if (!base64) return null;
  await ensureDir();
  const dest = `${IMAGES_DIR}${productId}.jpg`;
  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: 'base64',
  });
  return dest;
}
