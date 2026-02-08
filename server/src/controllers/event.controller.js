import Event from '../models/Event.model.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    // All company users can see all events
    const events = await Event.find().populate('user', 'name email').sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('user', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // All company users can view any event
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new event (initial draft)
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    // Create event with draft status by default
    const event = await Event.create({
      user: req.user._id,
      clientDetails: req.body.clientDetails || {},
      events: req.body.events || [],
      status: req.body.status || 'draft',
      totalBudget: req.body.totalBudget,
    });

    // Return created event with ID for subsequent updates
    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update event (merge new data with existing)
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // All company users can edit any event
    // Merge new data with existing data
    const updateData = {};

    // Update clientDetails if provided (merge with existing)
    if (req.body.clientDetails) {
      updateData.clientDetails = {
        ...event.clientDetails?.toObject(),
        ...req.body.clientDetails,
      };
    }

    // Update events array if provided
    if (req.body.events) {
      // Merge events - update existing or add new
      updateData.events = req.body.events.map((newEvent, index) => {
        const existingEvent = event.events?.[index];
        if (existingEvent) {
          // Merge with existing event
          return {
            ...existingEvent.toObject(),
            ...newEvent,
            services: {
              ...existingEvent.services?.toObject(),
              ...newEvent.services,
            },
            addOns: {
              ...existingEvent.addOns?.toObject(),
              ...newEvent.addOns,
            },
            eventDetails: {
              ...existingEvent.eventDetails,
              ...newEvent.eventDetails,
            },
          };
        }
        return newEvent;
      });
    }

    // Update status if explicitly set
    if (req.body.status) {
      updateData.status = req.body.status;
    }

    // Update totalBudget if provided
    if (req.body.totalBudget !== undefined) {
      updateData.totalBudget = req.body.totalBudget;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('user', 'name email');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only admins can delete events
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can delete events' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming events (calendar view)
// @route   GET /api/events/calendar/upcoming
// @access  Private
export const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      eventDate: { $gte: today },
      status: { $ne: 'cancelled' },
    };

    // All company users can see all upcoming events
    const events = await Event.find(query)
      .populate('user', 'name email')
      .sort({ eventDate: 1 })
      .limit(50);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get draft events
// @route   GET /api/events/drafts
// @access  Private
export const getDraftEvents = async (req, res) => {
  try {
    // All company users can see all drafts
    const events = await Event.find({ status: 'draft' })
      .populate('user', 'name email')
      .sort({ updatedAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats (Admin only)
// @route   GET /api/events/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEvents,
      upcomingEvents,
      pendingEvents,
      confirmedEvents,
      completedEvents,
      draftEvents,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ eventDate: { $gte: today }, status: { $ne: 'cancelled' } }),
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'confirmed' }),
      Event.countDocuments({ status: 'completed' }),
      Event.countDocuments({ status: 'draft' }),
    ]);

    res.json({
      totalEvents,
      upcomingEvents,
      pendingEvents,
      confirmedEvents,
      completedEvents,
      draftEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
