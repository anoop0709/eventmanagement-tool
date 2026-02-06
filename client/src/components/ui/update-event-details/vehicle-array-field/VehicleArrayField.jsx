import { Select } from '@/components/ui/select/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function VehicleArrayField({ field, fieldName, fieldValue, formik }) {
  const vehicles = fieldValue || [];

  const handleAddVehicle = () => {
    const newVehicle = {};
    field.vehicleFields?.forEach((vf) => {
      newVehicle[vf.name] = '';
    });
    formik.setFieldValue(fieldName, [...vehicles, newVehicle]);
  };

  const handleRemoveVehicle = (vehicleIndex) => {
    const newVehicles = vehicles.filter((_, idx) => idx !== vehicleIndex);
    formik.setFieldValue(fieldName, newVehicles);
  };

  return (
    <div className="cuisine-array-container">
      {vehicles.map((vehicle, vehicleIndex) => (
        <div key={vehicleIndex} className="cuisine-item">
          <div className="cuisine-item-header">
            <h5 className="cuisine-item-title">Vehicle {vehicleIndex + 1}</h5>
            <button
              type="button"
              className="cuisine-remove-btn"
              onClick={() => handleRemoveVehicle(vehicleIndex)}
            >
              Remove
            </button>
          </div>

          <div className="cuisine-fields">
            {field.vehicleFields?.map((vehicleField) => {
              const vehicleFieldName = `${fieldName}[${vehicleIndex}].${vehicleField.name}`;
              const vehicleFieldValue = vehicle[vehicleField.name] || '';

              return (
                <div key={vehicleField.name} className="form-field">
                  <label className="form-label">
                    {vehicleField.label}
                    {vehicleField.required && <span className="required">*</span>}
                  </label>
                  {vehicleField.type === 'select' ? (
                    <Select
                      options={vehicleField.options || []}
                      value={vehicleFieldValue}
                      onChange={(value) => formik.setFieldValue(vehicleFieldName, value)}
                      placeholder={vehicleField.placeholder}
                    />
                  ) : vehicleField.type === 'datepicker' ? (
                    <DatePicker
                      selected={vehicleFieldValue ? new Date(vehicleFieldValue) : null}
                      onChange={(date) => formik.setFieldValue(vehicleFieldName, date)}
                      showTimeSelect={vehicleField.showTimeSelect}
                      dateFormat={vehicleField.dateFormat || 'dd MMM yyyy, h:mm aa'}
                      minDate={vehicleField.minDate}
                      placeholderText={vehicleField.placeholder}
                      className="form-input"
                      wrapperClassName="datepicker-wrapper"
                    />
                  ) : vehicleField.type === 'textarea' ? (
                    <textarea
                      name={vehicleFieldName}
                      placeholder={vehicleField.placeholder}
                      className="form-textarea"
                      rows={vehicleField.rows || 2}
                      onChange={formik.handleChange}
                      value={vehicleFieldValue}
                    />
                  ) : (
                    <input
                      type={vehicleField.type}
                      name={vehicleFieldName}
                      placeholder={vehicleField.placeholder}
                      className="form-input"
                      onChange={formik.handleChange}
                      value={vehicleFieldValue}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button type="button" className="cuisine-add-btn" onClick={handleAddVehicle}>
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
        Add Vehicle
      </button>
    </div>
  );
}
