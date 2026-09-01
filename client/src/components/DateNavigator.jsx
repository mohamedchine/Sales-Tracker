import React from 'react';

const parseDateInputValue = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function DateNavigator({ selectedDate, onPreviousDay, onNextDay, onDateChange }) {
  const formatDate = (dateString) => {
    const date = parseDateInputValue(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="date-navigator">
      <button className="date-button" onClick={onPreviousDay} title="Previous day">
        ←
      </button>

      <label className="date-picker-wrapper" aria-label="Select date">
        <input
          type="date"
          className="date-picker"
          value={selectedDate}
          onChange={onDateChange}
          title="Select a date"
        />
      </label>

      <div className="date-display">{formatDate(selectedDate)}</div>
      <button className="date-button" onClick={onNextDay} title="Next day">
        →
      </button>
    </div>
  );
}
