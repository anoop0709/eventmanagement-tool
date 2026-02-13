import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FormCard } from '@/components/ui/form-card/FormCard';
import { FormFieldRenderer } from '@/components/ui/form-field-renderer/FormFieldRenderer';
import { MultipleEvents } from '@/components/ui/multiple-events/MultipleEvents';
import { GalleryModal } from '@/components/ui/update-event-details/gallery-modal/GalleryModal';
import { ServiceDetailSection } from '@/components/ui/update-event-details/service-detail-section/ServiceDetailSection';
import { AddOnDetailSection } from '@/components/ui/update-event-details/addon-detail-section/AddOnDetailSection';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog/ConfirmationDialog';
import { serviceDetailFields, addOnDetailFields } from '@/config/updateDetailsConfig';
import { initialEventFormValues } from '../../config/eventFormConfig';
import { formStepsConfig } from '../../config/formStepsConfig';
import { eventAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/context/SnackbarContext';
import './CreateEventPage.css';
import './UpdateDetailsPage.css';

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const [eventId, setEventId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    eventIndex: null,
    serviceKey: null,
    fieldName: null,
    theme: null,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      ...initialEventFormValues,
      eventDetails: {},
    },
    onSubmit: async () => {
      // Show confirmation dialog instead of submitting directly
      setShowConfirmDialog(true);
    },
  });

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    try {
      // Prepare final submission data with eventDetails merged into events
      const eventData = {
        clientDetails: formik.values.clientDetails || {},
        events:
          formik.values.events?.map((event, index) => ({
            ...event,
            eventDetails: {
              ...event.eventDetails,
              ...formik.values.eventDetails?.[index],
            },
          })) || [],
        status: 'pending',
      };

      if (eventId) {
        await eventAPI.updateEvent(eventId, eventData);
        showSnackbar('Event submitted successfully! Email sent to customer.', 'success');
      } else {
        await eventAPI.createEvent(eventData);
        showSnackbar('Event submitted successfully! Email sent to customer.', 'success');
      }

      // Clear local storage
      localStorage.removeItem('currentEventId');
      localStorage.removeItem('eventFormData');

      // Navigate based on user role
      if (user?.isAdmin) {
        navigate('/');
      } else {
        navigate('/events');
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      showSnackbar('Something went wrong', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load existing event if in edit mode
  useEffect(() => {
    const editEventId = searchParams.get('edit');
    if (editEventId) {
      setIsEditMode(true);
      setEventId(editEventId);
      loadEventData(editEventId);
    } else {
      // Check for saved event in localStorage
      const savedEventId = localStorage.getItem('currentEventId');
      if (savedEventId) {
        setEventId(savedEventId);
        loadEventData(savedEventId);
      } else {
        setLoading(false);
      }
    }
  }, [searchParams]);

  const loadEventData = async (id) => {
    try {
      setLoading(true);
      const eventData = await eventAPI.getEventById(id);

      // Build initial values from existing eventDetails
      const initialEventDetails = {};
      eventData.events?.forEach((event, index) => {
        if (event.eventDetails) {
          initialEventDetails[index] = event.eventDetails;
        }
      });

      // Pre-populate form with existing event data
      formik.setValues({
        clientDetails: eventData.clientDetails || initialEventFormValues.clientDetails,
        events: eventData.events || initialEventFormValues.events,
        eventDetails: initialEventDetails,
      });
    } catch (error) {
      console.error('Error loading event:', error);
      showSnackbar('Something went wrong', 'error');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const currentStepConfig = formStepsConfig.find((s) => s.id === step);

  const handleAction = (action) => {
    switch (action) {
      case 'next':
        // Auto-save as draft when moving to next step
        handleSaveAsDraft(false, () => setStep(step + 1));
        break;
      case 'back':
        setStep(step - 1);
        break;
      case 'draft':
        handleSaveAsDraft(true);
        break;
      case 'submit':
        formik.handleSubmit();
        break;
      default:
        break;
    }
  };

  const handleSaveAsDraft = async (shouldNavigate = true, callback = null) => {
    setIsSubmitting(true);
    try {
      // Prepare event data with current eventDetails
      const eventData = {
        clientDetails: formik.values.clientDetails || {},
        events:
          formik.values.events?.map((event, index) => ({
            ...event,
            eventDetails: {
              ...event.eventDetails,
              ...formik.values.eventDetails?.[index],
            },
          })) || [],
        status: 'draft',
      };

      if (eventId) {
        // Update existing draft
        await eventAPI.updateEvent(eventId, eventData);
        if (shouldNavigate) {
          showSnackbar('Event draft saved successfully', 'success');
        }
      } else {
        // Create new draft
        const response = await eventAPI.createEvent(eventData);
        setEventId(response.event._id);
        localStorage.setItem('currentEventId', response.event._id);
        if (shouldNavigate) {
          showSnackbar('Draft created successfully!', 'success');
        }
      }

      if (callback) {
        callback();
      } else if (shouldNavigate) {
        navigate('/events');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      showSnackbar('Something went wrong', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for step 3 (service details)
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getSelectedServices = (services) => {
    if (!services) return [];
    return Object.entries(services)
      .filter(([, value]) => value === true)
      .map(([key]) => ({ key, label: formatLabel(key) }));
  };

  const getSelectedAddOns = (addOns) => {
    if (!addOns) return [];
    return Object.entries(addOns)
      .filter(([, value]) => value === true)
      .map(([key]) => ({ key, label: formatLabel(key) }));
  };

  const openGalleryModal = (eventIndex, serviceKey, fieldName) => {
    let theme = formik.values.eventDetails?.[eventIndex]?.services?.[serviceKey]?.theme || '';

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

  const handleGallerySelect = (selectedImages) => {
    const { eventIndex, serviceKey, fieldName } = galleryModal;
    const fieldPath = `eventDetails[${eventIndex}].services.${serviceKey}.${fieldName}`;
    formik.setFieldValue(fieldPath, selectedImages);
    closeGalleryModal();
  };

  // Show loading state while fetching event data
  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="create-event-loading">Loading event data...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="create-event-title">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
        <p className="create-event-subtitle">{currentStepConfig?.subtitle}</p>

        {/* Stepper Indicator */}
        <div className="create-event-stepper">
          {formStepsConfig.map((stepConfig, index) => (
            <>
              <div className="stepper-item" key={stepConfig.id}>
                <div className={`stepper-number ${step === stepConfig.id ? 'active' : ''}`}>
                  {stepConfig.id}
                </div>
                <span className={`stepper-label ${step === stepConfig.id ? 'active' : ''}`}>
                  {stepConfig.title}
                </span>
              </div>
              {index < formStepsConfig.length - 1 && (
                <div className="stepper-divider" key={`divider-${stepConfig.id}`} />
              )}
            </>
          ))}
        </div>

        <form onSubmit={formik.handleSubmit}>
          {step === 3 ? (
            // Step 3: Service Details - Render each event with selected services
            <>
              {formik.values.events
                ?.filter((event) => {
                  const hasServices =
                    event.services && Object.values(event.services).some((val) => val === true);
                  const hasAddOns =
                    event.addOns && Object.values(event.addOns).some((val) => val === true);
                  return hasServices || hasAddOns;
                })
                .map((event, eventIndex) => {
                  const selectedServices = getSelectedServices(event.services);
                  const selectedAddOns = getSelectedAddOns(event.addOns);

                  return (
                    <FormCard
                      key={eventIndex}
                      title={`Event ${eventIndex + 1}${event.eventName ? ` - ${event.eventName}` : ''}`}
                      subtitle={`${event.eventType || 'Event'} details`}
                    >
                      <div className="event-overview">
                        <h3>{event.eventName}</h3>
                        <p>
                          <strong>Event Type:</strong> {event.eventType}
                        </p>
                        <p>
                          <strong>Date & Time:</strong>{' '}
                          {new Date(event.eventDate).toLocaleString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                        <p>
                          <strong>Number of Guests:</strong> {event.guestCount}
                        </p>
                        <p>
                          <strong>Venue:</strong> {event.venue}
                        </p>
                        <p>
                          <strong>Post Code:</strong> {event.postCode}
                        </p>
                      </div>

                      {/* Services Section */}
                      {selectedServices.length > 0 && (
                        <div className="update-section">
                          <h3 className="update-section-title">Services</h3>
                          <div className="update-services-grid">
                            {selectedServices.map((service) => {
                              const fields = serviceDetailFields[service.key] || [];
                              return (
                                <ServiceDetailSection
                                  key={service.key}
                                  service={service}
                                  fields={fields}
                                  eventIndex={eventIndex}
                                  formik={formik}
                                  onGalleryOpen={openGalleryModal}
                                />
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
                                <AddOnDetailSection
                                  key={addOn.key}
                                  addOn={addOn}
                                  fields={fields}
                                  eventIndex={eventIndex}
                                  formik={formik}
                                  onGalleryOpen={openGalleryModal}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </FormCard>
                  );
                })}

              {/* Action buttons for step 3 */}
              <FormCard
                actions={
                  <div className="form-action-buttons">
                    {currentStepConfig?.actions.secondary &&
                      currentStepConfig?.actions.secondary.map((action, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAction(action.action)}
                          className="btn-secondary"
                          disabled={isSubmitting}
                        >
                          {action.label}
                        </button>
                      ))}
                    {currentStepConfig?.actions.primary && (
                      <button
                        type={
                          currentStepConfig.actions.primary.action === 'submit'
                            ? 'submit'
                            : 'button'
                        }
                        onClick={(e) => {
                          if (currentStepConfig.actions.primary.action !== 'submit') {
                            e.preventDefault();
                            handleAction(currentStepConfig.actions.primary.action);
                          }
                        }}
                        className="btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : currentStepConfig.actions.primary.label}
                      </button>
                    )}
                  </div>
                }
              />
            </>
          ) : (
            // Steps 1 & 2: Regular form rendering
            <FormCard
              actions={
                <div className="form-action-buttons">
                  {currentStepConfig?.actions.secondary &&
                    currentStepConfig?.actions.secondary.map((action, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAction(action.action)}
                        className="btn-secondary"
                        disabled={isSubmitting}
                      >
                        {action.label}
                      </button>
                    ))}
                  {currentStepConfig?.actions.primary && (
                    <button
                      type={
                        currentStepConfig.actions.primary.action === 'submit' ? 'submit' : 'button'
                      }
                      onClick={(e) => {
                        if (currentStepConfig.actions.primary.action !== 'submit') {
                          e.preventDefault();
                          handleAction(currentStepConfig.actions.primary.action);
                        }
                      }}
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : currentStepConfig.actions.primary.label}
                    </button>
                  )}
                </div>
              }
            >
              {currentStepConfig?.sections.map((section, sectionIndex) => {
                const renderSectionContent = () => {
                  switch (section.type) {
                    case 'services':
                      return (
                        <div className="services-grid">
                          {section.fields.map((field, fieldIndex) => (
                            <FormFieldRenderer
                              key={fieldIndex}
                              field={field}
                              formik={formik}
                              section={section.section}
                            />
                          ))}
                        </div>
                      );

                    case 'multiple-events':
                      return (
                        <MultipleEvents
                          fields={section.fields}
                          servicesFields={section.servicesFields}
                          addOnsFields={section.addOnsFields}
                          formik={formik}
                          section={section.section}
                        />
                      );

                    default:
                      return (
                        <>
                          <div className="form-grid">
                            {section.fields.map((field, fieldIndex) => (
                              <FormFieldRenderer
                                key={fieldIndex}
                                field={field}
                                formik={formik}
                                section={section.section}
                              />
                            ))}
                          </div>
                          {sectionIndex < currentStepConfig.sections.length - 1 && (
                            <div className="form-divider" />
                          )}
                        </>
                      );
                  }
                };

                return (
                  <div key={sectionIndex}>
                    {section.title && <h3 className="form-section-title">{section.title}</h3>}
                    {section.subtitle && (
                      <p className="form-section-subtitle">{section.subtitle}</p>
                    )}
                    {renderSectionContent()}
                  </div>
                );
              })}
            </FormCard>
          )}
        </form>

        {/* Gallery Modal */}
        <GalleryModal
          isOpen={galleryModal.isOpen}
          onClose={closeGalleryModal}
          onSelect={handleGallerySelect}
          galleryPath={`/images/decorations/${galleryModal.theme}`}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          title="Confirm Submission"
          message={`Is the form ready to share with the customer?\n\nPlease confirm that:\n✓ All sections are completed\n✓ Budget has been finalized\n\nIf not ready yet, please save as draft and complete the remaining details.`}
          confirmText="Yes, Submit"
          cancelText="Save as Draft Instead"
        />
      </AppShell>
    </ProtectedRoute>
  );
}
