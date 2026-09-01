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
import { buildCompressedSalesExportPayload, parseSalesImportPayload } from '../utils/importExport';

export default function BackupScreen() {
  const sales = useSalesStore((s) => s.sales);
  const setSales = useSalesStore((s) => s.setSales);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const fileName = `sales-backup-${new Date().toISOString().slice(0, 10)}.json`;

  const saveToDeviceAndroid = async (jsonContent) => {
    try {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert('Permission denied', 'Storage permission is required to save the backup.');
        return;
      }

      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'application/json'
      );

      await FileSystem.writeAsStringAsync(uri, jsonContent, { encoding: 'utf8' });
      Alert.alert('Backup saved', `Backup file saved as:\n${fileName}`, [{ text: 'OK' }]);
    } catch (err) {
      if (err.message?.includes('User cancelled')) return;
      throw err;
    }
  };

  const exportBackup = async () => {
    try {
      setExporting(true);
      const payload = await buildCompressedSalesExportPayload(sales, 1200, 0.6);
      const json = JSON.stringify(payload, null, 2);

      if (Platform.OS === 'android') {
        await saveToDeviceAndroid(json);
      } else {
        Alert.alert('Backup ready', 'This app is configured for Android device save-to-file export.');
      }
    } catch (err) {
      Alert.alert('Export failed', err.message || 'Could not export backup.');
      console.error('Backup export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const importBackup = async () => {
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const response = await fetch(result.assets[0].uri);
      const text = await response.text();
      const data = JSON.parse(text);
      const salesToImport = await parseSalesImportPayload(data);
      await setSales(salesToImport);
      Alert.alert('Import complete', 'Sales backup imported successfully.');
    } catch (err) {
      Alert.alert('Import failed', err.message || 'Could not import backup.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Backup</Text>
          <Text style={styles.desc}>
            Export all sales as a compressed JSON file. Images are resized to reduce file size and can be restored later.
          </Text>

          <Pressable style={[styles.btn, exporting && styles.btnDisabled]} onPress={exportBackup} disabled={exporting}>
            {exporting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Backup to Device</Text>}
          </Pressable>

          <Pressable style={[styles.secondaryBtn, importing && styles.btnDisabled]} onPress={importBackup} disabled={importing}>
            {importing ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.secondaryText}>Import Backup</Text>}
          </Pressable>

          <Text style={styles.note}>Images are compressed to a max width of 1200px at 60% quality before export.</Text>
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
