import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/appshell/AppShell';
import { Button } from '../../components/ui/button/Button';
import { Badge } from '../../components/ui/badge/Badge';
import { eventAPI } from '../../services/api';
import './EventViewPage.css';

const EventViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedServices, setExpandedServices] = useState({});
  const [expandedAddons, setExpandedAddons] = useState({});
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [addonsExpanded, setAddonsExpanded] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getEventById(id);
        setEvent(response);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const toggleService = (key) => {
    setExpandedServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAddon = (key) => {
    setExpandedAddons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <AppShell>
        <div className="event-view-container">
          <p>Loading event...</p>
        </div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <div className="event-view-container">
          <p>Event not found</p>
        </div>
      </AppShell>
    );
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', variant: 'warning' },
      approved: { label: 'Approved', variant: 'success' },
      rejected: { label: 'Rejected', variant: 'danger' },
      completed: { label: 'Completed', variant: 'info' }
    };
    return statusMap[status] || { label: status, variant: 'default' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };



  const renderValue = (value, key = '', parentKey = '') => {
    const lowerKey = key.toLowerCase();

    // Handle null or undefined
    if (value === null || value === undefined) {
      return <span className="value-empty">N/A</span>;
    }

    // Handle boolean
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? '✓ Yes' : '✗ No'}
        </Badge>
      );
    }

    // Handle number
    if (typeof value === 'number') {
      return <span className="value-number">{value.toLocaleString()}</span>;
    }

    // Handle string (check if it's an image URL or date string)
    if (typeof value === 'string') {
      // Check if it's a date string
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return <span className="value-date">{formatDate(value)}</span>;
      }
      
      // Check if it's an image
      if (lowerKey.includes('photo') || lowerKey.includes('image') || value.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        return (
          <div className="image-preview">
            <img src={value} alt={key} />
          </div>
        );
      }
      
      return <span className="value-text">{value}</span>;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="value-empty">No items</span>;
      }

      // Check if it's an array of photo/image objects (has src property)
      const hasImageObjects = value.every((item) => 
        item && typeof item === 'object' && (item.src || item.url || item.image)
      );

      if (hasImageObjects || lowerKey.includes('photo') || lowerKey.includes('image')) {
        return (
          <div className="photos-gallery">
            {value.map((photo, index) => (
              <div key={index} className="photo-card">
                <img src={photo.src || photo.url || photo.image || photo} alt={`Image ${index + 1}`} />
              </div>
            ))}
          </div>
        );
      }

      // Check if array contains objects
      const hasObjects = value.some((item) => typeof item === 'object' && item !== null);
      
      if (hasObjects) {
        // Render as cards
        return (
          <div className="array-cards">
            {value.map((item, index) => (
              <div key={index} className="array-card">
                <div className="array-card-content">
                  {renderValue(item, key, parentKey)}
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        // Render primitive arrays as comma-separated list
        return <span className="value-simple-list">{value.join(', ')}</span>;
      }
    }

    // Handle objects
    if (typeof value === 'object') {
      return (
        <div className="object-details">
          {Object.entries(value).map(([objKey, objValue]) => (
            <div key={objKey} className="object-row">
              <span className="object-key">{formatLabel(objKey)}</span>
              <span className="object-val">{renderValue(objValue, objKey, key)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="value-text">{String(value)}</span>;
  };

  const statusInfo = getStatusBadge(event.status);
  const clientDetails = event.clientDetails || {};
  const firstEvent = event.events?.[0] || {};
  
  // Get services and add-ons from eventDetails
  const eventDetails = firstEvent.eventDetails || {};
  const services = eventDetails.services || {};
  const addOns = eventDetails.addOns || {};

  return (
    <AppShell>
      <div className="event-view-container">
        {/* Header */}
        <div className="event-view-header">
          <div className="header-top">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="back-button"
            >
              ← Back
            </Button>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <h1 className="event-title">{firstEvent.eventName || 'Event Details'}</h1>
          <p className="event-subtitle">Created on {formatDate(event.createdAt)}</p>
        </div>

        {/* Content Grid */}
        <div className="event-view-content">
          <div className="event-view-grid">
            {/* Client Information Card */}
            <div className="event-view-card">
              <h2 className="card-title">Client Information</h2>
              <div className="card-content">
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">
                    {clientDetails.clientName || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">
                    {clientDetails.email || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">
                    {clientDetails.phoneNumber || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {clientDetails.address || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Post Code</span>
                  <span className="detail-value">
                    {clientDetails.postCode || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="event-view-card">
              <h2 className="card-title">Event Details</h2>
              <div className="card-content">
                <div className="detail-row">
                  <span className="detail-label">Event Name</span>
                  <span className="detail-value">
                    {firstEvent.eventName || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Event Type</span>
                  <span className="detail-value">
                    {firstEvent.eventType || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Event Date</span>
                  <span className="detail-value">
                    {formatDate(firstEvent.eventDate)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Guest Count</span>
                  <span className="detail-value">
                    {firstEvent.guestCount || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">
                    {firstEvent.venue || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Post Code</span>
                  <span className="detail-value">
                    {firstEvent.postCode || 'N/A'}
                  </span>
                </div>
                {firstEvent.notesForEvent && (
                  <div className="detail-row">
                    <span className="detail-label">Notes</span>
                    <span className="detail-value">
                      {firstEvent.notesForEvent}
                    </span>
                  </div>
                )}

                {/* Services Section inside Event Details */}
                {Object.keys(services).length > 0 && (
                  <div className="services-section">
                    <button
                      className="section-accordion-header"
                      onClick={() => setServicesExpanded(!servicesExpanded)}
                    >
                      <h3 className="section-subtitle">Services</h3>
                      <span className="accordion-icon">{servicesExpanded ? '−' : '+'}</span>
                    </button>
                    {servicesExpanded && (
                      <div className="accordion-container">
                        {Object.entries(services).map(([serviceKey, serviceValue]) => {
                          const isExpanded = expandedServices[serviceKey];
                          return (
                            <div key={serviceKey} className="accordion-item">
                              <button
                                className="accordion-header"
                                onClick={() => toggleService(serviceKey)}
                              >
                                <span className="accordion-title">{formatLabel(serviceKey)}</span>
                                <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
                              </button>
                              {isExpanded && (
                                <div className="accordion-content">
                                  {renderValue(serviceValue, serviceKey)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Add-ons Section inside Event Details */}
                {Object.keys(addOns).length > 0 && (
                  <div className="addons-section">
                    <button
                      className="section-accordion-header"
                      onClick={() => setAddonsExpanded(!addonsExpanded)}
                    >
                      <h3 className="section-subtitle">Add-ons</h3>
                      <span className="accordion-icon">{addonsExpanded ? '−' : '+'}</span>
                    </button>
                    {addonsExpanded && (
                      <div className="accordion-container">
                        {Object.entries(addOns).map(([addonKey, addonValue]) => {
                          const isExpanded = expandedAddons[addonKey];
                          return (
                            <div key={addonKey} className="accordion-item">
                              <button
                                className="accordion-header"
                                onClick={() => toggleAddon(addonKey)}
                              >
                                <span className="accordion-title">{formatLabel(addonKey)}</span>
                                <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
                              </button>
                              {isExpanded && (
                                <div className="accordion-content">
                                  {renderValue(addonValue, addonKey)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EventViewPage;
