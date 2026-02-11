// Utility functions for budget calculations

// Parse budget string to number (handles formats like "₹20,000", "20000", "$20,000")
const parseBudgetValue = (budgetString) => {
  if (!budgetString) return 0;
  if (typeof budgetString === 'number') return budgetString;
  
  // Remove currency symbols, commas, and spaces
  const cleanString = String(budgetString).replace(/[₹$,\s]/g, '');
  const number = parseFloat(cleanString);
  
  return isNaN(number) ? 0 : number;
};

// Calculate total budget for a single event
export const calculateEventBudget = (event) => {
  let total = 0;
  const breakdown = {
    services: {},
    addOns: {},
    servicesTotal: 0,
    addOnsTotal: 0,
  };

  // Calculate services budget
  if (event.eventDetails?.services) {
    Object.entries(event.eventDetails.services).forEach(([serviceKey, serviceData]) => {
      if (serviceData && typeof serviceData === 'object' && serviceData.budget) {
        const budgetValue = parseBudgetValue(serviceData.budget);
        breakdown.services[serviceKey] = budgetValue;
        breakdown.servicesTotal += budgetValue;
      }
    });
  }

  // Calculate add-ons budget
  if (event.eventDetails?.addOns) {
    Object.entries(event.eventDetails.addOns).forEach(([addonKey, addonData]) => {
      if (addonData && typeof addonData === 'object' && addonData.budget) {
        const budgetValue = parseBudgetValue(addonData.budget);
        breakdown.addOns[addonKey] = budgetValue;
        breakdown.addOnsTotal += budgetValue;
      }
    });
  }

  total = breakdown.servicesTotal + breakdown.addOnsTotal;

  return {
    total,
    breakdown,
  };
};

// Calculate total budget for all events
export const calculateTotalBudget = (eventData) => {
  let grandTotal = 0;
  const eventBudgets = [];

  if (eventData.events && Array.isArray(eventData.events)) {
    eventData.events.forEach((event, index) => {
      const eventBudget = calculateEventBudget(event);
      eventBudgets.push({
        eventIndex: index,
        eventName: event.eventName || `Event ${index + 1}`,
        ...eventBudget,
      });
      grandTotal += eventBudget.total;
    });
  }

  return {
    grandTotal,
    eventBudgets,
  };
};

// Format budget value for display
export const formatBudget = (value) => {
  if (!value || value === 0) return '0.00';
  return `${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
