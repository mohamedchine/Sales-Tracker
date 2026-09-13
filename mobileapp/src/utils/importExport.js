import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { base64ToImage, imageToBase64 } from './images';

function incomingUriCandidates(uri) {
  const candidates = [uri];

  try {
    const decoded = decodeURI(uri);
    if (decoded !== uri) candidates.push(decoded);
  } catch {
    // Keep the original URI if it is not valid percent-encoding.
  }

  try {
    const decoded = decodeURIComponent(uri);
    if (!candidates.includes(decoded)) candidates.push(decoded);
  } catch {
    // Some Android content URIs contain reserved characters that should stay encoded.
  }

  return candidates;
}

async function readWithNewFileApi(uri) {
  const file = new File(uri);
  return await file.text();
}

async function copyThenRead(uri) {
  const dest = new File(Paths.cache, `incoming-${Date.now()}.txt`);
  const source = new File(uri);
  source.copy(dest);
  return await dest.text();
}

async function readWithLegacyFileSystem(uri) {
  const encoding = 'utf8';

  if (uri.startsWith('content://')) {
    const dest = `${FileSystem.cacheDirectory}incoming-${Date.now()}.txt`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return await FileSystem.readAsStringAsync(dest, { encoding });
  }

  return await FileSystem.readAsStringAsync(uri, { encoding });
}

async function readWithFetch(uri) {
  const response = await fetch(uri);
  if (!response.ok && response.status !== 0) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.text();
}

export async function readLocalText(uri) {
  if (!uri) {
    throw new Error('تعذرت قراءة الملف المشترك.');
  }

  const errors = [];

  for (const candidate of incomingUriCandidates(uri)) {
    for (const reader of [readWithNewFileApi, copyThenRead, readWithLegacyFileSystem, readWithFetch]) {
      try {
        return await reader(candidate);
      } catch (error) {
        errors.push(error);
      }
    }

    try {
      return await FileSystem.StorageAccessFramework.readAsStringAsync(candidate);
    } catch (error) {
      errors.push(error);
    }
  }

  console.warn('readLocalText failed', uri, errors);
  throw new Error('تعذرت قراءة الملف المشترك.');
}

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

export async function buildDailySalesExportPayload(sales, date) {
  const exportedSales = [];

  for (const sale of sales) {
    exportedSales.push({
      _id: sale._id,
      name: sale.name,
      price: sale.price,
      imageBase64: sale.imageUri ? await imageToBase64(sale.imageUri) : null,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt || sale.createdAt,
    });
  }

  return {
    type: 'daily_sales',
    version: 1,
    date,
    sales: exportedSales,
  };
}

export function validateDailySalesPayload(data) {
  if (!data || data.type !== 'daily_sales') {
    throw new Error('هذا ليس ملف مبيعات يومية صالحا من متتبع الأسعار.');
  }
  if (data.version !== 1) {
    throw new Error('إصدار ملف المبيعات اليومية هذا غير مدعوم.');
  }
  const parsedDate = new Date(`${data.date}T12:00:00`);
  const normalizedDate = !Number.isNaN(parsedDate.getTime())
    ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
    : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || normalizedDate !== data.date) {
    throw new Error('يحتوي ملف المبيعات اليومية على تاريخ غير صالح.');
  }
  if (!Array.isArray(data.sales)) {
    throw new Error('يحتوي ملف المبيعات اليومية على بيانات مبيعات غير صالحة.');
  }
  return data;
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
