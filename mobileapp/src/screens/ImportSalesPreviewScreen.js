import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTitle from '../components/DateTitle';
import SalesList from '../components/SalesList';
import useSalesStore from '../stores/useSalesStore';
import colors from '../theme/colors';
import formatCurrency from '../utils/formatCurrency';

const toPreviewSale = (sale, date) => ({
  ...sale,
  createdAt: `${date}T12:00:00`,
  imageUri: sale.imageBase64
    ? `data:image/jpeg;base64,${sale.imageBase64}`
    : sale.imageUri || null,
});

export default function ImportSalesPreviewScreen({
  payload,
  onCancel,
  onComplete,
}) {
  const insets = useSafeAreaInsets();
  const [isImporting, setIsImporting] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);
  const sales = useSalesStore((state) => state.sales);
  const importDailySales = useSalesStore((state) => state.importDailySales);
  const setSelectedDate = useSalesStore((state) => state.setSelectedDate);

  const previewSales = useMemo(
    () => payload.sales.map((sale) => toPreviewSale(sale, payload.date)),
    [payload]
  );
  const selectedDate = useMemo(() => new Date(`${payload.date}T12:00:00`), [payload.date]);
  const existingSales = useMemo(
    () => (sales || []).filter((sale) => new Date(sale.createdAt).toDateString() === selectedDate.toDateString()),
    [sales, selectedDate]
  );
  const total = previewSales.reduce((sum, sale) => sum + (Number(sale.price) || 0), 0);
  const hasExistingSales = existingSales.length > 0;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const closeSheet = (afterClose) => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(animation, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) afterClose();
    });
  };

  const handleCancel = () => {
    if (!isImporting) closeSheet(onCancel);
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      await importDailySales(payload, hasExistingSales);
      await setSelectedDate(payload.date);
      closeSheet(() => {
        setIsImporting(false);
        onComplete();
      });
    } catch (error) {
      Alert.alert('فشل الاستيراد', error.message || 'تعذر استيراد المبيعات اليومية.');
      setIsImporting(false);
    }
  };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 0.42] }) }]} />
        <Pressable
          style={styles.backdropTouchTarget}
          onPress={handleCancel}
          disabled={isImporting}
        />
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [420, 0] }) }] },
          ]}
        >
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <Text style={styles.eyebrow}>{hasExistingSales ? 'استبدال المبيعات' : 'استيراد المبيعات'}</Text>
            <DateTitle selectedDate={payload.date} />
            <Text style={styles.description}>
              {hasExistingSales
                ? `توجد مبيعات لهذا التاريخ بالفعل. استبدلها بعمليات البيع ${previewSales.length} أدناه.`
                : 'راجع عمليات البيع هذه قبل إضافتها إلى سجلاتك.'}
            </Text>
          </View>

          {hasExistingSales ? (
            <View style={styles.warning}>
              <Text style={styles.warningTitle}>سيتم استبدال المبيعات الموجودة</Text>
              <Text style={styles.warningText}>
                ستتم إزالة عمليات البيع الموجودة في هذا التاريخ وعددها {existingSales.length} فقط. لن تتغير المبيعات في التواريخ الأخرى.
              </Text>
            </View>
          ) : null}

          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryLabel}>المبيعات</Text>
              <Text style={styles.summaryValue}>{previewSales.length}</Text>
            </View>
            <View style={styles.summaryAmount}>
              <Text style={styles.summaryLabel}>المبلغ الإجمالي</Text>
              <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator>
            <SalesList sales={previewSales} isLoading={false} readOnly />
          </ScrollView>

          <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton, isImporting && styles.disabled]}
              onPress={handleCancel}
              disabled={isImporting}
            >
              <Text style={styles.cancelText}>إلغاء</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, hasExistingSales ? styles.replaceButton : styles.primaryButton, isImporting && styles.disabled]}
              onPress={handleImport}
              disabled={isImporting}
            >
              <Text style={styles.primaryText}>{isImporting ? 'جار التنفيذ...' : hasExistingSales ? 'استبدال' : 'إضافة'}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  backdropTouchTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    height: '82%',
    maxHeight: '85%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 16,
  },
  header: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  eyebrow: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  warning: {
    marginHorizontal: 16,
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerAlt,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  warningTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  warningText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  summary: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.text,
    borderRadius: 16,
    padding: 16,
  },
  summaryAmount: {
    alignItems: 'flex-end',
  },
  summaryLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  listScroll: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 18,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  replaceButton: {
    backgroundColor: colors.danger,
  },
  cancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.55,
  },
});
