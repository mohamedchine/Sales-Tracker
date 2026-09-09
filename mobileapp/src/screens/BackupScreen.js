import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import ScreenShell from '../components/ScreenShell';
import colors from '../theme/colors';
import useSalesStore from '../stores/useSalesStore';
import { buildCompressedSalesExportPayload, parseSalesImportPayload, readLocalText } from '../utils/importExport';

export default function BackupScreen() {
  const sales = useSalesStore((s) => s.sales);
  const setSales = useSalesStore((s) => s.setSales);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const getSaleDate = (sale) => {
    const date = new Date(sale.createdAt);
    if (Number.isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getBackupFileName = () => {
    const dates = sales.map(getSaleDate).filter(Boolean).sort();
    if (dates.length === 0) return null;

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    return startDate === endDate
      ? `PricesTracker_${startDate}.ptbackup`
      : `PricesTracker_${startDate}_to_${endDate}.ptbackup`;
  };

  const saveToDeviceAndroid = async (jsonContent, fileName, showSuccess = true) => {
    try {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert('تم رفض الإذن', 'يلزم إذن التخزين لحفظ النسخة الاحتياطية.');
        return false;
      }

      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'application/json'
      );

      await FileSystem.writeAsStringAsync(uri, jsonContent, { encoding: 'utf8' });
      if (showSuccess) {
        Alert.alert('تم حفظ النسخة الاحتياطية', `تم حفظ ملف النسخة الاحتياطية باسم:\n${fileName}`, [{ text: 'حسنا' }]);
      }
      return true;
    } catch (err) {
      if (err.message?.includes('User cancelled')) return;
      throw err;
    }
  };

  const saveBackupToDevice = async ({ showEmptyMessage = true, showSuccess = true } = {}) => {
    if (sales.length === 0) {
      if (showEmptyMessage) Alert.alert('لا توجد مبيعات لنسخها احتياطيا.');
      return true;
    }

    const fileName = getBackupFileName();
    if (!fileName) {
      throw new Error('تعذر تحديد تواريخ المبيعات لهذه النسخة الاحتياطية.');
    }

    const payload = await buildCompressedSalesExportPayload(sales, 1200, 0.6);
    const json = JSON.stringify(payload, null, 2);

    if (Platform.OS === 'android') {
      return saveToDeviceAndroid(json, fileName, showSuccess);
    }

    if (showSuccess) {
      Alert.alert('النسخة الاحتياطية جاهزة', 'هذا التطبيق مهيأ لحفظ الملفات على أجهزة أندرويد.');
    }
    return true;
  };

  const exportBackup = async () => {
    try {
      setExporting(true);
      await saveBackupToDevice();
    } catch (err) {
      Alert.alert('فشل التصدير', err.message || 'تعذر تصدير النسخة الاحتياطية.');
      console.error('Backup export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const continueImportBackup = async () => {
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const text = await readLocalText(result.assets[0].uri);
      const data = JSON.parse(text);
      if (!Array.isArray(data?.sales)) {
        throw new Error('هذا ليس ملف نسخة احتياطية صالحا من متتبع الأسعار.');
      }
      const salesToImport = await parseSalesImportPayload(data);
      await setSales(salesToImport);
      Alert.alert('اكتمل الاستيراد', 'تم استيراد نسخة المبيعات الاحتياطية بنجاح.');
    } catch (err) {
      Alert.alert('فشل الاستيراد', err.message || 'تعذر استيراد النسخة الاحتياطية.');
    } finally {
      setImporting(false);
    }
  };

  const importBackup = () => {
    Alert.alert(
      'استبدال بيانات المبيعات الحالية؟',
      'سيؤدي استيراد نسخة احتياطية إلى استبدال وحذف جميع بيانات المبيعات الحالية على هذا الجهاز. احفظ نسخة احتياطية يدويا أولا إذا أردت الاحتفاظ بها.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'متابعة', onPress: continueImportBackup },
      ]
    );
  };

  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>النسخ الاحتياطي</Text>
          <Text style={styles.desc}>
            صدّر جميع المبيعات في ملف JSON مضغوط. تصغّر الصور لتقليل حجم الملف ويمكن استعادتها لاحقا.
          </Text>

          <Pressable style={[styles.btn, exporting && styles.btnDisabled]} onPress={exportBackup} disabled={exporting}>
            {exporting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>حفظ النسخة الاحتياطية على الجهاز</Text>}
          </Pressable>

          <Pressable style={[styles.secondaryBtn, importing && styles.btnDisabled]} onPress={importBackup} disabled={importing}>
            {importing ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.secondaryText}>استيراد نسخة احتياطية</Text>}
          </Pressable>

          <Text style={styles.note}>تُضغط الصور إلى عرض أقصى 1200 بكسل بجودة 60% قبل التصدير.</Text>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 18,
    paddingTop: 60,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: colors.text,
  },
  desc: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 18,
    lineHeight: 18,
  },
});
