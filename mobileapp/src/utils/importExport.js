import * as ImageManipulator from 'expo-image-manipulator';
import { base64ToImage, imageToBase64 } from './images';

export async function buildSalesExportPayload(sales) {
  const exportedSales = [];

  for (const sale of sales) {
    const imageBase64 = sale.imageUri ? await imageToBase64(sale.imageUri) : null;
    exportedSales.push({
      _id: sale._id,
      name: sale.name,
      price: sale.price,
      imageBase64,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt || sale.createdAt,
    });
  }

  return { sales: exportedSales };
}

async function compressImage(imageUri, maxWidth = 1200, quality = 0.6) {
  if (!imageUri) return null;

  try {
    const result = await ImageManipulator.manipulateAsync(imageUri, [], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    if (result.width > maxWidth) {
      const resized = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { width: maxWidth } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return await imageToBase64(resized.uri);
    }

    return await imageToBase64(result.uri);
  } catch (err) {
    console.warn('Image compression failed:', err);
    return await imageToBase64(imageUri);
  }
}

export async function buildCompressedSalesExportPayload(sales, maxImageWidth = 1200, imageQuality = 0.6) {
  const exportedSales = [];

  for (const sale of sales) {
    const imageBase64 = sale.imageUri
      ? await compressImage(sale.imageUri, maxImageWidth, imageQuality)
      : null;

    exportedSales.push({
      _id: sale._id,
      name: sale.name,
      price: sale.price,
      imageBase64,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt || sale.createdAt,
    });
  }

  return { sales: exportedSales };
}

export async function parseSalesImportPayload(data) {
  const rawSales = Array.isArray(data?.sales) ? data.sales : [];
  const sales = [];

  for (const sale of rawSales) {
    const id = sale._id || `sale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let imageUri = null;

    if (sale.imageBase64) {
      imageUri = await base64ToImage(id, sale.imageBase64);
    } else if (sale.imageUri) {
      imageUri = sale.imageUri;
    }

    sales.push({
      _id: id,
      name: (sale.name || '').trim(),
      price: Number(sale.price) || 0,
      imageUri,
      createdAt: sale.createdAt || new Date().toISOString(),
      updatedAt: sale.updatedAt || sale.createdAt || new Date().toISOString(),
    });
  }

  return sales;
}
