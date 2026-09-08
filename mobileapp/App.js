import React, { useEffect, useRef, useState } from 'react';
import { Alert, Appearance, I18nManager, Linking, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppTabs from './src/navigation/AppTabs';
import ImportSalesPreviewScreen from './src/screens/ImportSalesPreviewScreen';
import useSalesStore from './src/stores/useSalesStore';
import { validateDailySalesPayload } from './src/utils/importExport';

Appearance.setColorScheme('light');
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function DailySalesFileReceiver({ onPreview }) {
  const handledUris = useRef(new Set());

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const receiveFile = async (uri) => {
      const isAndroidFileUri = uri?.startsWith('content://') || uri?.startsWith('file://');
      if (!isAndroidFileUri) return;
      if (!uri || handledUris.current.has(uri)) return;
      handledUris.current.add(uri);

      try {
        if (!useSalesStore.getState().hydrated) {
          await useSalesStore.getState().hydrate();
        }

        const response = await fetch(uri);
        if (!response.ok) throw new Error('تعذرت قراءة الملف المشترك.');
        const payload = validateDailySalesPayload(JSON.parse(await response.text()));
        onPreview({ payload });
      } catch (error) {
        handledUris.current.delete(uri);
        Alert.alert('ملف مبيعات يومية غير صالح', error.message || 'هذا الملف ليس ملف مبيعات يومية صالحا من متتبع الأسعار.');
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => receiveFile(url));
    Linking.getInitialURL().then(receiveFile).catch(() => {});

    return () => subscription.remove();
  }, []);

  return null;
}

export default function App() {
  const [pendingImport, setPendingImport] = useState(null);
  const navigationRef = useNavigationContainerRef();

  return (
    <SafeAreaProvider>
      <DailySalesFileReceiver
        onPreview={(preview) => {
          navigationRef.current?.navigate('Sales');
          setPendingImport(preview);
        }}
      />
      <NavigationContainer ref={navigationRef}>
        <AppTabs />
      </NavigationContainer>
      {pendingImport ? (
        <ImportSalesPreviewScreen
          payload={pendingImport.payload}
          onCancel={() => setPendingImport(null)}
          onComplete={() => setPendingImport(null)}
        />
      ) : null}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
