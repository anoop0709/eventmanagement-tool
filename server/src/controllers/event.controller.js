import Event from '../models/Event.model.js';
import { generateEventPDF } from '../services/pdf.service.js';
import { sendEventDetailsEmail, sendAdminNotificationEmail } from '../services/email.service.js';
import { calculateTotalBudget } from '../utils/budgetCalculator.js';
import logger from '../config/logger.js';

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
    // Check if status is 'pending' (direct submission)
    const isSubmitting = req.body.status === 'pending';

    // Calculate total budget if submitting
    let totalBudget = req.body.totalBudget;
    if (isSubmitting) {
      const budgetData = calculateTotalBudget({
        events: req.body.events || [],
      });
      totalBudget = budgetData.grandTotal;
    }

    // Create event
    const event = await Event.create({
      user: req.user._id,
      clientDetails: req.body.clientDetails || {},
      events: req.body.events || [],
      status: req.body.status || 'draft',
      totalBudget: totalBudget,
    });

    // If submitting event directly, generate PDF and send email
    if (isSubmitting) {
      try {
        const eventDataForPDF = event.toObject();
        
        // Generate PDF
        logger.info('Generating PDF for event submission...');
        const pdfBuffer = await generateEventPDF(eventDataForPDF);
        
        // Store PDF in database
        event.proposalPdf = {
          data: pdfBuffer,
          generatedAt: new Date(),
        };
        await event.save();
        
        // Send email to customer
        const customerEmail = eventDataForPDF.clientDetails?.email;
        const clientName = eventDataForPDF.clientDetails?.clientName || 'Valued Customer';
        
        if (customerEmail) {
          logger.info(`Sending email to customer: ${customerEmail}`);
          await sendEventDetailsEmail(customerEmail, clientName, eventDataForPDF, pdfBuffer);
          
          // Send notification to admin
          await sendAdminNotificationEmail(eventDataForPDF);
          
          logger.info('Event submission email sent successfully');
        } else {
          logger.warn('Customer email not found, skipping email notification');
        }
      } catch (emailError) {
        // Log error but don't fail the request
        logger.error('Error sending email for event submission:', emailError);
        // Event is still created successfully even if email fails
      }
    }

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

    // Check if status is being changed to 'pending' (submission)
    const isSubmitting = req.body.status === 'pending' && event.status !== 'pending';

    // Update status if explicitly set
    if (req.body.status) {
      updateData.status = req.body.status;
    }

    // Calculate and update total budget if submitting
    if (isSubmitting) {
      const budgetData = calculateTotalBudget({
        events: updateData.events || event.events,
      });
      updateData.totalBudget = budgetData.grandTotal;
    } else if (req.body.totalBudget !== undefined) {
      // Update totalBudget if provided and not submitting
      updateData.totalBudget = req.body.totalBudget;
    }

    // Clear existing PDF to force regeneration on next download
    const existingEventForPdfClear = await Event.findById(req.params.id);
    if (existingEventForPdfClear?.proposalPdf?.data) {
      updateData.proposalPdf = null;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    // If submitting event (status changed to pending), generate PDF and send email
    if (isSubmitting) {
      try {
        const eventDataForPDF = updatedEvent.toObject();
        
        // Generate PDF
        logger.info('Generating PDF for event submission...');
        const pdfBuffer = await generateEventPDF(eventDataForPDF);
        
        // Store PDF in database
        updatedEvent.proposalPdf = {
          data: pdfBuffer,
          generatedAt: new Date(),
        };
        await updatedEvent.save();
        
        // Send email to customer
        const customerEmail = eventDataForPDF.clientDetails?.email;
        const clientName = eventDataForPDF.clientDetails?.clientName || 'Valued Customer';
        
        if (customerEmail) {
          logger.info(`Sending email to customer: ${customerEmail}`);
          await sendEventDetailsEmail(customerEmail, clientName, eventDataForPDF, pdfBuffer);
          
          // Send notification to admin
          await sendAdminNotificationEmail(eventDataForPDF);
          
          logger.info('Event submission email sent successfully');
        } else {
          logger.warn('Customer email not found, skipping email notification');
        }
      } catch (emailError) {
        // Log error but don't fail the request
        logger.error('Error sending email for event submission:', emailError);
        // Event is still updated successfully even if email fails
      }
    }

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

// @desc    Download event proposal PDF
// @route   GET /api/events/:id/download-pdf
// @access  Private
export const downloadEventPDF = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if PDF exists
    if (!event.proposalPdf || !event.proposalPdf.data) {
      // If PDF doesn't exist, generate it on the fly
      logger.info('PDF not found in database, generating new one...');
      const eventDataForPDF = event.toObject();
      const pdfBuffer = await generateEventPDF(eventDataForPDF);
      
      // Store for future use
      event.proposalPdf = {
        data: pdfBuffer,
        generatedAt: new Date(),
      };
      await event.save();
      console.log(JSON.stringify(event, null, 2));
      
      // Send the generated PDF
      const eventName = event.events?.[0]?.eventName || 'Event';
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const fileName = `${eventName.replace(/[^a-z0-9]/gi, '_')}_Proposal_${timestamp}.pdf`;
      
      console.log('Sending PDF with filename:', fileName);
      console.log('Event name:', eventName);
      console.log('Timestamp:', timestamp);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    // Send existing PDF
    const eventName = event.events?.[0]?.eventName || 'Event';
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `${eventName.replace(/[^a-z0-9]/gi, '_')}_Proposal_${timestamp}.pdf`;
    
    console.log('Sending existing PDF with filename:', fileName);
    console.log('Event name:', eventName);
    console.log('Timestamp:', timestamp);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', event.proposalPdf.data.length);
    res.send(event.proposalPdf.data);
  } catch (error) {
    logger.error('Error downloading PDF:', error);
    res.status(500).json({ message: error.message });
  }
};
