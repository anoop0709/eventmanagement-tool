import { Select } from '@/components/ui/select/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function FieldRenderer({ field, fieldName, fieldValue, formik, onGalleryOpen }) {
  const renderInput = () => {
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
            onChange={(value) => formik.setFieldValue(fieldName, value)}
            placeholder={field.placeholder}
          />
        );

      case 'gallery-select':
        return (
          <>
            <button type="button" className="gallery-select-btn" onClick={onGalleryOpen}>
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
            {field.helperText && <span className="form-helper-text">{field.helperText}</span>}
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

      case 'datepicker':
        return (
          <DatePicker
            selected={fieldValue ? new Date(fieldValue) : null}
            onChange={(date) => formik.setFieldValue(fieldName, date)}
            showTimeSelect={field.showTimeSelect}
            dateFormat={field.dateFormat || 'dd MMM yyyy, h:mm aa'}
            minDate={field.minDate}
            placeholderText={field.placeholder}
            className="form-input"
            wrapperClassName="datepicker-wrapper"
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
            {field.helperText && <span className="form-helper-text">{field.helperText}</span>}
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
    <div className="form-field">
      <label className="form-label">
        {field.label}
        {field.required && <span className="required">*</span>}
      </label>
      {renderInput()}
    </div>
  );
}
