import DatePicker from 'react-datepicker';
import { Select } from '@/components/ui/select/Select';
import { Review } from '@/components/ui/review/Review';
import 'react-datepicker/dist/react-datepicker.css';
import './FormFieldRenderer.css';

export function FormFieldRenderer({ field, formik, section }) {
  // Helper function to get nested value (supports array notation)
  const getFieldValue = () => {
    const fieldName = getFieldName();

    // Handle array notation like events[0].eventName
    if (fieldName.includes('[')) {
      const parts = fieldName.split(/[[\].]+/).filter(Boolean);
      let value = formik.values;
      for (const part of parts) {
        if (value === undefined || value === null) return '';
        value = value[part];
      }
      return value;
    }

    // Handle simple dot notation
    if (field.name.includes('.')) {
      const [parent, child] = field.name.split('.');
      return formik.values[parent]?.[child];
    }

    return section ? formik.values[section]?.[field.name] : formik.values[field.name];
  };

  // Helper function to get field name for formik
  const getFieldName = () => {
    return field.name.includes('.')
      ? field.name
      : section
        ? `${section}.${field.name}`
        : field.name;
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={field.type}
            name={getFieldName()}
            value={getFieldValue() || ''}
            onChange={formik.handleChange}
            className="form-input"
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <Select
            options={field.options}
            value={getFieldValue()}
            onChange={(value) => formik.setFieldValue(getFieldName(), value)}
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <DatePicker
            selected={getFieldValue()}
            onChange={(date) => formik.setFieldValue(getFieldName(), date)}
            showTimeSelect={field.showTimeSelect}
            minDate={field.minDate}
            dateFormat={field.dateFormat}
            placeholderText={field.placeholder}
            className="form-input datepicker-input"
          />
        );

      case 'checkbox': {
        const fieldName = getFieldName();
        const checkedValue = getFieldValue() || false;

        return (
          <label className="service-card">
            <input
              type="checkbox"
              name={fieldName}
              checked={checkedValue}
              onChange={(e) => formik.setFieldValue(fieldName, e.target.checked)}
              className="service-checkbox"
            />
            <div>
              <span className="service-name">{field.label}</span>
              {field.description && <p className="service-description">{field.description}</p>}
            </div>
          </label>
        );
      }

      case 'review':
        return <Review formValues={formik.values} />;

      default:
        return null;
    }
  };

  if (field.type === 'checkbox' || field.type === 'review') {
    return renderField();
  }

  return (
    <div className={`form-field ${field.fullWidth ? 'form-field-full' : ''}`}>
      <label className="form-label">{field.label}</label>
      {renderField()}
    </div>
  );
}
