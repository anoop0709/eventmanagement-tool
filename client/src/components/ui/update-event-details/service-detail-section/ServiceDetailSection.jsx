import { SectionFieldRenderer } from '@/components/ui/update-event-details/section-field-renderer/SectionFieldRenderer';
import { GenericArrayField } from '@/components/ui/update-event-details/generic-array-field/GenericArrayField';

export function ServiceDetailSection({ service, fields, eventIndex, formik, onGalleryOpen }) {
  const renderField = (field, fieldIndex) => {
    const fieldName = `eventDetails[${eventIndex}].services.${service.key}.${field.name}`;
    const fieldValue =
      formik.values.eventDetails?.[eventIndex]?.services?.[service.key]?.[field.name] || '';

    if (field.type === 'array') {
      return (
        <div key={fieldIndex} className="form-field">
          <label className="form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <GenericArrayField
            field={field}
            fieldName={fieldName}
            fieldValue={fieldValue}
            formik={formik}
          />
        </div>
      );
    }

    return (
      <SectionFieldRenderer
        key={fieldIndex}
        field={field}
        fieldName={fieldName}
        fieldValue={fieldValue}
        formik={formik}
        onGalleryOpen={() => {
          if (field.type === 'gallery-select') {
            onGalleryOpen(eventIndex, service.key, field.name);
          }
        }}
      />
    );
  };

  return (
    <div className="service-detail-card">
      <h4 className="service-detail-title">{service.label}</h4>
      <div className="service-detail-form">
        {fields.map((field, fieldIndex) => renderField(field, fieldIndex))}
      </div>
    </div>
  );
}
