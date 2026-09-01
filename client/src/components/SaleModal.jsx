import React, { useState, useEffect } from 'react';

export default function SaleModal({ isOpen, sale, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({ name: '', price: '', image: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (sale) {
      setFormData({
        name: sale.name,
        price: sale.price.toString(),
        image: sale.image || '',
      });
    } else {
      setFormData({ name: '', price: '', image: '' });
    }
    setError('');
  }, [sale, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price.trim()) {
      setError('Product name and price are required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('Price must be a valid positive number');
      return;
    }

    onSave({
      name: formData.name.trim(),
      price: price,
      image: formData.image.trim() || null,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">
          {sale ? 'Edit Sale' : 'Add New Sale'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., iPhone 15"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="e.g., 799.99"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image" className="form-label">Image URL (Optional)</label>
            <input
              type="url"
              id="image"
              name="image"
              className="form-input"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="e.g., https://example.com/image.jpg"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (sale ? 'Update Sale' : 'Create Sale')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
