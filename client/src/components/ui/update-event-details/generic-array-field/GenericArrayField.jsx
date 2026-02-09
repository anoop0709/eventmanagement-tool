import { useState } from 'react';
import { Select } from '@/components/ui/select/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './GenericArrayField.css';

export function GenericArrayField({ field, fieldName, fieldValue, formik }) {
  const items = fieldValue || [];
  const itemLabel = field.itemLabel || 'Item';
  const nestedArrayKey = field.nestedArrayKey || null;
  const nestedArrayLabel = field.nestedArrayLabel || 'Nested Item';

  // Initialize empty nested item
  const getEmptyNestedItem = () => {
    const nestedField = field.fields?.find((f) => f[nestedArrayKey]);
    if (!nestedField) return {};

    const newNestedItem = {};
    nestedField[nestedArrayKey].forEach((nf) => {
      newNestedItem[nf.name] = '';
    });
    return newNestedItem;
  };

  // Initialize empty form state
  const getEmptyItem = () => {
    const newItem = {};
    if (nestedArrayKey) {
      newItem[nestedArrayKey] = [];
    }
    field.fields?.forEach((f) => {
      if (!f[nestedArrayKey]) {
        newItem[f.name] = '';
      }
    });
    return newItem;
  };

  const [currentItem, setCurrentItem] = useState(getEmptyItem());
  const [editingNestedItems, setEditingNestedItems] = useState({});
  const [currentNestedForm, setCurrentNestedForm] = useState(getEmptyNestedItem());

  const handleAddItem = () => {
    // Validate that at least one field is filled
    const hasValue = field.fields?.some((f) => {
      if (f[nestedArrayKey]) return false;
      return currentItem[f.name] && currentItem[f.name] !== '';
    });

    if (!hasValue && !nestedArrayKey) {
      return;
    }

    formik.setFieldValue(fieldName, [...items, currentItem]);
    setCurrentItem(getEmptyItem());
    setCurrentNestedForm(getEmptyNestedItem());
  };

  const handleAddNestedToCurrentItem = () => {
    if (!nestedArrayKey) return;

    const nestedField = field.fields?.find((f) => f[nestedArrayKey]);
    if (!nestedField) return;

    // Validate that at least one field is filled
    const hasValue = nestedField[nestedArrayKey].some((nf) => {
      return currentNestedForm[nf.name] && currentNestedForm[nf.name] !== '';
    });

    if (!hasValue) return;

    const currentNestedItems = currentItem[nestedArrayKey] || [];
    setCurrentItem((prev) => ({
      ...prev,
      [nestedArrayKey]: [...currentNestedItems, currentNestedForm],
    }));
    setCurrentNestedForm(getEmptyNestedItem());
  };

  const handleRemoveNestedFromCurrentItem = (nestedIndex) => {
    if (!nestedArrayKey) return;

    const currentNestedItems = currentItem[nestedArrayKey] || [];
    const newNestedItems = currentNestedItems.filter((_, idx) => idx !== nestedIndex);
    setCurrentItem((prev) => ({
      ...prev,
      [nestedArrayKey]: newNestedItems,
    }));
  };

  const handleCurrentNestedFormChange = (fieldName, value) => {
    setCurrentNestedForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleRemoveItem = (itemIndex) => {
    const newItems = items.filter((_, idx) => idx !== itemIndex);
    formik.setFieldValue(fieldName, newItems);
  };

  const handleCurrentItemChange = (fieldName, value) => {
    setCurrentItem((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleAddNestedItem = (itemIndex) => {
    if (!nestedArrayKey) return;

    const currentNestedForm = editingNestedItems[itemIndex] || getEmptyNestedItem();
    const nestedField = field.fields?.find((f) => f[nestedArrayKey]);
    if (!nestedField) return;

    // Validate that at least one field is filled
    const hasValue = nestedField[nestedArrayKey].some((nf) => {
      return currentNestedForm[nf.name] && currentNestedForm[nf.name] !== '';
    });

    if (!hasValue) return;

    const currentNestedItems = items[itemIndex][nestedArrayKey] || [];
    formik.setFieldValue(`${fieldName}[${itemIndex}].${nestedArrayKey}`, [
      ...currentNestedItems,
      currentNestedForm,
    ]);

    setEditingNestedItems((prev) => ({
      ...prev,
      [itemIndex]: getEmptyNestedItem(),
    }));
  };

  const handleRemoveNestedItem = (itemIndex, nestedIndex) => {
    if (!nestedArrayKey) return;

    const currentNestedItems = items[itemIndex][nestedArrayKey] || [];
    const newNestedItems = currentNestedItems.filter((_, idx) => idx !== nestedIndex);
    formik.setFieldValue(`${fieldName}[${itemIndex}].${nestedArrayKey}`, newNestedItems);
  };

  const handleNestedItemChange = (itemIndex, fieldName, value) => {
    setEditingNestedItems((prev) => ({
      ...prev,
      [itemIndex]: {
        ...(prev[itemIndex] || getEmptyNestedItem()),
        [fieldName]: value,
      },
    }));
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
          value={value}
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
        value={value}
      />
    );
  };

  return (
    <div className="cuisine-array-container">
      {/* Input Form */}
      <div className="cuisine-item cuisine-input-form">
        <div className="cuisine-item-header">
          <h5 className="cuisine-item-title">Add New {itemLabel}</h5>
        </div>

        <div className="cuisine-fields">
          {field.fields?.map((itemField) => {
            // Handle nested array field in the main form
            if (nestedArrayKey && itemField[nestedArrayKey]) {
              const currentNestedItems = currentItem[nestedArrayKey] || [];

              return (
                <div key={nestedArrayKey} className="nested-array-section main-form-nested">
                  <label className="form-label nested-section-label">{nestedArrayLabel}s</label>

                  {/* Nested Input Form */}
                  <div className="nested-input-form">
                    <div className="nested-form-fields">
                      {itemField[nestedArrayKey].map((nestedField) => {
                        const nestedFieldValue = currentNestedForm[nestedField.name] || '';

                        return (
                          <div key={nestedField.name} className="form-field">
                            <label className="form-label">
                              {nestedField.label}
                              {nestedField.required && <span className="required">*</span>}
                            </label>
                            {renderFieldInput(
                              nestedField,
                              nestedField.name,
                              nestedFieldValue,
                              (value) => handleCurrentNestedFormChange(nestedField.name, value)
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className="menu-add-btn"
                      onClick={handleAddNestedToCurrentItem}
                    >
                      + Add {nestedArrayLabel}
                    </button>
                  </div>

                  {/* List of Added Nested Items */}
                  {currentNestedItems.length > 0 && (
                    <div className="nested-items-list">
                      {currentNestedItems.map((nestedItem, nestedIndex) => (
                        <div key={nestedIndex} className="nested-item-card">
                          <div className="nested-item-header">
                            <span className="nested-item-number">
                              {nestedArrayLabel} {nestedIndex + 1}
                            </span>
                            <button
                              type="button"
                              className="menu-remove-btn"
                              onClick={() => handleRemoveNestedFromCurrentItem(nestedIndex)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="nested-item-content">
                            {itemField[nestedArrayKey].map((nestedField) => {
                              const value = nestedItem[nestedField.name];
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
              );
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
                  currentItem[itemField.name] || '',
                  (value) => handleCurrentItemChange(itemField.name, value)
                )}
              </div>
            );
          })}
        </div>

        <button type="button" className="array-add-btn" onClick={handleAddItem}>
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

      {/* List of Added Items */}
      {items.length > 0 && (
        <div className="added-items-list">
          <h5 className="added-items-title">Added {itemLabel}s</h5>
          {items.map((item, itemIndex) => (
            <div key={itemIndex} className="added-item-card">
              <div className="added-item-header">
                <span className="added-item-number">
                  {itemLabel} {itemIndex + 1}
                </span>
                <button
                  type="button"
                  className="cuisine-remove-btn"
                  onClick={() => handleRemoveItem(itemIndex)}
                >
                  Remove
                </button>
              </div>

              <div className="added-item-content">
                {field.fields?.map((itemField) => {
                  // Handle nested array field
                  if (nestedArrayKey && itemField[nestedArrayKey]) {
                    const nestedItems = item[nestedArrayKey] || [];
                    const currentNestedForm = editingNestedItems[itemIndex] || getEmptyNestedItem();

                    return (
                      <div key={nestedArrayKey} className="nested-array-section">
                        <label className="form-label nested-section-label">
                          {nestedArrayLabel}s
                        </label>

                        {/* Nested Input Form */}
                        <div className="nested-input-form">
                          <div className="nested-form-fields">
                            {itemField[nestedArrayKey].map((nestedField) => {
                              const nestedFieldValue = currentNestedForm[nestedField.name] || '';

                              return (
                                <div key={nestedField.name} className="form-field">
                                  <label className="form-label">
                                    {nestedField.label}
                                    {nestedField.required && <span className="required">*</span>}
                                  </label>
                                  {renderFieldInput(
                                    nestedField,
                                    nestedField.name,
                                    nestedFieldValue,
                                    (value) =>
                                      handleNestedItemChange(itemIndex, nestedField.name, value)
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            className="menu-add-btn"
                            onClick={() => handleAddNestedItem(itemIndex)}
                          >
                            + Add {nestedArrayLabel}
                          </button>
                        </div>

                        {/* List of Added Nested Items */}
                        {nestedItems.length > 0 && (
                          <div className="nested-items-list">
                            {nestedItems.map((nestedItem, nestedIndex) => (
                              <div key={nestedIndex} className="nested-item-card">
                                <div className="nested-item-header">
                                  <span className="nested-item-number">
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
                                <div className="nested-item-content">
                                  {itemField[nestedArrayKey].map((nestedField) => {
                                    const value = nestedItem[nestedField.name];
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
                    );
                  }

                  // Display regular fields
                  const value = item[itemField.name];
                  if (!value) return null;

                  return (
                    <div key={itemField.name} className="item-field-display">
                      <span className="field-label">{itemField.label}:</span>
                      <span className="field-value">
                        {itemField.type === 'datepicker' && value
                          ? new Date(value).toLocaleString()
                          : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
