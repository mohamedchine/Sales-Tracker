const API_URL = import.meta.env.VITE_API_URL;

export const fetchSalesByDate = async (date) => {
  const response = await fetch(`${API_URL}/sales?date=${date}`);
  if (!response.ok) throw new Error('Failed to fetch sales');
  return response.json();
};

export const createSale = async (saleData) => {
  const response = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData),
  });
  if (!response.ok) throw new Error('Failed to create sale');
  return response.json();
};

export const updateSale = async (id, saleData) => {
  const response = await fetch(`${API_URL}/sales/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData),
  });
  if (!response.ok) throw new Error('Failed to update sale');
  return response.json();
};

export const deleteSale = async (id) => {
  const response = await fetch(`${API_URL}/sales/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete sale');
  return response.json();
};
