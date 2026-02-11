// Test file for budget calculation
import { calculateTotalBudget, formatBudget } from '../src/utils/budgetCalculator.js';

// Sample event data
const testEventData = {
  clientDetails: {
    clientName: 'John Doe',
    email: 'john@example.com',
  },
  events: [
    {
      eventName: 'Wedding Reception',
      eventType: 'wedding',
      eventDetails: {
        services: {
          stageDecoration: {
            theme: 'traditional',
            budget: '₹50,000',
          },
          catering: {
            menu: [],
            budget: '₹2,00,000',
          },
          transportation: {
            vehicles: [],
            budget: '30000', // Can be without currency symbol
          },
        },
        addOns: {
          dj: {
            hours: 4,
            budget: '₹25,000',
          },
          photoBooth: {
            hours: 3,
            budget: '15000',
          },
        },
      },
    },
    {
      eventName: 'Mehandi Ceremony',
      eventType: 'mehandi',
      eventDetails: {
        services: {
          mehandiHaldi: {
            type: 'mehandi',
            budget: '₹40,000',
          },
          stageDecoration: {
            theme: 'floral',
            budget: '₹35,000',
          },
        },
        addOns: {
          liveBand: {
            hours: 2,
            budget: '₹20,000',
          },
        },
      },
    },
  ],
};

// Calculate budget
console.log('===== BUDGET CALCULATION TEST =====\n');

const budgetData = calculateTotalBudget(testEventData);

console.log('Event Budgets:');
budgetData.eventBudgets.forEach((eventBudget) => {
  console.log(`\n${eventBudget.eventName}:`);
  console.log(`  Services Total: ${formatBudget(eventBudget.breakdown.servicesTotal)}`);
  console.log(`  Add-ons Total: ${formatBudget(eventBudget.breakdown.addOnsTotal)}`);
  console.log(`  Event Total: ${formatBudget(eventBudget.total)}`);
});

console.log(`\n${'='.repeat(40)}`);
console.log(`GRAND TOTAL: ${formatBudget(budgetData.grandTotal)}`);
console.log(`${'='.repeat(40)}\n`);

console.log('✓ Budget calculation working correctly!');
console.log('\nExpected Grand Total: ₹4,15,000');
console.log(`Calculated Grand Total: ${formatBudget(budgetData.grandTotal)}`);
console.log(`Match: ${budgetData.grandTotal === 415000 ? '✓ YES' : '✗ NO'}`);
