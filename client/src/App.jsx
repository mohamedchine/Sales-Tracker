import React, { useState, useEffect } from 'react';
import DateNavigator from './components/DateNavigator';
import SalesList from './components/SalesList';
import SaleModal from './components/SaleModal';
import Total from './components/Total';
import { fetchSalesByDate, createSale, updateSale, deleteSale } from './api';

const formatDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateInputValue = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

function App() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return formatDateInputValue(new Date());
  });

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [error, setError] = useState('');

  // Fetch sales when date changes
  useEffect(() => {
    loadSales();
  }, [selectedDate]);

  const loadSales = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchSalesByDate(selectedDate);
      setSales(data);
    } catch (err) {
      setError('Failed to load sales. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousDay = () => {
    const date = parseDateInputValue(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDateInputValue(date));
  };

  const handleNextDay = () => {
    const date = parseDateInputValue(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatDateInputValue(date));
  };

  const handleDatePickerChange = (event) => {
    const nextDate = event.target.value;
    if (!nextDate) return;
    setSelectedDate(nextDate);
  };

  const handleAddSaleClick = () => {
    setEditingSale(null);
    setIsModalOpen(true);
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) {
      return;
    }

    try {
      await deleteSale(saleId);
      setSales(sales.filter(sale => sale._id !== saleId));
    } catch (err) {
      alert('Failed to delete sale. Please try again.');
      console.error(err);
    }
  };

  const handleSaveSale = async (formData) => {
    setIsLoading(true);
    try {
      if (editingSale) {
        // Update existing sale
        const updatedSale = await updateSale(editingSale._id, formData);
        setSales(sales.map(sale => sale._id === editingSale._id ? updatedSale : sale));
      } else {
        // Create new sale
        const newSale = await createSale({ ...formData, date: selectedDate });
        setSales([newSale, ...sales]);
      }
      setIsModalOpen(false);
      setEditingSale(null);
    } catch (err) {
      alert('Failed to save sale. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <DateNavigator
          selectedDate={selectedDate}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onDateChange={handleDatePickerChange}
        />

        {error && <div className="error-message">{error}</div>}

        <SalesList
          sales={sales}
          isLoading={isLoading}
          onEdit={handleEditSale}
          onDelete={handleDeleteSale}
        />

        <Total sales={sales} />
      </div>

      <div className="action-bar">
        <button className="btn-add" onClick={handleAddSaleClick}>
          + Add Sale
        </button>
      </div>

      <SaleModal
        isOpen={isModalOpen}
        sale={editingSale}
        onSave={handleSaveSale}
        onCancel={handleCancelModal}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
