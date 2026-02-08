import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientDetails: {
      clientName: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      postCode: {
        type: String,
        trim: true,
      },
    },
    events: [
      {
        eventName: {
          type: String,
          trim: true,
        },
        eventType: {
          type: String,
        },
        eventDate: {
          type: Date,
        },
        guestCount: {
          type: mongoose.Schema.Types.Mixed, // Can be string or number
        },
        venue: {
          type: String,
          trim: true,
        },
        postCode: {
          type: String,
          trim: true,
        },
        notesForEvent: {
          type: String,
          trim: true,
        },
        services: {
          type: Map,
          of: Boolean,
          default: {},
        },
        addOns: {
          type: Map,
          of: Boolean,
          default: {},
        },
        eventDetails: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'],
      default: 'draft',
    },
    totalBudget: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
