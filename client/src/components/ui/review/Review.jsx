import './Review.css';

export function Review({ formValues }) {
  // Helper to format field names to readable labels
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper to format date values
  const formatValue = (value) => {
    if (value instanceof Date) {
      return value.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    return value || 'N/A';
  };

  // Filter checkbox sections to only show true values
  const getSelectedCheckboxes = (obj) => {
    return Object.entries(obj)
      .filter(([, value]) => value === true)
      .map(([key]) => formatLabel(key));
  };

  const renderSection = (title, data, isCheckboxSection = false) => {
    if (isCheckboxSection) {
      const selectedItems = getSelectedCheckboxes(data);
      if (selectedItems.length === 0) return null;

      return (
        <div className="review-section" key={title}>
          <h3 className="review-section-title">{title}</h3>
          <div className="review-checkbox-list">
            {selectedItems.map((item, index) => (
              <div key={index} className="review-checkbox-item">
                <span className="review-checkbox-icon">✓</span>
                <span className="review-checkbox-label">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // For regular sections, show all fields with values
    const hasValues = Object.values(data).some((value) => value !== '' && value !== null);
    if (!hasValues) return null;

    return (
      <div className="review-section" key={title}>
        <h3 className="review-section-title">{title}</h3>
        <div className="review-field-grid">
          {Object.entries(data).map(([key, value]) => {
            if (value === '' || value === null) return null;
            return (
              <div className="review-field" key={key}>
                <span className="review-field-label">{formatLabel(key)}</span>
                <span className="review-field-value">{formatValue(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="review-container">
      {formValues.clientDetails && renderSection('Client Information', formValues.clientDetails)}
      {formValues.eventDetails && renderSection('Event Details', formValues.eventDetails)}
      {formValues.services && renderSection('Services', formValues.services, true)}
      {formValues.addOns && renderSection('Add-ons', formValues.addOns, true)}
    </div>
  );
}
