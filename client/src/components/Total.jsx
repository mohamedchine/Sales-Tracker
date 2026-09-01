import React from 'react';

export default function Total({ sales }) {
  const calculateTotal = () => {
    return sales.reduce((sum, sale) => sum + sale.price, 0);
  };

  const formatTotal = (total) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total);
  };

  return (
    <div className="total-section">
      <div className="total-label">Total:</div>
      <div className="total-amount">{formatTotal(calculateTotal())}</div>
    </div>
  );
}
