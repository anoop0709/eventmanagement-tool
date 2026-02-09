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
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj)
      .filter(([, value]) => value === true)
      .map(([key]) => formatLabel(key));
  };

  const renderDetailsBadge = (data) => {
    if (!data) return null;

    const entries = Object.entries(data).filter(([key, value]) => {
      // Skip services and addOns objects
      if (key === 'services' || key === 'addOns') return false;
      // Only show non-empty, non-null values
      return value !== '' && value !== null && typeof value !== 'object';
    });

    if (entries.length === 0) return null;

    return (
      <div className="review-info-badge">
        {entries.map(([key, value]) => (
          <div key={key} className="review-info-item">
            <span className="review-info-label">{formatLabel(key)}:</span>
            <span className="review-info-value">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderEventBadge = (event) => {
    if (!event) return null;

    const { services, addOns, ...eventDetails } = event;

    const detailsEntries = Object.entries(eventDetails).filter(
      ([, value]) => value !== '' && value !== null && typeof value !== 'object'
    );

    const selectedServices = getSelectedCheckboxes(services);
    const selectedAddOns = getSelectedCheckboxes(addOns);

    // If there's no content at all, return null
    if (
      detailsEntries.length === 0 &&
      selectedServices.length === 0 &&
      selectedAddOns.length === 0
    ) {
      return null;
    }

    return (
      <div className="review-info-badge">
        {/* Event Details */}
        {detailsEntries.map(([key, value]) => (
          <div key={key} className="review-info-item">
            <span className="review-info-label">{formatLabel(key)}:</span>
            <span className="review-info-value">{formatValue(value)}</span>
          </div>
        ))}

        {/* Services Section */}
        {selectedServices.length > 0 && (
          <>
            <div className="review-section-divider"></div>
            <div className="review-subsection-container">
              <div className="review-badge-title">Services</div>
              <div className="review-small-badges">
                {selectedServices.map((service, idx) => (
                  <span key={idx} className="review-small-badge">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Add-ons Section */}
        {selectedAddOns.length > 0 && (
          <>
            <div className="review-section-divider"></div>
            <div className="review-subsection-container">
              <div className="review-badge-title">Add-ons</div>
              <div className="review-small-badges">
                {selectedAddOns.map((addOn, idx) => (
                  <span key={idx} className="review-small-badge">
                    {addOn}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="review-container">
      {/* Client Information Section */}
      {formValues.clientDetails && (
        <div className="review-section">
          <h2 className="review-main-heading">Client Information</h2>
          {renderDetailsBadge(formValues.clientDetails)}
        </div>
      )}

      {/* Events Section */}
      {formValues.events && formValues.events.length > 0 && (
        <div className="review-section">
          <h2 className="review-main-heading">Events</h2>
          <div className="review-events-list">
            {formValues.events.map((event, index) => (
              <div key={index} className="review-event-group">
                <h3 className="review-event-heading">
                  Event {index + 1}
                  {event.eventName ? ` - ${event.eventName}` : ''}
                </h3>

                {/* Event Details with Services and Add-ons in one badge */}
                {renderEventBadge(event)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
