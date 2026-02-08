import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FormCard } from '@/components/ui/form-card/FormCard';
import { FormFieldRenderer } from '@/components/ui/form-field-renderer/FormFieldRenderer';
import { MultipleEvents } from '@/components/ui/multiple-events/MultipleEvents';
import { initialEventFormValues } from '../../config/eventFormConfig';
import { formStepsConfig } from '../../config/formStepsConfig';
import { eventAPI } from '@/services/api';
import './CreateEventPage.css';

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const [eventId, setEventId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: initialEventFormValues,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        console.log('Form values:', values);

        // Send exact structure to backend
        const eventData = {
          clientDetails: values.clientDetails || {},
          events: values.events || [],
          status: 'draft',
        };

        console.log('Sending to API:', eventData);

        // On first form submit, create event as draft
        const response = await eventAPI.createEvent(eventData);

        console.log('API response:', response);

        // Store event ID for updates
        setEventId(response.event._id);
        localStorage.setItem('currentEventId', response.event._id);
        localStorage.setItem('eventFormData', JSON.stringify(values));

        // Navigate to update details page
        navigate('/newevent/update-details');
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const currentStepConfig = formStepsConfig.find((s) => s.id === step);

  const handleAction = (action) => {
    switch (action) {
      case 'next':
        setStep(step + 1);
        break;
      case 'back':
        setStep(step - 1);
        break;
      case 'draft':
        handleSaveAsDraft();
        break;
      case 'submit':
        formik.handleSubmit();
        break;
      default:
        break;
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSubmitting(true);
    try {
      // Send exact structure to backend
      const eventData = {
        clientDetails: formik.values.clientDetails || {},
        events: formik.values.events || [],
        status: 'draft',
      };

      if (eventId) {
        // Update existing draft
        await eventAPI.updateEvent(eventId, eventData);
        alert('Draft saved successfully!');
      } else {
        // Create new draft
        const response = await eventAPI.createEvent(eventData);
        setEventId(response.event._id);
        localStorage.setItem('currentEventId', response.event._id);
        alert('Draft created successfully!');
      }
      localStorage.setItem('eventFormData', JSON.stringify(formik.values));
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="create-event-title">Create Event</h1>
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

                  case 'review':
                    return (
                      <>
                        {section.fields.map((field, fieldIndex) => (
                          <FormFieldRenderer
                            key={fieldIndex}
                            field={field}
                            formik={formik}
                            section={section.section}
                          />
                        ))}
                      </>
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
                  {section.subtitle && <p className="form-section-subtitle">{section.subtitle}</p>}
                  {renderSectionContent()}
                </div>
              );
            })}
          </FormCard>
        </form>
      </AppShell>
    </ProtectedRoute>
  );
}
