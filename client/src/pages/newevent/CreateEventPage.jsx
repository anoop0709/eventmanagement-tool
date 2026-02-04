import { useState } from 'react';
import { useFormik } from 'formik';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FormCard } from '@/components/ui/form-card/FormCard';
import { FormFieldRenderer } from '@/components/ui/form-field-renderer/FormFieldRenderer';
import { initialEventFormValues } from '../../config/eventFormConfig';
import { formStepsConfig } from '../../config/formStepsConfig';
import './CreateEventPage.css';

export default function CreateEventPage() {
  const [step, setStep] = useState(1);

  const formik = useFormik({
    initialValues: initialEventFormValues,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      // Handle form submission (e.g., API call)
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
        console.log('Saving draft...', formik.values);
        break;
      case 'submit':
        formik.handleSubmit();
        break;
      default:
        break;
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
                    >
                      {action.label}
                    </button>
                  ))}
                {currentStepConfig?.actions.primary && (
                  <button
                    type={
                      currentStepConfig.actions.primary.action === 'submit' ? 'submit' : 'button'
                    }
                    onClick={() =>
                      currentStepConfig.actions.primary.action !== 'submit' &&
                      handleAction(currentStepConfig.actions.primary.action)
                    }
                    className="btn-primary"
                  >
                    {currentStepConfig.actions.primary.label}
                  </button>
                )}
              </div>
            }
          >
            {currentStepConfig?.sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && <h3 className="form-section-title">{section.title}</h3>}
                {section.subtitle && <p className="form-section-subtitle">{section.subtitle}</p>}

                {section.type === 'services' ? (
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
                ) : (
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
                )}
              </div>
            ))}
          </FormCard>
        </form>
      </AppShell>
    </ProtectedRoute>
  );
}
