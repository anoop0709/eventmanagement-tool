import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FormCard } from '@/components/ui/form-card/FormCard';
import { Select } from '@/components/ui/select/Select';
import { GalleryModal } from '@/components/ui/gallery-modal/GalleryModal';
import { serviceDetailFields, addOnDetailFields } from '@/config/updateDetailsConfig';
import './UpdateDetailsPage.css';

export default function UpdateDetailsPage() {
  const navigate = useNavigate();
  const [eventFormData, setEventFormData] = useState(null);
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    eventIndex: null,
    serviceKey: null,
    fieldName: null,
    theme: null,
  });

  useEffect(() => {
    const savedData = localStorage.getItem('eventFormData');
    if (savedData) {
      setEventFormData(JSON.parse(savedData));
    } else {
      // If no data, redirect back to create event
      navigate('/newevent');
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      eventDetails: {},
    },
    onSubmit: (values) => {
      console.log('Update details submitted:', values);
      // Merge with existing data and save
      const updatedData = { ...eventFormData, ...values };
      localStorage.setItem('eventFormData', JSON.stringify(updatedData));
      // Navigate to next step or dashboard
      navigate('/');
    },
  });

  if (!eventFormData) {
    return null;
  }

  // Filter events that have at least one service or addon selected
  const eventsWithServices =
    eventFormData.events?.filter((event) => {
      const hasServices =
        event.services && Object.values(event.services).some((val) => val === true);
      const hasAddOns = event.addOns && Object.values(event.addOns).some((val) => val === true);
      return hasServices || hasAddOns;
    }) || [];

  // Helper to format label
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Get selected services for an event
  const getSelectedServices = (services) => {
    if (!services) return [];
    return Object.entries(services)
      .filter(([, value]) => value === true)
      .map(([key]) => ({ key, label: formatLabel(key) }));
  };

  // Get selected addons for an event
  const getSelectedAddOns = (addOns) => {
    if (!addOns) return [];
    return Object.entries(addOns)
      .filter(([, value]) => value === true)
      .map(([key]) => ({ key, label: formatLabel(key) }));
  };

  const openGalleryModal = (eventIndex, serviceKey, fieldName, theme = '') => {
    if (theme === 'mixed') {
      theme = '';
    }
    setGalleryModal({
      isOpen: true,
      eventIndex,
      serviceKey,
      fieldName,
      theme,
    });
  };

  const closeGalleryModal = () => {
    setGalleryModal({
      isOpen: false,
      eventIndex: null,
      serviceKey: null,
      fieldName: null,
      theme: null,
    });
  };

  console.log(formik.values);

  const handleGallerySelect = (selectedImages) => {
    const { eventIndex, serviceKey, fieldName } = galleryModal;
    const fieldPath = `eventDetails[${eventIndex}].services.${serviceKey}.${fieldName}`;
    formik.setFieldValue(fieldPath, selectedImages);
    closeGalleryModal();
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="update-details-title">Update Event Details</h1>
        <p className="update-details-subtitle">
          Add more details for each selected service and add-on
        </p>

        <form onSubmit={formik.handleSubmit}>
          {eventsWithServices.map((event, eventIndex) => {
            const selectedServices = getSelectedServices(event.services);
            const selectedAddOns = getSelectedAddOns(event.addOns);

            if (selectedServices.length === 0 && selectedAddOns.length === 0) {
              return null;
            }

            return (
              <FormCard
                key={eventIndex}
                title={`Event ${eventIndex + 1}${event.eventName ? ` - ${event.eventName}` : ''}`}
                subtitle={`${event.eventType || 'Event'} details`}
              >
                {/* Services Section */}
                {selectedServices.length > 0 && (
                  <div className="update-section">
                    <h3 className="update-section-title">Services</h3>
                    <div className="update-services-grid">
                      {selectedServices.map((service) => {
                        const fields = serviceDetailFields[service.key] || [];

                        return (
                          <div key={service.key} className="service-detail-card">
                            <h4 className="service-detail-title">{service.label}</h4>
                            <div className="service-detail-form">
                              {fields.map((field, fieldIndex) => {
                                const fieldName = `eventDetails[${eventIndex}].services.${service.key}.${field.name}`;
                                const fieldValue =
                                  formik.values.eventDetails?.[eventIndex]?.services?.[
                                    service.key
                                  ]?.[field.name] || '';

                                const renderFieldInput = () => {
                                  switch (field.type) {
                                    case 'textarea':
                                      return (
                                        <textarea
                                          name={fieldName}
                                          placeholder={field.placeholder}
                                          className="form-textarea"
                                          rows={field.rows || 3}
                                          onChange={formik.handleChange}
                                          value={fieldValue}
                                        />
                                      );

                                    case 'select':
                                      return (
                                        <Select
                                          options={field.options || []}
                                          value={fieldValue}
                                          onChange={(value) =>
                                            formik.setFieldValue(fieldName, value)
                                          }
                                          placeholder={field.placeholder}
                                        />
                                      );

                                    case 'gallery-select':
                                      return (
                                        <>
                                          <button
                                            type="button"
                                            className="gallery-select-btn"
                                            onClick={() =>
                                              openGalleryModal(
                                                eventIndex,
                                                service.key,
                                                field.name,
                                                formik.values?.eventDetails?.[eventIndex]?.services
                                                  ?.stageDecoration?.theme || ''
                                              )
                                            }
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
                                              <line x1="12" y1="5" x2="12" y2="19"></line>
                                              <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                            Select Decoration
                                          </button>
                                          {field.helperText && (
                                            <span className="form-helper-text">
                                              {field.helperText}
                                            </span>
                                          )}
                                          {fieldValue?.length > 0 && (
                                            <div className="selected-decorations">
                                              {fieldValue.map((img, idx) => (
                                                <div key={idx} className="selected-decoration-item">
                                                  <img src={img.src} alt={img.name} />
                                                  <span>{img.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </>
                                      );

                                    case 'file':
                                      return (
                                        <>
                                          <input
                                            type="file"
                                            name={fieldName}
                                            accept={field.accept}
                                            multiple={field.multiple}
                                            className="form-input"
                                            onChange={(e) => {
                                              const files = Array.from(e.target.files);
                                              formik.setFieldValue(fieldName, files);
                                            }}
                                          />
                                          {field.helperText && (
                                            <span className="form-helper-text">
                                              {field.helperText}
                                            </span>
                                          )}
                                        </>
                                      );

                                    default:
                                      return (
                                        <input
                                          type={field.type}
                                          name={fieldName}
                                          placeholder={field.placeholder}
                                          className="form-input"
                                          onChange={formik.handleChange}
                                          value={fieldValue}
                                        />
                                      );
                                  }
                                };

                                return (
                                  <div key={fieldIndex} className="form-field">
                                    <label className="form-label">
                                      {field.label}
                                      {field.required && <span className="required">*</span>}
                                    </label>
                                    {renderFieldInput()}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add-ons Section */}
                {selectedAddOns.length > 0 && (
                  <div className="update-section">
                    <h3 className="update-section-title">Add-ons</h3>
                    <div className="update-services-grid">
                      {selectedAddOns.map((addOn) => {
                        const fields = addOnDetailFields[addOn.key] || [];

                        return (
                          <div key={addOn.key} className="service-detail-card">
                            <h4 className="service-detail-title">{addOn.label}</h4>
                            <div className="service-detail-form">
                              {fields.map((field, fieldIndex) => {
                                const fieldName = `eventDetails[${eventIndex}].addOns.${addOn.key}.${field.name}`;
                                const fieldValue =
                                  formik.values.eventDetails?.[eventIndex]?.addOns?.[addOn.key]?.[
                                    field.name
                                  ] || '';

                                const renderFieldInput = () => {
                                  switch (field.type) {
                                    case 'textarea':
                                      return (
                                        <textarea
                                          name={fieldName}
                                          placeholder={field.placeholder}
                                          className="form-textarea"
                                          rows={field.rows || 3}
                                          onChange={formik.handleChange}
                                          value={fieldValue}
                                        />
                                      );

                                    case 'select':
                                      return (
                                        <Select
                                          options={field.options || []}
                                          value={fieldValue}
                                          onChange={(value) =>
                                            formik.setFieldValue(fieldName, value)
                                          }
                                          placeholder={field.placeholder}
                                        />
                                      );

                                    case 'file':
                                      return (
                                        <>
                                          <input
                                            type="file"
                                            name={fieldName}
                                            accept={field.accept}
                                            multiple={field.multiple}
                                            className="form-input"
                                            onChange={(e) => {
                                              const files = Array.from(e.target.files);
                                              formik.setFieldValue(fieldName, files);
                                            }}
                                          />
                                          {field.helperText && (
                                            <span className="form-helper-text">
                                              {field.helperText}
                                            </span>
                                          )}
                                        </>
                                      );

                                    default:
                                      return (
                                        <input
                                          type={field.type}
                                          name={fieldName}
                                          placeholder={field.placeholder}
                                          className="form-input"
                                          onChange={formik.handleChange}
                                          value={fieldValue}
                                        />
                                      );
                                  }
                                };

                                return (
                                  <div key={fieldIndex} className="form-field">
                                    <label className="form-label">
                                      {field.label}
                                      {field.required && <span className="required">*</span>}
                                    </label>
                                    {renderFieldInput()}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </FormCard>
            );
          })}

          <FormCard
            actions={
              <div className="form-action-buttons">
                <button
                  type="button"
                  onClick={() => navigate('/newevent')}
                  className="btn-secondary"
                >
                  Back to Event Details
                </button>
                <button type="submit" className="btn-primary">
                  Save & Continue
                </button>
              </div>
            }
          />
        </form>

        <GalleryModal
          isOpen={galleryModal.isOpen}
          onClose={closeGalleryModal}
          onSelect={handleGallerySelect}
          galleryPath={`/images/decorations/${galleryModal.theme}`}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
