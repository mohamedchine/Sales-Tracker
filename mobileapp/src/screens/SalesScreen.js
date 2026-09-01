import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import DateTitle from '../components/DateTitle';
import DateNavigator from '../components/DateNavigator';
import SaleModal from '../components/SaleModal';
import SalesList from '../components/SalesList';
import Total from '../components/Total';
import ScreenShell from '../components/ScreenShell';
import useSalesStore from '../stores/useSalesStore';
import colors from '../theme/colors';

export default function SalesScreen() {
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedDate = useSalesStore((s) => s.selectedDate);
  const sales = useSalesStore((s) => s.sales);
  const setSelectedDate = useSalesStore((s) => s.setSelectedDate);
  const moveSelectedDate = useSalesStore((s) => s.moveSelectedDate);
  const createSale = useSalesStore((s) => s.createSale);
  const updateSale = useSalesStore((s) => s.updateSale);
  const deleteSale = useSalesStore((s) => s.deleteSale);

  const filteredSales = useMemo(() => {
    return (sales || []).filter((sale) => {
      const created = new Date(sale.createdAt);
      const selected = new Date(`${selectedDate}T12:00:00`);
      return created.toDateString() === selected.toDateString();
    });
  }, [sales, selectedDate]);

  const confirmDelete = (id) => {
    Alert.alert('Delete sale?', 'This cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          await deleteSale(id);
        },
      },
    ]);
  };

  const handleOpenAdd = () => {
    setEditingSale(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sale) => {
    setEditingSale(sale);
    setShowModal(true);
  };

const handleSave = async (payload) => {
  setIsSaving(true);

  try {
    if (editingSale) {
      await updateSale(editingSale._id, payload);
    } else {
      await createSale(payload);
    }

    // Close the modal after successful save
    setShowModal(false);
    setEditingSale(null);
  } catch (error) {
    console.error('Save error:', error);
    Alert.alert('Error', 'Failed to save sale. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <DateTitle selectedDate={selectedDate} />
          <DateNavigator
            selectedDate={selectedDate}
            onPreviousDay={() => moveSelectedDate(-1)}
            onNextDay={() => moveSelectedDate(1)}
            onAddPress={handleOpenAdd}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          scrollIndicatorInsets={{ right: 2 }}
        >
          <SalesList
            sales={filteredSales}
            isLoading={false}
            onEdit={handleOpenEdit}
            onDelete={confirmDelete}
          />
        </ScrollView>

        <View style={styles.totalWrapper}>
          <Total sales={filteredSales} />
        </View>

        <SaleModal
          visible={showModal}
          sale={editingSale}
          onSave={handleSave}
          onCancel={() => {
            setEditingSale(null);
            setShowModal(false);
          }}
          isLoading={isSaving}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
  },
  headerCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 120,
    paddingTop: 4,
    paddingBottom: 8,
  },
  totalWrapper: {
    marginTop: 10,
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
  },
});
