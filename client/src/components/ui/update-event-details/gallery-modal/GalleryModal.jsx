import { useState, useEffect, useMemo } from 'react';
import './GalleryModal.css';

export function GalleryModal({ isOpen, onClose, onSelect, galleryPath }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

  // Dynamically load images from galleryPath
  const images = useMemo(() => {
    if (!galleryPath) return [];

    // Load all images from the specified path using Vite's import.meta.glob
    const imageModules = import.meta.glob('/public/images/**/*.{jpg,jpeg,png,svg,webp}', {
      eager: true,
      as: 'url',
    });

    const loadedImages = [];
    const normalizedPath = galleryPath.replace(/^\//, '').replace(/\/$/, '');

    Object.entries(imageModules).forEach(([path], index) => {
      // Extract the path after /public/
      const publicPath = path.replace('/public', '');
      const imageDir = publicPath.substring(0, publicPath.lastIndexOf('/'));

      // Check if this image is in the specified gallery path or any subfolder under it
      // Example: if galleryPath is '/images/decorations', include:
      //   - /images/decorations/decoration-1.svg
      //   - /images/decorations/floral/flower-1.svg
      //   - /images/decorations/traditional/decor-1.svg
      const shouldInclude =
        imageDir === `/${normalizedPath}` || imageDir.startsWith(`/${normalizedPath}/`);

      if (shouldInclude) {
        const fileName = publicPath.split('/').pop();
        const name = fileName
          .replace(/\.(jpg|jpeg|png|svg|webp)$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());

        loadedImages.push({
          id: index + 1,
          src: publicPath,
          name: name,
        });
      }
    });

    return loadedImages.sort((a, b) => a.src.localeCompare(b.src));
  }, [galleryPath]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleToggleSelect = (image) => {
    setSelectedImages((prev) => {
      const isSelected = prev.some((img) => img.id === image.id);
      if (isSelected) {
        return prev.filter((img) => img.id !== image.id);
      } else {
        return [...prev, image];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(selectedImages);
    setSelectedImages([]);
    onClose();
  };

  const isSelected = (imageId) => selectedImages.some((img) => img.id === imageId);

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-modal-header">
          <h2 className="gallery-modal-title">Select Decoration Styles</h2>
          <button className="gallery-modal-close" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="gallery-carousel">
          <button className="carousel-btn carousel-btn-prev" onClick={handlePrevious}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="carousel-main">
            <div className="carousel-image-container">
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].name}
                className="carousel-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Decoration+Image';
                }}
              />
              <button
                className={`carousel-select-btn ${isSelected(images[currentIndex].id) ? 'selected' : ''}`}
                onClick={() => handleToggleSelect(images[currentIndex])}
              >
                {isSelected(images[currentIndex].id) ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                )}
                {isSelected(images[currentIndex].id) ? 'Selected' : 'Select'}
              </button>
            </div>
            <p className="carousel-image-name">{images[currentIndex].name}</p>
            <p className="carousel-counter">
              {currentIndex + 1} / {images.length}
            </p>
          </div>

          <button className="carousel-btn carousel-btn-next" onClick={handleNext}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div className="gallery-thumbnails">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`gallery-thumbnail ${index === currentIndex ? 'active' : ''} ${isSelected(image.id) ? 'selected' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={image.src}
                alt={image.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150x100?text=Decoration';
                }}
              />
              {isSelected(image.id) && (
                <div className="thumbnail-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="gallery-modal-footer">
          <div className="gallery-selected-count">{selectedImages.length} selected</div>
          <div className="gallery-modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirm}
              disabled={selectedImages.length === 0}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
