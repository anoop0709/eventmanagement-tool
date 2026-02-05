export const formStepsConfig = [
  {
    id: 1,
    subtitle: 'Start with basics, then add services like decorations and catering.',
    sections: [
      {
        title: 'Client Information',
        section: 'clientDetails',
        fields: [
          {
            name: 'clientName',
            label: 'Client name',
            type: 'text',
            placeholder: 'e.g., John Doe',
          },
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'e.g., john@example.com',
          },
          {
            name: 'phoneNumber',
            label: 'Phone number',
            type: 'tel',
            placeholder: 'e.g., +91 98765 43210',
          },
          {
            name: 'address',
            label: 'Address',
            type: 'text',
            placeholder: 'e.g., Mumbai, Maharashtra',
          },
          {
            name: 'postCode',
            label: 'Post Code',
            type: 'text',
            placeholder: 'e.g., 400001',
          },
        ],
      },
    ],
    actions: {
      secondary: [{ label: 'Save draft', action: 'draft' }],
      primary: { label: 'Next: Event Details', action: 'next' },
    },
  },
  {
    id: 2,
    subtitle: 'Add one or more events (e.g., Wedding, Reception, Mehandi)',
    sections: [
      {
        title: 'Event Details',
        section: 'events',
        type: 'multiple-events',
        fields: [
          {
            name: 'eventName',
            label: 'Event name',
            type: 'text',
            placeholder: 'e.g., Wedding Reception',
          },
          {
            name: 'eventType',
            label: 'Event type',
            type: 'select',
            placeholder: 'Select event type',
            options: [
              { value: 'wedding', label: 'Wedding' },
              { value: 'reception', label: 'Reception' },
              { value: 'engagement', label: 'Engagement' },
              { value: 'birthday', label: 'Birthday' },
              { value: 'corporate', label: 'Corporate' },
              { value: 'other', label: 'Other' },
            ],
          },
          {
            name: 'eventDate',
            label: 'Date & time',
            type: 'date',
            placeholder: 'e.g., 20 Feb 2026, 5:00 PM',
            showTimeSelect: true,
            minDate: new Date(),
            dateFormat: 'dd MMM yyyy, h:mm aa',
          },
          {
            name: 'guestCount',
            label: 'Guest count',
            type: 'text',
            placeholder: 'e.g., 250',
          },
          {
            name: 'venue',
            label: 'Venue',
            type: 'text',
            placeholder: 'Venue name + address',
            fullWidth: true,
          },
          { name: 'postCode', label: 'Post Code', type: 'text', placeholder: 'e.g., 400001' },
        ],
        servicesFields: [
          {
            name: 'stageDecoration',
            label: 'Stage Decoration',
            description: 'Backdrop, flowers & lighting',
            type: 'checkbox',
          },
          {
            name: 'catering',
            label: 'Catering',
            description: 'Food & beverages',
            type: 'checkbox',
          },
          {
            name: 'transportation',
            label: 'Transportation',
            description: 'Guest & couple transport',
            type: 'checkbox',
          },
          {
            name: 'mehandiHaldi',
            label: 'Mehandi or Haldi',
            description: 'Traditional ceremonies',
            type: 'checkbox',
          },
          {
            name: 'photographyVideography',
            label: 'Photography & Videography',
            description: 'Professional coverage',
            type: 'checkbox',
          },
          {
            name: 'saveTheDate',
            label: 'Save The Date',
            description: 'Announcement',
            type: 'checkbox',
          },
          {
            name: 'cardDesignPrinting',
            label: 'Card Design & Printing',
            description: 'Invitation cards',
            type: 'checkbox',
          },
          {
            name: 'outfitDesign',
            label: 'Outfit Design',
            description: 'Custom outfits',
            type: 'checkbox',
          },
          {
            name: 'honeymoonPackage',
            label: 'Honeymoon Destination Planning',
            description: 'Travel arrangements',
            type: 'checkbox',
          },
        ],
        addOnsFields: [
          {
            name: 'dj',
            label: 'DJ',
            description: 'Music and entertainment',
            type: 'checkbox',
          },
          {
            name: 'liveBand',
            label: 'Live Band',
            description: 'Music and entertainment',
            type: 'checkbox',
          },
          {
            name: 'fireworks',
            label: 'Fireworks',
            description: 'Guest & couple entertainment',
            type: 'checkbox',
          },
          {
            name: 'photoBooth',
            label: 'Photo Booth',
            description: 'Fun photo sessions',
            type: 'checkbox',
          },
          {
            name: 'welcomeGirls',
            label: 'Welcome Girls',
            description: 'Traditional welcome service',
            type: 'checkbox',
          },
          {
            name: 'valetParking',
            label: 'Valet Parking',
            description: 'Convenient parking service',
            type: 'checkbox',
          },
          {
            name: 'eventInsurance',
            label: 'Event Insurance',
            description: 'Protect your event with insurance coverage',
            type: 'checkbox',
          },
          {
            name: 'securityServices',
            label: 'Security Services',
            description: 'Ensure safety with professional security personnel',
            type: 'checkbox',
          },
          {
            name: 'socialMediaCoverage',
            label: 'Social Media Coverage',
            description: 'Live updates and posts on social media platforms',
            type: 'checkbox',
          },
        ],
      },
    ],
    actions: {
      secondary: [
        { label: 'Save draft', action: 'draft' },
        { label: 'Back: Client Information', action: 'back' },
      ],
      primary: { label: 'Next: Review', action: 'next' },
    },
  },
  {
    id: 3,
    subtitle: 'Review & Submit',
    sections: [
      {
        title: 'Review & Submit',
        subtitle: 'Review your event details and submit your request',
        type: 'review',
        fields: [{ type: 'review' }],
      },
    ],
    actions: {
      secondary: [
        { label: 'Save draft', action: 'draft' },
        { label: 'Back: Event Details', action: 'back' },
      ],
      primary: { label: 'Submit', action: 'submit' },
    },
  },
];
