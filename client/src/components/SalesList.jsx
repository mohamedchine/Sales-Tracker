import React from 'react';
import SaleCard from './SaleCard';

export default function SalesList({ sales, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return <div className="loading-state">Loading sales...</div>;
  }

  if (sales.length === 0) {
    return (
      <div className="sales-list empty">
        <div className="empty-state">
          <p>No sales for this date yet.</p>
          <p>Click "+ Add Sale" to create your first entry!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-list">
      {sales.map(sale => (
        <SaleCard
          key={sale._id}
          sale={sale}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
