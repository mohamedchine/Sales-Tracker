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
        {/* Date Title */}
        <View style={styles.titleSection}>
          <DateTitle selectedDate={selectedDate} />
        </View>

        {/* Date Navigation Row */}
        <DateNavigator
          selectedDate={selectedDate}
          onPreviousDay={() => moveSelectedDate(-1)}
          onNextDay={() => moveSelectedDate(1)}
          onAddPress={handleOpenAdd}
        />

        <View style={styles.divider} />

        {/* Sales Content */}
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

        {/* Total Section */}
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
  },
  titleSection: {
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 120,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
 
  },
  totalWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
