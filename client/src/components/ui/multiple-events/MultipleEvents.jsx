import { FormFieldRenderer } from '@/components/ui/form-field-renderer/FormFieldRenderer';
import './MultipleEvents.css';

export function MultipleEvents({ fields, servicesFields, addOnsFields, formik, section }) {
  const events = formik.values[section] || [];

  const addEvent = () => {
    const newEvent = {
      eventName: '',
      eventType: '',
      eventDate: null,
      guestCount: '',
      venue: '',
      postCode: '',
      services: {
        stageDecoration: false,
        catering: false,
        transportation: false,
        mehandiHaldi: false,
        photographyVideography: false,
        saveTheDate: false,
        cardDesignPrinting: false,
        outfitDesign: false,
        honeymoonPackage: false,
      },
      addOns: {
        dj: false,
        liveBand: false,
        fireworks: false,
        photoBooth: false,
        welcomeGirls: false,
        valetParking: false,
        eventInsurance: false,
        securityServices: false,
        socialMediaCoverage: false,
      },
    };
    formik.setFieldValue(section, [...events, newEvent]);
  };

  const removeEvent = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    formik.setFieldValue(section, updatedEvents);
  };

  return (
    <div className="multiple-events-container">
      {events.map((event, eventIndex) => (
        <div key={eventIndex} className="event-card">
          <div className="event-card-header">
            <h4 className="event-card-title">
              Event {eventIndex + 1}
              {event.eventType && ` - ${event.eventType}`}
            </h4>
            {events.length > 1 && (
              <button
                type="button"
                onClick={() => removeEvent(eventIndex)}
                className="event-remove-btn"
                aria-label="Remove event"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          <div className="form-grid">
            {fields.map((field, fieldIndex) => (
              <FormFieldRenderer
                key={fieldIndex}
                field={{
                  ...field,
                  name: `${section}[${eventIndex}].${field.name}`,
                }}
                formik={formik}
              />
            ))}
          </div>

          {/* Services Section */}
          {servicesFields && servicesFields.length > 0 && (
            <>
              <div className="event-section-divider" />
              <h5 className="event-subsection-title">Services</h5>
              <div className="services-grid">
                {servicesFields.map((field, fieldIndex) => (
                  <FormFieldRenderer
                    key={fieldIndex}
                    field={{
                      ...field,
                      name: `${section}[${eventIndex}].services.${field.name}`,
                    }}
                    formik={formik}
                  />
                ))}
              </div>
            </>
          )}

          {/* Add-Ons Section */}
          {addOnsFields && addOnsFields.length > 0 && (
            <>
              <div className="event-section-divider" />
              <h5 className="event-subsection-title">Add-Ons</h5>
              <div className="services-grid">
                {addOnsFields.map((field, fieldIndex) => (
                  <FormFieldRenderer
                    key={fieldIndex}
                    field={{
                      ...field,
                      name: `${section}[${eventIndex}].addOns.${field.name}`,
                    }}
                    formik={formik}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addEvent} className="event-add-btn">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Another Event
      </button>
    </div>
  );
}
