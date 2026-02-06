import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FormCard } from '@/components/ui/form-card/FormCard';
import { GalleryModal } from '@/components/ui/update-event-details/gallery-modal/GalleryModal';
import { ServiceDetailSection } from '@/components/ui/update-event-details/service-detail-section/ServiceDetailSection';
import { AddOnDetailSection } from '@/components/ui/update-event-details/addon-detail-section/AddOnDetailSection';
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

      // Merge eventDetails back into the corresponding events
      const updatedEvents = eventFormData.events?.map((event, index) => ({
        ...event,
        eventDetails: values.eventDetails?.[index] || {},
      }));

      const updatedData = {
        ...eventFormData,
        events: updatedEvents,
      };

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
          Add more details for each selected services and add-ons
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
                <div className="event-overview">
                  <h3>{event.eventName}</h3>
                  <p>
                    <strong>Event Type:</strong> {event.eventType}
                  </p>
                  <p>
                    <strong>Date & Time:</strong>
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
