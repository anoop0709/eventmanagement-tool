import { useState } from 'react';
import { Select } from '@/components/ui/select/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './NestedFormField.css';

export function NestedFormField({ field, fieldName, fieldValue, formik }) {
  const nestedArrayKey = field.nestedArrayKey || null;
  const nestedArrayLabel = field.nestedArrayLabel || 'Item';
  const currentValue = fieldValue || {};
  const menuItems = currentValue[nestedArrayKey] || [];

  // State for the menu form only
  const [currentMenuItem, setCurrentMenuItem] = useState({});

  const handleFieldChange = (name, value) => {
    const newValue = {
      ...currentValue,
      [name]: value,
    };
    formik.setFieldValue(fieldName, newValue);
  };

  const handleMenuItemChange = (name, value) => {
    setCurrentMenuItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMenuItem = () => {
    const nestedField = field.fields?.find((f) => f[nestedArrayKey]);
    if (!nestedField) return;

    // Validate that at least one field is filled
    const hasValue = nestedField[nestedArrayKey].some((nf) => {
      return currentMenuItem[nf.name] && currentMenuItem[nf.name] !== '';
    });

    if (!hasValue) return;

    const newValue = {
      ...currentValue,
      [nestedArrayKey]: [...menuItems, currentMenuItem],
    };
    formik.setFieldValue(fieldName, newValue);
    setCurrentMenuItem({});
  };

  const handleRemoveMenuItem = (index) => {
    const newMenuItems = menuItems.filter((_, idx) => idx !== index);
    const newValue = {
      ...currentValue,
      [nestedArrayKey]: newMenuItems,
    };
    formik.setFieldValue(fieldName, newValue);
  };

  const renderFieldInput = (fieldConfig, name, value, onChange) => {
    if (fieldConfig.type === 'select') {
      return (
        <Select
          options={fieldConfig.options || []}
          value={value}
          onChange={onChange}
          placeholder={fieldConfig.placeholder}
        />
      );
    }

    if (fieldConfig.type === 'datepicker') {
      return (
        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={onChange}
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
          name={name}
          placeholder={fieldConfig.placeholder}
          className="form-textarea"
          rows={fieldConfig.rows || 2}
          onChange={(e) => onChange(e.target.value)}
          value={value || ''}
        />
      );
    }

    return (
      <input
        type={fieldConfig.type}
        name={name}
        placeholder={fieldConfig.placeholder}
        className="form-input"
        onChange={(e) => onChange(e.target.value)}
        value={value || ''}
      />
    );
  };

  return (
    <div className="nested-form-container">
      {/* Main Form Fields */}
      <div className="main-form-fields">
        {field.fields?.map((itemField) => {
          // Skip nested array field
          if (nestedArrayKey && itemField[nestedArrayKey]) {
            return null;
          }

          return (
            <div key={itemField.name} className="form-field">
              <label className="form-label">
                {itemField.label}
                {itemField.required && <span className="required">*</span>}
              </label>
              {renderFieldInput(
                itemField,
                itemField.name,
                currentValue[itemField.name] || '',
                (value) => handleFieldChange(itemField.name, value)
              )}
            </div>
          );
        })}
      </div>

      {/* Nested Array Section (Menu Items) */}
      {nestedArrayKey && (
        <div className="nested-array-section">
          <label className="form-label nested-section-label">{nestedArrayLabel}s</label>

          {/* Menu Input Form */}
          <div className="nested-input-form">
            <div className="nested-form-fields">
              {field.fields
                ?.find((f) => f[nestedArrayKey])
                ?.[nestedArrayKey]?.map((nestedField) => {
                  const nestedFieldValue = currentMenuItem[nestedField.name] || '';

                  return (
                    <div key={nestedField.name} className="form-field">
                      <label className="form-label">
                        {nestedField.label}
                        {nestedField.required && <span className="required">*</span>}
                      </label>
                      {renderFieldInput(nestedField, nestedField.name, nestedFieldValue, (value) =>
                        handleMenuItemChange(nestedField.name, value)
                      )}
                    </div>
                  );
                })}
            </div>
            <button type="button" className="menu-add-btn" onClick={handleAddMenuItem}>
              + Add {nestedArrayLabel}
            </button>
          </div>

          {/* List of Added Menu Items */}
          {menuItems.length > 0 && (
            <div className="nested-items-list">
              <h6 className="added-items-subtitle">Added {nestedArrayLabel}s</h6>
              {menuItems.map((menuItem, index) => (
                <div key={index} className="nested-item-card">
                  <div className="nested-item-header">
                    <span className="nested-item-number">
                      {nestedArrayLabel} {index + 1}
                    </span>
                    <button
                      type="button"
                      className="menu-remove-btn"
                      onClick={() => handleRemoveMenuItem(index)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="nested-item-content">
                    {field.fields
                      ?.find((f) => f[nestedArrayKey])
                      ?.[nestedArrayKey]?.map((nestedField) => {
                        const value = menuItem[nestedField.name];
                        if (!value) return null;

                        return (
                          <div key={nestedField.name} className="item-field-display">
                            <span className="field-label">{nestedField.label}:</span>
                            <span className="field-value">{value}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
