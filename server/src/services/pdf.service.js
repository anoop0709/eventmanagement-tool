import PDFDocument from 'pdfkit';
import logger from '../config/logger.js';
import { calculateTotalBudget, formatBudget } from '../utils/budgetCalculator.js';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Helper function to format label
const formatLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
// Helper to format budget with .00
const formatBudgetValue = (value) => {
  if (!value || value === 0) return '0.00';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[,]/g, '')) : value;
  return `${numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
// Helper function to format string values
const formatStringValue = (str) => {
  if (!str || typeof str !== 'string') return str;
  let formatted = str.replace(/[_-]/g, ' ');
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  formatted = formatted.replace(/\b\w/g, (char) => char.toUpperCase());
  return formatted;
};

// Helper function to ensure enough space on page (from makepdf.js)
const ensureSpace = (doc, minHeight) => {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + minHeight > bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top + 20;
  }
};

// Helper function to render complex values for PDF
const renderComplexValue = (value, key = '') => {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle boolean
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle number
  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  // Handle strings - check if it's a date field
  if (typeof value === 'string') {
    // Check if field name contains 'date' or common date field names
    const dateFieldPatterns = /date|time|timing|check|pickup|drop/i;
    if (key && dateFieldPatterns.test(key) && value.includes('T')) {
      // Try to parse as date - must contain 'T' to be ISO format
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return formatDate(value);
      }
    }
    return formatStringValue(value);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'No items';
    }

    // Check if array contains objects
    const hasObjects = value.some((item) => typeof item === 'object' && item !== null);

    if (hasObjects) {
      // Return array for special card rendering
      return { _isArray: true, items: value };
    } else {
      // Primitive arrays as comma-separated
      return value.map((v) => (typeof v === 'string' ? formatStringValue(v) : String(v))).join(', ');
    }
  }

  // Handle objects (but not arrays)
  if (typeof value === 'object' && value !== null) {
    // Special handling for nested objects - return as structured data
    return { _isObject: true, data: value };
  }

  return String(value);
};

// Helper function to fetch image from URL
const fetchImage = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to load image: ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

// Generate PDF for event details
export const generateEventPDF = async (eventData) => {
  try {
    // Pre-fetch all images and convert SVGs before generating PDF
    const imageCache = {};
    
    const collectImageUrls = (obj) => {
      const urls = [];
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            const imgSrc = item.src || item.photo || item.image;
            if (imgSrc && typeof imgSrc === 'string') {
              if (imgSrc.startsWith('http')) {
                urls.push({ url: imgSrc, type: 'remote' });
              } else if (imgSrc.startsWith('/') || imgSrc.startsWith('images/')) {
                urls.push({ url: imgSrc, type: 'local' });
              }
            }
            urls.push(...collectImageUrls(item));
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(value => {
          urls.push(...collectImageUrls(value));
        });
      }
      return urls;
    };
    
    const imageUrls = collectImageUrls(eventData);
    
    // Fetch remote images and convert local SVGs
    await Promise.all(imageUrls.map(async ({ url, type }) => {
      try {
        if (type === 'remote') {
          imageCache[url] = await fetchImage(url);
          logger.info(`✓ Cached remote image: ${url}`);
        } else if (type === 'local') {
          // Resolve local path
          let localPath = url;
          if (url.startsWith('/images/') || url.startsWith('images/')) {
            const imgPath = url.startsWith('/') ? url.slice(1) : url;
            localPath = path.resolve(__dirname, '../../../client/public', imgPath);
          }
          
          // Convert SVG to PNG buffer
          if (url.toLowerCase().endsWith('.svg') && fs.existsSync(localPath)) {
            const pngBuffer = await sharp(localPath)
              .resize(150, 150, { fit: 'inside' })
              .png()
              .toBuffer();
            imageCache[url] = pngBuffer;
            console.log('[PDF] ✓ Converted SVG to PNG:', url, '->', pngBuffer.length, 'bytes');
            console.log('[PDF]   Cached with key:', JSON.stringify(url));
          } else if (!url.toLowerCase().endsWith('.svg') && fs.existsSync(localPath)) {
          } else if (!url.toLowerCase().endsWith('.svg') && fs.existsSync(localPath)) {
            // Cache non-SVG local images too
            imageCache[url] = localPath;
            logger.info(`✓ Cached local image path: ${url}`);
          } else {
            logger.warn(`✗ Local image not found: ${localPath}`);
          }
        }
      } catch (err) {
        logger.warn(`Failed to process image: ${url}`, err);
        imageCache[url] = null;
      }
    }));
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        margin: 20, 
        size: 'A4',
        bufferPages: true 
      });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);


      // Color Palette matching EventViewPage
      const colors = {
        primary: '#22727b',      // Header background
        secondary: '#11526e',     // Card titles background
        dark: '#111827',          // Main text
        medium: '#374151',        // Labels
        light: '#9ca3af',         // Empty values
        border: '#e5e7eb',        // Borders
        rowBorder: '#f3f4f6',     // Row borders
        background: '#f9fafb',    // Accordion content background
        white: '#ffffff'
      };

      // ==================== HEADER (matching EventViewPage header) ====================
      const headerHeight = 120;
      doc
        .rect(0, 0, doc.page.width, headerHeight)
        .fill(colors.primary);

      doc
        .rect(0, headerHeight, doc.page.width, 3)
        .fill(colors.primary);

      // Company Details - Centered
      doc
        .fontSize(20)
        .fillColor(colors.white)
        .font('Helvetica-Bold')
        .text(process.env.COMPANY_NAME || 'Event Management Company', 40, 20, { 
          width: doc.page.width - 80, 
          align: 'center' 
        });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('rgba(255, 255, 255, 0.85)')
        .text(process.env.COMPANY_ADDRESS || 'Company Address', 40, 48, { 
          width: doc.page.width - 80, 
          align: 'center' 
        });

      doc
        .fontSize(10)
        .fillColor('rgba(255, 255, 255, 0.85)')
        .text(
          `Phone: ${process.env.COMPANY_PHONE || 'N/A'} | Email: ${process.env.SMTP_USER || 'contact@company.com'}`,
          40, 65, { 
            width: doc.page.width - 80, 
            align: 'center' 
          }
        );

      // Event Name
      const firstEvent = eventData.events?.[0] || {};
      doc
        .fontSize(14)
        .fillColor(colors.white)
        .font('Helvetica-Bold')
        .text(firstEvent.eventName || 'Event Details', 40, 88, { 
          width: doc.page.width - 80, 
          align: 'center' 
        });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('rgba(255, 255, 255, 0.7)')
        .text(`Created on ${formatDate(eventData.createdAt || new Date())}`, 40, 108, { 
          width: doc.page.width - 80, 
          align: 'center' 
        });

      doc.y = headerHeight + 25;

      // ==================== CLIENT INFORMATION CARD ====================
      ensureSpace(doc, 150);
      const cardStartY = doc.y;
      
      // Card title background (matching EventViewPage)
      const titleHeight = 28;
      doc
        .rect(40, cardStartY, doc.page.width - 80, titleHeight)
        .fill(colors.secondary);

      doc
        .fontSize(12)
        .fillColor(colors.white)
        .font('Helvetica-Bold')
        .text('CLIENT INFORMATION', 50, cardStartY + 9, { 
          width: doc.page.width - 100,
          characterSpacing: 0.5
        });

      doc.y = cardStartY + titleHeight;

      // Client Details rows with borders
      const clientDetails = eventData.clientDetails || {};
      const clientInfo = [
        ['Name', clientDetails.clientName || 'N/A'],
        ['Email', clientDetails.email || 'N/A'],
        ['Phone', clientDetails.phoneNumber || 'N/A'],
        ['Address', clientDetails.address || 'N/A'],
        ['Post Code', clientDetails.postCode || 'N/A']
      ];

      clientInfo.forEach(([label, value], index) => {
        const rowY = doc.y;
        
        // Calculate height needed for value text (support multi-line)
        const valueWidth = doc.page.width - 250;
        const valueHeight = doc.heightOfString(String(value), { width: valueWidth, fontSize: 12 });
        const rowHeight = Math.max(28, valueHeight + 20);
        
        ensureSpace(doc, rowHeight + 5);
        
        // Row background (white)
        doc
          .rect(40, rowY, doc.page.width - 80, rowHeight)
          .fill(colors.white);
        
        // Label
        doc
          .fontSize(11)
          .fillColor(colors.medium)
          .font('Helvetica-Bold')
          .text(label, 50, rowY + 10, { width: 150, continued: false });
        
        // Value
        doc
          .fillColor(colors.dark)
          .font('Helvetica')
          .fontSize(13)
          .text(String(value), 210, rowY + 10, { width: valueWidth, continued: false });
        
        // Bottom border for each row
        if (index < clientInfo.length - 1) {
          doc
            .rect(40, rowY + rowHeight, doc.page.width - 80, 1)
            .fill(colors.rowBorder);
        }
        
        doc.y = rowY + rowHeight;
      });

      // Card bottom border
      doc
        .rect(40, doc.y, doc.page.width - 80, 1)
        .fill(colors.border);

      doc.moveDown(1.5);

      // ==================== EVENT DETAILS CARD ====================
      const events = eventData.events || [];
      
      ensureSpace(doc, 150);

      const eventCardStartY = doc.y;
      
      // Card title background
      doc
        .rect(40, eventCardStartY, doc.page.width - 80, titleHeight)
        .fill(colors.secondary);

      doc
        .fontSize(12)
        .fillColor(colors.white)
        .font('Helvetica-Bold')
        .text('EVENT DETAILS', 50, eventCardStartY + 9, {
          width: doc.page.width - 100,
          characterSpacing: 0.5
        });

      doc.y = eventCardStartY + titleHeight;

      // Event Information rows with borders
      const eventInfo = [
        ['Event Name', firstEvent.eventName || 'N/A'],
        ['Event Type', formatStringValue(firstEvent.eventType) || 'N/A'],
        ['Event Date', formatDate(firstEvent.eventDate)],
        ['Guest Count', firstEvent.guestCount || 'N/A'],
        ['Venue', firstEvent.venue || 'N/A'],
        ['Post Code', firstEvent.postCode || 'N/A']
      ];

      if (firstEvent.notesForEvent) {
        eventInfo.push(['Notes', firstEvent.notesForEvent]);
      }

      eventInfo.forEach(([label, value], index) => {
        const rowY = doc.y;
        
        // Calculate height needed for value text (support multi-line)
        const valueWidth = doc.page.width - 250;
        const valueHeight = doc.heightOfString(String(value), { width: valueWidth, fontSize: 10 });
        const rowHeight = Math.max(28, valueHeight + 20);
        
        ensureSpace(doc, rowHeight + 5);
        
        // Row background
        doc
          .rect(40, rowY, doc.page.width - 80, rowHeight)
          .fill(colors.white);
        
        // Label
        doc
          .fontSize(10)
          .fillColor(colors.medium)
          .font('Helvetica-Bold')
          .text(label, 50, rowY + 10, { width: 150, continued: false });
        
        // Value
        doc
          .fillColor(colors.dark)
          .font('Helvetica')
          .text(String(value), 210, rowY + 10, { width: valueWidth, continued: false });
        
        // Bottom border for each row
        if (index < eventInfo.length - 1) {
          doc
            .rect(40, rowY + rowHeight, doc.page.width - 80, 1)
            .fill(colors.rowBorder);
        }
        
        doc.y = rowY + rowHeight;
      });

      // ==================== SERVICES SECTION ====================
      const eventDetails = firstEvent.eventDetails || {};
      const services = eventDetails.services || {};
      const selectedServices = Object.keys(services).filter(key => services[key] && typeof services[key] === 'object');

      if (selectedServices.length > 0) {
        // Top border separator
        doc.moveDown(1);
        ensureSpace(doc, 60);
        doc.rect(40, doc.y, doc.page.width - 80, 2).fill(colors.border);
        doc.moveDown(0.5);
        
        // Services section header
        const servicesHeaderY = doc.y;
        doc.rect(40, servicesHeaderY, doc.page.width - 80, titleHeight).fill(colors.secondary);
        doc.fontSize(11).fillColor(colors.white).font('Helvetica-Bold')
          .text('SERVICES', 50, servicesHeaderY + 10, { width: doc.page.width - 100, characterSpacing: 1 });
        doc.y = servicesHeaderY + titleHeight;

        selectedServices.forEach((serviceKey, serviceIndex) => {
          const serviceDetails = services[serviceKey];
          
          // Check if we need a new page
          ensureSpace(doc, 100);

          // Service header
          const serviceHeaderY = doc.y;
          doc.rect(40, serviceHeaderY, doc.page.width - 80, 32).fill(colors.white);
          doc.fontSize(10).fillColor(colors.dark).font('Helvetica-Bold')
            .text(formatLabel(serviceKey).toUpperCase(), 50, serviceHeaderY + 12, { width: doc.page.width - 100, characterSpacing: 0.5 });
          doc.rect(40, serviceHeaderY + 32, doc.page.width - 80, 1).fill(colors.border);
          doc.y = serviceHeaderY + 33;

          // Process service details
          if (serviceDetails && typeof serviceDetails === 'object') {
            const entries = Object.entries(serviceDetails).filter(([k]) => k !== '_id');
            
            entries.forEach(([fieldKey, fieldValue]) => {
              if (fieldValue === null || fieldValue === undefined) return;
              
              // Check page break before each field
              ensureSpace(doc, 80);

              const processedValue = renderComplexValue(fieldValue, fieldKey);

              // Handle arrays (like menu, vehicleDetails, etc.)
              if (processedValue && typeof processedValue === 'object' && processedValue._isArray) {
                // Field label for array
                const arrayLabelY = doc.y;
                doc.rect(40, arrayLabelY, doc.page.width - 80, 26).fill(colors.background);
                doc.fontSize(11).fillColor(colors.medium).font('Helvetica-Bold')
                  .text(formatLabel(fieldKey), 56, arrayLabelY + 8, { width: doc.page.width - 96, continued: false });
                doc.rect(40, arrayLabelY + 26, doc.page.width - 80, 1).fill(colors.rowBorder);
                doc.y = arrayLabelY + 27;

                // Render each array item as a card
                processedValue.items.forEach((item, itemIdx) => {
                  ensureSpace(doc, 50);

                  const cardStartY = doc.y;
                  doc.rect(60, cardStartY, doc.page.width - 120, 1).fill(colors.border);
                  doc.y = cardStartY + 2;

                  if (typeof item === 'object' && item !== null) {
                    // Check if this item has an image src
                    const imageSrc = item.src || item.photo || item.image;
                    
                    // Only show fields if there's NO image, or show image only
                    if (imageSrc && typeof imageSrc === 'string' && (imageSrc.startsWith('http') || imageSrc.startsWith('/'))) {
                      // Has image - render only the image, skip all text fields
                      try {
                        ensureSpace(doc, 50); // Reduced from 180 to prevent extra pages
                        
                        const topPadding = 15; // Add top padding before image
                        const imageY = doc.y + topPadding;
                        const imageWidth = 150; // Medium size
                        const imageHeight = 150;
                        const imageX = (doc.page.width - imageWidth) / 2; // Center the image
                        
                        // Check if image is SVG - needs conversion
                        const isSvg = imageSrc && imageSrc.toLowerCase().endsWith('.svg');
                        
                        // Use cached image if available (remote or converted SVG)
                        if (imageCache[imageSrc]) {
                          try {
                            doc.image(imageCache[imageSrc], imageX, imageY, {
                              fit: [imageWidth, imageHeight],
                              align: 'center'
                            });
                            doc.y = imageY + imageHeight + 10;
                          } catch (imgErr) {
                            logger.warn('Failed to render cached image:', imgErr);
                            doc.fontSize(10).fillColor(colors.light).font('Helvetica-Oblique')
                              .text(`[Image format issue]`, 76, doc.y, { width: doc.page.width - 136, align: 'center' });
                            doc.y += 15;
                          }
                        } else if (!imageSrc.startsWith('http')) {
                          // Local file path - resolve from client/public or server directory
                          let localPath = imageSrc;
                          
                          // Check if path starts with client/public
                          if (imageSrc.startsWith('client/public/')) {
                            // Go up from server/src/services to project root, then to client/public
                            localPath = path.resolve(__dirname, '../../../', imageSrc);
                          } else if (imageSrc.startsWith('/images/') || imageSrc.startsWith('images/')) {
                            // Assume it's in client/public/images
                            const imgPath = imageSrc.startsWith('/') ? imageSrc.slice(1) : imageSrc;
                            localPath = path.resolve(__dirname, '../../../client/public', imgPath);
                          } else {
                            localPath = path.resolve(__dirname, '../../../', imageSrc);
                          }
                          
                          // Check if file exists
                          if (fs.existsSync(localPath)) {
                            doc.image(localPath, imageX, imageY, {
                              fit: [imageWidth, imageHeight],
                              align: 'center'            
                            });
                            doc.y = imageY + imageHeight + 10;
                          } else {
                          doc.fontSize(10).fillColor(colors.light).font('Helvetica-Oblique')
                              .text(`[Image not found: ${path.basename(imageSrc)}]`, 76, doc.y, { width: doc.page.width - 136, align: 'center' });
                            doc.y += 15;
                          }
                        } else {
                          // Image failed to load
                        doc.fontSize(10).fillColor(colors.light).font('Helvetica-Oblique')
                            .text(`[Image unavailable]`, 76, doc.y, { width: doc.page.width - 136, align: 'center' });
                          doc.y += 15;
                        }
                      } catch (err) {
                        // If image fails to render, show a placeholder message
                        doc.fontSize(9).fillColor(colors.light).font('Helvetica-Oblique')
                          .text(`[Image could not be displayed]`, 76, doc.y, { width: doc.page.width - 136, align: 'center' });
                        doc.y += 15;
                      }
                    } else {
                      // No image - show regular fields
                      Object.entries(item).forEach(([itemKey, itemValue], idx) => {
                        // Filter out _id, id, src, name fields
                        if (itemKey === '_id' || itemKey === 'id' || itemKey === 'src' || itemKey === 'name' || itemValue === null || itemValue === undefined) return;

                        ensureSpace(doc, 80);

                        const itemRowY = doc.y;
                        doc.rect(60, itemRowY, doc.page.width - 120, 24).fill(colors.white);
                        
                        // Item field label
                        doc.fontSize(10).fillColor(colors.medium).font('Helvetica-Bold')
                          .text(formatLabel(itemKey), 76, itemRowY + 7, { width: 160, continued: false });
                        
                        // Item field value - format dates automatically
                        let displayVal;
                        const lowerKey = itemKey.toLowerCase();
                        if (typeof itemValue === 'string' && (lowerKey.includes('date') || lowerKey.includes('time') || lowerKey.includes('timing') || lowerKey.includes('check') || lowerKey.includes('pickup') || lowerKey.includes('drop'))) {
                          // Try to parse as date - handle both ISO strings and other formats
                          const dateValue = new Date(itemValue);
                          if (!isNaN(dateValue.getTime()) && itemValue.length > 10) {
                            displayVal = formatDate(itemValue);
                          } else {
                            displayVal = formatStringValue(itemValue);
                          }
                        } else {
                          displayVal = typeof itemValue === 'string' ? formatStringValue(itemValue) 
                            : typeof itemValue === 'boolean' ? (itemValue ? 'Yes' : 'No')
                            : String(itemValue);
                        }
                        doc.fontSize(10).fillColor(colors.dark).font('Helvetica')
                          .text(displayVal, 246, itemRowY + 7, { width: doc.page.width - 286, continued: false });
                        
                        doc.rect(60, itemRowY + 24, doc.page.width - 120, 1).fill(colors.rowBorder);
                        doc.y = itemRowY + 25;
                      });
                    }
                  }
                  
                  doc.y += 2;
                });
              }
              // Handle nested objects (like foodServingInVenue)
              else if (processedValue && typeof processedValue === 'object' && processedValue._isObject) {
                // Field label for object
                const objLabelY = doc.y;
                doc.rect(40, objLabelY, doc.page.width - 80, 26).fill(colors.background);
                doc.fontSize(9.5).fillColor(colors.medium).font('Helvetica-Bold')
                  .text(formatLabel(fieldKey), 56, objLabelY + 8, { width: doc.page.width - 96, continued: false });
                doc.rect(40, objLabelY + 26, doc.page.width - 80, 1).fill(colors.rowBorder);
                doc.y = objLabelY + 27;

                // Render nested object fields
                Object.entries(processedValue.data).forEach(([nestedKey, nestedValue]) => {
                  if (nestedKey === '_id' || nestedValue === null || nestedValue === undefined) return;

                  ensureSpace(doc, 80);

                  // Check if nested value is an array (like menu inside foodServingInVenue.0)
                  if (Array.isArray(nestedValue) && nestedValue.length > 0 && typeof nestedValue[0] === 'object') {
                    // Nested array label
                    const nestedArrLabelY = doc.y;
                    doc.rect(60, nestedArrLabelY, doc.page.width - 120, 24).fill(colors.white);
                    doc.fontSize(10).fillColor(colors.medium).font('Helvetica-Bold')
                      .text(formatLabel(nestedKey), 76, nestedArrLabelY + 7, { width: doc.page.width - 136, continued: false });
                    doc.rect(60, nestedArrLabelY + 24, doc.page.width - 120, 1).fill(colors.border);
                    doc.y = nestedArrLabelY + 25;

                    // Render each nested array item
                    nestedValue.forEach((nestedItem) => {
                      ensureSpace(doc, 90);

                      if (typeof nestedItem === 'object' && nestedItem !== null) {
                        Object.entries(nestedItem).forEach(([nKey, nValue]) => {
                          // Filter out _id, src, name fields
                          if (nKey === '_id' || nKey === 'src' || nKey === 'name' || nValue === null || nValue === undefined) return;

                          ensureSpace(doc, 80);

                          const nRowY = doc.y;
                          doc.rect(70, nRowY, doc.page.width - 140, 22).fill('#fafafa');
                          
                          doc.fontSize(10).fillColor(colors.medium).font('Helvetica-Bold')
                            .text(formatLabel(nKey), 86, nRowY + 6, { width: 150, continued: false });
                          
                          // Handle image URLs and dates properly
                          let nDisplayVal;
                          if (nKey === 'photo' || nKey === 'image' || (typeof nValue === 'string' && (nValue.startsWith('http') || nValue.startsWith('/')))) {
                            nDisplayVal = nValue; // Show full URL for images
                          } else if (typeof nValue === 'string' && /date|time|timing|check|pickup|drop/i.test(nKey) && nValue.includes('T')) {
                            // Format date fields
                            const dateValue = new Date(nValue);
                            nDisplayVal = !isNaN(dateValue.getTime()) ? formatDate(nValue) : formatStringValue(nValue);
                          } else {
                            nDisplayVal = typeof nValue === 'string' ? formatStringValue(nValue)
                              : typeof nValue === 'boolean' ? (nValue ? 'Yes' : 'No')
                              : String(nValue);
                          }
                          doc.fontSize(10).fillColor(colors.dark).font('Helvetica')
                            .text(nDisplayVal, 246, nRowY + 6, { width: doc.page.width - 286, continued: false });
                          
                          doc.rect(70, nRowY + 22, doc.page.width - 140, 1).fill(colors.rowBorder);
                          doc.y = nRowY + 23;
                        });
                      }
                      doc.y += 2;
                    });
                  } else {
                    // Simple nested field
                    const nestedRowY = doc.y;
                    doc.rect(60, nestedRowY, doc.page.width - 120, 24).fill(colors.white);
                    
                    doc.fontSize(10).fillColor(colors.medium).font('Helvetica-Bold')
                      .text(formatLabel(nestedKey), 76, nestedRowY + 7, { width: 160, continued: false });
                    
                    const nestedDisplayVal = typeof nestedValue === 'string' ? formatStringValue(nestedValue)
                      : typeof nestedValue === 'boolean' ? (nestedValue ? 'Yes' : 'No')
                      : Array.isArray(nestedValue) ? nestedValue.join(', ')
                      : String(nestedValue);
                    doc.fontSize(10).fillColor(colors.dark).font('Helvetica')
                      .text(nestedDisplayVal, 246, nestedRowY + 7, { width: doc.page.width - 286, continued: false });
                    
                    doc.rect(60, nestedRowY + 24, doc.page.width - 120, 1).fill(colors.rowBorder);
                    doc.y = nestedRowY + 25;
                  }
                });
              }
              // Handle simple fields (strings, numbers, booleans)
              else {
                const displayValue = fieldKey === 'budget' ? formatBudgetValue(fieldValue) : String(processedValue);
                const valueWidth = doc.page.width - 276;
                const valueHeight = doc.heightOfString(displayValue, { width: valueWidth, fontSize: 10 });
                const rowHeight = Math.max(24, valueHeight + 14);
                
                ensureSpace(doc, rowHeight + 5);

                const rowY = doc.y;
                doc.rect(40, rowY, doc.page.width - 80, rowHeight).fill(colors.background);
                
                doc.fontSize(10).fillColor(colors.medium).font('Helvetica-Bold')
                  .text(formatLabel(fieldKey), 56, rowY + 7, { width: 170, continued: false });
                
                doc.fontSize(10).fillColor(colors.dark).font('Helvetica')
                  .text(displayValue, 236, rowY + 7, { width: valueWidth, continued: false });
                
                doc.rect(40, rowY + rowHeight, doc.page.width - 80, 1).fill(colors.rowBorder);
                doc.y = rowY + rowHeight;
              }
            });
          }

          // Border after each service
          if (serviceIndex < selectedServices.length - 1) {
            doc.rect(40, doc.y, doc.page.width - 80, 1).fill(colors.border);
          }
        });

        // Card bottom border
        doc.rect(40, doc.y, doc.page.width - 80, 1).fill(colors.border);
      }

      // ==================== ADD-ONS SECTION ====================
      const addOns = eventDetails.addOns || {};
      const selectedAddOns = Object.keys(addOns).filter(key => addOns[key] && typeof addOns[key] === 'object');

      if (selectedAddOns.length > 0) {
        // Top border separator
        doc.moveDown(1);
        doc.rect(40, doc.y, doc.page.width - 80, 2).fill(colors.border);
        doc.moveDown(0.5);
        
        // Add-ons section header
        const addonsHeaderY = doc.y;
        doc.rect(40, addonsHeaderY, doc.page.width - 80, titleHeight).fill(colors.secondary);
        doc.fontSize(11).fillColor(colors.white).font('Helvetica-Bold')
          .text('ADD-ONS', 50, addonsHeaderY + 10, { width: doc.page.width - 100, characterSpacing: 1 });
        doc.y = addonsHeaderY + titleHeight;

        selectedAddOns.forEach((addonKey, addonIndex) => {
          const addonDetails = addOns[addonKey];
          
          ensureSpace(doc, 100);

          // Add-on header
          const addonHeaderY = doc.y;
          doc.rect(40, addonHeaderY, doc.page.width - 80, 32).fill(colors.white);
          doc.fontSize(10).fillColor(colors.dark).font('Helvetica-Bold')
            .text(formatLabel(addonKey).toUpperCase(), 50, addonHeaderY + 12, { width: doc.page.width - 100, characterSpacing: 0.5 });
          doc.rect(40, addonHeaderY + 32, doc.page.width - 80, 1).fill(colors.border);
          doc.y = addonHeaderY + 33;

          // Process add-on details
          if (addonDetails && typeof addonDetails === 'object') {
            Object.entries(addonDetails).forEach(([fieldKey, fieldValue]) => {
              if (fieldValue === null || fieldValue === undefined || fieldKey === '_id') return;
              
              ensureSpace(doc, 80);

              const rowY = doc.y;
              doc.rect(40, rowY, doc.page.width - 80, 24).fill(colors.background);
              
              doc.fontSize(10).fillColor(colors.medium).font('Helvetica-Bold')
                .text(formatLabel(fieldKey), 56, rowY + 8, { width: 170, continued: false });
              
              const simpleDisplayValue = fieldKey === 'budget' ? formatBudgetValue(fieldValue)
                : typeof fieldValue === 'boolean' ? (fieldValue ? 'Yes' : 'No')
                : typeof fieldValue === 'string' ? formatStringValue(fieldValue)
                : String(fieldValue);
              doc.fontSize(10).fillColor(colors.dark).font('Helvetica')
                .text(simpleDisplayValue, 236, rowY + 7, { width: doc.page.width - 276, continued: false });
              
              doc.rect(40, rowY + 24, doc.page.width - 80, 1).fill(colors.rowBorder);
              doc.y = rowY + 25;
            });
          }

          // Border after each add-on
          if (addonIndex < selectedAddOns.length - 1) {
            doc.rect(40, doc.y, doc.page.width - 80, 1).fill(colors.border);
          }
        });

        // Card bottom border
        doc.rect(40, doc.y, doc.page.width - 80, 1).fill(colors.border);
      }

      // ==================== TOTAL ====================
      const budgetData = calculateTotalBudget(eventData);

      if (budgetData.grandTotal > 0) {
        ensureSpace(doc, 70);

        doc.moveDown(2);

        // Total card with border (matching EventViewPage style)
        const totalY = doc.y;
        const totalCardHeight = 45;
        
        // Total card background
        doc
          .rect(40, totalY, doc.page.width - 80, totalCardHeight)
          .fill(colors.primary);

        // Total label and amount
        doc
          .fontSize(14)
          .fillColor(colors.white)
          .font('Helvetica-Bold')
          .text('TOTAL', 50, totalY + 15, { width: 150 });

        doc
          .fontSize(16)
          .fillColor(colors.white)
          .font('Helvetica-Bold')
          .text(formatBudgetValue(budgetData.grandTotal), 50, totalY + 15, { 
            width: doc.page.width - 100,
            align: 'right' 
          });

        doc.y = totalY + totalCardHeight + 20;
      }

      doc.end();
    });
  } catch (error) {
    logger.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};
