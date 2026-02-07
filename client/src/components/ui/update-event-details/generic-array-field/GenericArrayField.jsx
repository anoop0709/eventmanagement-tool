import { Select } from '@/components/ui/select/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function GenericArrayField({ field, fieldName, fieldValue, formik }) {
  const items = fieldValue || [];
  const itemLabel = field.itemLabel || 'Item';
  const nestedArrayKey = field.nestedArrayKey || null;
  const nestedArrayLabel = field.nestedArrayLabel || 'Nested Item';

  const handleAddItem = () => {
    const newItem = {};

    // Initialize nested array if exists
    if (nestedArrayKey) {
      newItem[nestedArrayKey] = [];
    }

    field.fields?.forEach((f) => {
      if (!f[nestedArrayKey]) {
        newItem[f.name] = '';
      }
    });

    formik.setFieldValue(fieldName, [...items, newItem]);
  };

  const handleRemoveItem = (itemIndex) => {
    const newItems = items.filter((_, idx) => idx !== itemIndex);
    formik.setFieldValue(fieldName, newItems);
  };

  const handleAddNestedItem = (itemIndex) => {
    if (!nestedArrayKey) return;

    const nestedField = field.fields?.find((f) => f[nestedArrayKey]);
    if (!nestedField) return;

    const newNestedItem = {};
    nestedField[nestedArrayKey].forEach((nf) => {
      newNestedItem[nf.name] = '';
    });

    const currentNestedItems = items[itemIndex][nestedArrayKey] || [];
    formik.setFieldValue(`${fieldName}[${itemIndex}].${nestedArrayKey}`, [
      ...currentNestedItems,
      newNestedItem,
    ]);
  };

  const handleRemoveNestedItem = (itemIndex, nestedIndex) => {
    if (!nestedArrayKey) return;

    const currentNestedItems = items[itemIndex][nestedArrayKey] || [];
    const newNestedItems = currentNestedItems.filter((_, idx) => idx !== nestedIndex);
    formik.setFieldValue(`${fieldName}[${itemIndex}].${nestedArrayKey}`, newNestedItems);
  };

  const renderFieldInput = (fieldConfig, itemFieldName, itemFieldValue) => {
    if (fieldConfig.type === 'select') {
      return (
        <Select
          options={fieldConfig.options || []}
          value={itemFieldValue}
          onChange={(value) => formik.setFieldValue(itemFieldName, value)}
          placeholder={fieldConfig.placeholder}
        />
      );
    }

    if (fieldConfig.type === 'datepicker') {
      return (
        <DatePicker
          selected={itemFieldValue ? new Date(itemFieldValue) : null}
          onChange={(date) => formik.setFieldValue(itemFieldName, date)}
          showTimeSelect={fieldConfig.showTimeSelect}
          dateFormat={fieldConfig.dateFormat || 'dd MMM yyyy, h:mm aa'}
          minDate={fieldConfig.minDate}
          placeholderText={fieldConfig.placeholder}
          className="form-input"
          wrapperClassName="datepicker-wrapper"
        />
      );
    }

    if (fieldConfig.type === 'textarea') {
      return (
        <textarea
          name={itemFieldName}
          placeholder={fieldConfig.placeholder}
          className="form-textarea"
          rows={fieldConfig.rows || 2}
          onChange={formik.handleChange}
          value={itemFieldValue}
        />
      );
    }

    return (
      <input
        type={fieldConfig.type}
        name={itemFieldName}
        placeholder={fieldConfig.placeholder}
        className="form-input"
        onChange={formik.handleChange}
        value={itemFieldValue}
      />
    );
  };

  return (
    <div className="cuisine-array-container">
      {items.map((item, itemIndex) => (
        <div key={itemIndex} className="cuisine-item">
          <div className="cuisine-item-header">
            <h5 className="cuisine-item-title">
              {itemLabel} {itemIndex + 1}
            </h5>
            <button
              type="button"
              className="cuisine-remove-btn"
              onClick={() => handleRemoveItem(itemIndex)}
            >
              Remove
            </button>
          </div>

          <div className="cuisine-fields">
            {field.fields?.map((itemField) => {
              // Handle nested array field
              if (nestedArrayKey && itemField[nestedArrayKey]) {
                const nestedItems = item[nestedArrayKey] || [];
                return (
                  <div key={nestedArrayKey} className="menu-array-container">
                    <label className="form-label menu-section-label">{nestedArrayLabel}s</label>
                    {nestedItems.map((nestedItem, nestedIndex) => (
                      <div key={nestedIndex} className="menu-item">
                        <div className="menu-item-header">
                          <span className="menu-item-number">
                            {nestedArrayLabel} {nestedIndex + 1}
                          </span>
                          <button
                            type="button"
                            className="menu-remove-btn"
                            onClick={() => handleRemoveNestedItem(itemIndex, nestedIndex)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="menu-item-fields">
                          {itemField[nestedArrayKey].map((nestedField) => {
                            const nestedFieldName = `${fieldName}[${itemIndex}].${nestedArrayKey}[${nestedIndex}].${nestedField.name}`;
                            const nestedFieldValue = nestedItem[nestedField.name] || '';

                            return (
                              <div key={nestedField.name} className="form-field">
                                <label className="form-label">
                                  {nestedField.label}
                                  {nestedField.required && <span className="required">*</span>}
                                </label>
                                {renderFieldInput(nestedField, nestedFieldName, nestedFieldValue)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="menu-add-btn"
                      onClick={() => handleAddNestedItem(itemIndex)}
                    >
                      + Add {nestedArrayLabel}
                    </button>
                  </div>
                );
              }

              // Handle regular fields
              const itemFieldName = `${fieldName}[${itemIndex}].${itemField.name}`;
              const itemFieldValue = item[itemField.name] || '';

              return (
                <div key={itemField.name} className="form-field">
                  <label className="form-label">
                    {itemField.label}
                    {itemField.required && <span className="required">*</span>}
                  </label>
                  {renderFieldInput(itemField, itemFieldName, itemFieldValue)}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button type="button" className="cuisine-add-btn" onClick={handleAddItem}>
        <svg
          width="16"
          height="16"
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
        Add {itemLabel}
      </button>
    </div>
  );
}
