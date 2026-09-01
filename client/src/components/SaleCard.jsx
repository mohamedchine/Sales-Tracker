import React from 'react';

export default function SaleCard({ sale, onEdit, onDelete }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="sale-card">
      <div className="sale-image">
        {sale.image ? (
          <img src={sale.image} alt={sale.name} onError={(e) => e.target.style.display = 'none'} />
        ) : (
          <span>No image</span>
        )}
      </div>
      <div className="sale-details">
        <div className="sale-header">
          <div className="sale-name">{sale.name}</div>
          <div className="sale-actions">
            <button
              className="sale-btn"
              onClick={() => onEdit(sale)}
              title="Edit sale"
            >
              ✏️
            </button>
            <button
              className="sale-btn delete"
              onClick={() => onDelete(sale._id)}
              title="Delete sale"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="sale-price">{formatPrice(sale.price)}</div>
        <div className="sale-time">{formatTime(sale.createdAt)}</div>
      </div>
    </div>
  );
}
