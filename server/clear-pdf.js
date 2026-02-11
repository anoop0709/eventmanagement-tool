import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const eventSchema = new mongoose.Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function clearPDF() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const eventId = '698c404f8ec54ea6b5dc4df7';
    
    const result = await Event.updateOne(
      { _id: eventId },
      { $unset: { proposalPdf: '' } }
    );

    console.log(`✓ Cleared PDF for event ${eventId}`);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearPDF();
