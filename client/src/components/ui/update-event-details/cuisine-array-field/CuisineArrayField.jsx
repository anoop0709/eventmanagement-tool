import { Select } from '@/components/ui/select/Select';

export function CuisineArrayField({ field, fieldName, fieldValue, formik }) {
  const cuisines = fieldValue || [];

  const handleAddCuisine = () => {
    const newCuisine = { menu: [] };
    field.cuisineFields?.forEach((cf) => {
      if (!cf.menu) {
        newCuisine[cf.name] = '';
      }
    });
    formik.setFieldValue(fieldName, [...cuisines, newCuisine]);
  };

  const handleRemoveCuisine = (cuisineIndex) => {
    const newCuisines = cuisines.filter((_, idx) => idx !== cuisineIndex);
    formik.setFieldValue(fieldName, newCuisines);
  };

  const handleAddMenu = (cuisineIndex) => {
    const menuField = field.cuisineFields?.find((cf) => cf.menu);
    if (!menuField) return;

    const newMenuItem = {};
    menuField.menu.forEach((mf) => {
      newMenuItem[mf.name] = '';
    });

    const currentMenuItems = cuisines[cuisineIndex].menu || [];
    formik.setFieldValue(`${fieldName}[${cuisineIndex}].menu`, [...currentMenuItems, newMenuItem]);
  };

  const handleRemoveMenu = (cuisineIndex, menuIndex) => {
    const currentMenuItems = cuisines[cuisineIndex].menu || [];
    const newMenuItems = currentMenuItems.filter((_, idx) => idx !== menuIndex);
    formik.setFieldValue(`${fieldName}[${cuisineIndex}].menu`, newMenuItems);
  };

  return (
    <div className="cuisine-array-container">
      {cuisines.map((cuisine, cuisineIndex) => (
        <div key={cuisineIndex} className="cuisine-item">
          <div className="cuisine-item-header">
            <h5 className="cuisine-item-title">Cuisine {cuisineIndex + 1}</h5>
            <button
              type="button"
              className="cuisine-remove-btn"
              onClick={() => handleRemoveCuisine(cuisineIndex)}
            >
              Remove
            </button>
          </div>

          <div className="cuisine-fields">
            {field.cuisineFields?.map((cuisineField) => {
              // Handle menu array field type
              if (cuisineField.menu) {
                const menuItems = cuisine.menu || [];
                return (
                  <div key="menu" className="menu-array-container">
                    <label className="form-label menu-section-label">Menu Items</label>
                    {menuItems.map((menuItem, menuIndex) => (
                      <div key={menuIndex} className="menu-item">
                        <div className="menu-item-header">
                          <span className="menu-item-number">Menu {menuIndex + 1}</span>
                          <button
                            type="button"
                            className="menu-remove-btn"
                            onClick={() => handleRemoveMenu(cuisineIndex, menuIndex)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="menu-item-fields">
                          {cuisineField.menu.map((menuField) => {
                            const menuFieldName = `${fieldName}[${cuisineIndex}].menu[${menuIndex}].${menuField.name}`;
                            const menuFieldValue = menuItem[menuField.name] || '';

                            return (
                              <div key={menuField.name} className="form-field">
                                <label className="form-label">
                                  {menuField.label}
                                  {menuField.required && <span className="required">*</span>}
                                </label>
                                {menuField.type === 'select' ? (
                                  <Select
                                    options={menuField.options || []}
                                    value={menuFieldValue}
                                    onChange={(value) => formik.setFieldValue(menuFieldName, value)}
                                    placeholder={menuField.placeholder}
                                  />
                                ) : menuField.type === 'textarea' ? (
                                  <textarea
                                    name={menuFieldName}
                                    placeholder={menuField.placeholder}
                                    className="form-textarea"
                                    rows={menuField.rows || 2}
                                    onChange={formik.handleChange}
                                    value={menuFieldValue}
                                  />
                                ) : (
                                  <input
                                    type={menuField.type}
                                    name={menuFieldName}
                                    placeholder={menuField.placeholder}
                                    className="form-input"
                                    onChange={formik.handleChange}
                                    value={menuFieldValue}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="menu-add-btn"
                      onClick={() => handleAddMenu(cuisineIndex)}
                    >
                      + Add Menu
                    </button>
                  </div>
                );
              }

              // Handle regular fields
              const cuisineFieldName = `${fieldName}[${cuisineIndex}].${cuisineField.name}`;
              const cuisineFieldValue = cuisine[cuisineField.name] || '';

              return (
                <div key={cuisineField.name} className="form-field">
                  <label className="form-label">
                    {cuisineField.label}
                    {cuisineField.required && <span className="required">*</span>}
                  </label>
                  {cuisineField.type === 'select' ? (
                    <Select
                      options={cuisineField.options || []}
                      value={cuisineFieldValue}
                      onChange={(value) => formik.setFieldValue(cuisineFieldName, value)}
                      placeholder={cuisineField.placeholder}
                    />
                  ) : (
                    <input
                      type={cuisineField.type}
                      name={cuisineFieldName}
                      placeholder={cuisineField.placeholder}
                      className="form-input"
                      onChange={formik.handleChange}
                      value={cuisineFieldValue}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button type="button" className="cuisine-add-btn" onClick={handleAddCuisine}>
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
        Add Cuisine
      </button>
    </div>
  );
}
