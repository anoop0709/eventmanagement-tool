import { FieldRenderer } from '@/components/ui/update-event-details/field-renderer/FieldRenderer';
import { CuisineArrayField } from '@/components/ui/update-event-details/cuisine-array-field/CuisineArrayField';

export function AddOnDetailSection({ addOn, fields, eventIndex, formik, onGalleryOpen }) {
  const renderField = (field, fieldIndex) => {
    const fieldName = `eventDetails[${eventIndex}].addOns.${addOn.key}.${field.name}`;
    const fieldValue =
      formik.values.eventDetails?.[eventIndex]?.addOns?.[addOn.key]?.[field.name] || '';

    if (field.type === 'cuisine-array') {
      return (
        <div key={fieldIndex} className="form-field">
          <label className="form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <CuisineArrayField
            field={field}
            fieldName={fieldName}
            fieldValue={fieldValue}
            formik={formik}
          />
        </div>
      );
    }

    return (
      <FieldRenderer
        key={fieldIndex}
        field={field}
        fieldName={fieldName}
        fieldValue={fieldValue}
        formik={formik}
        onGalleryOpen={() => {
          if (field.type === 'gallery-select') {
            onGalleryOpen(eventIndex, addOn.key, field.name);
          }
        }}
      />
    );
  };

  return (
    <div className="service-detail-card">
      <h4 className="service-detail-title">{addOn.label}</h4>
      <div className="service-detail-form">
        {fields.map((field, fieldIndex) => renderField(field, fieldIndex))}
      </div>
    </div>
  );
}
