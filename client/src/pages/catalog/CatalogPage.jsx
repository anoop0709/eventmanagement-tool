import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { catalogAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import './CatalogPage.css';
import { useSnackbar } from '../../context/SnackbarContext';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog/ConfirmationDialog';

export default function CatalogPage() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { category, image }
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await catalogAPI.getDecorations();
      setCatalog(data);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCatalog =
    selectedCategory === 'all'
      ? catalog
      : catalog.filter((cat) => cat.category === selectedCategory);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setUploadError(null);
    setUploadFiles([]);
    setUploadCategory(catalog[0]?.category || 'modern');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate all files
    const invalidFiles = files.filter((file) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'image/webp',
      ];
      const isValidType = allowedTypes.includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      setUploadError('All files must be images (JPEG, PNG, GIF, SVG, WebP) under 5MB');
      return;
    }

    setUploadFiles(files);
    setUploadError(null);
  };

  const removeFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (uploadFiles.length === 0) {
      setUploadError('Please select at least one image file');
      return;
    }

    if (!uploadCategory) {
      setUploadError('Please select a category');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Upload all files
      for (let i = 0; i < uploadFiles.length; i++) {
        await catalogAPI.uploadDecoration(uploadFiles[i], uploadCategory);
      }

      // Refresh catalog
      await fetchCatalog();

      // Close modal and reset
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadCategory('');
    } catch (error) {
      setUploadError(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadFiles([]);
    setUploadError(null);
  };

  // Handler to open confirmation dialog
  const handleDeleteClick = (category, image) => {
    setDeleteTarget({ category, image });
    setDeleteDialogOpen(true);
  };

  // Handler to confirm deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await catalogAPI.deleteDecoration(deleteTarget.category, deleteTarget.image.name);
      await fetchCatalog();
      showSnackbar('Image deleted', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to delete image', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // Handler to close dialog
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="catalog-page">
          <div className="catalog-header">
            <div>
              <h1>Decoration Catalog</h1>
              <p className="catalog-subtitle">Browse our collection of decoration styles</p>
            </div>
            {user?.isAdmin && (
              <button className="btn-upload" onClick={handleUploadClick}>
                📤 Upload Image
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="catalog-filters">
            <button
              className={`catalog-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </button>
            {catalog.map((cat) => (
              <button
                key={cat.category}
                className={`catalog-filter-btn ${
                  selectedCategory === cat.category ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(cat.category)}
              >
                {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} ({cat.count})
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="catalog-loading">Loading catalog...</div>
          ) : catalog.length === 0 ? (
            <div className="catalog-empty">No decorations found.</div>
          ) : (
            <div className="catalog-content">
              {filteredCatalog.map((category) => (
                <div key={category.category} className="catalog-category">
                  <h2 className="catalog-category-title">
                    {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                  </h2>
                  <div className="catalog-gallery">
                    {category.images.map((image, index) => (
                      <div key={index} className="catalog-image-card">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="catalog-image"
                          loading="lazy"
                          onClick={() => handleImageClick(image.url)}
                        />
                        <div className="catalog-image-overlay">
                          <span className="catalog-image-name">{image.name}</span>
                        </div>
                        {user?.isAdmin && (
                          <button
                            className={'catalog-delete-btn btn-secondary btn-small'}
                            title="Delete image"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(category.category, image);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Modal */}
          {selectedImage && (
            <div className="catalog-modal" onClick={closeModal}>
              <div className="catalog-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="catalog-modal-close" onClick={closeModal}>
                  ✕
                </button>
                <img
                  src={selectedImage}
                  alt="Selected decoration"
                  className="catalog-modal-image"
                />
              </div>
            </div>
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="catalog-modal" onClick={closeUploadModal}>
              <div className="catalog-upload-modal" onClick={(e) => e.stopPropagation()}>
                <div className="upload-modal-header">
                  <h2>Upload Decoration Image</h2>
                  <button className="catalog-modal-close" onClick={closeUploadModal}>
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="upload-form">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      required
                      className="upload-select"
                    >
                      {catalog.map((cat) => (
                        <option key={cat.category} value={cat.category}>
                          {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="image">Select Images (Max 5MB each)</label>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="upload-file-input"
                    />
                  </div>

                  {uploadFiles.length > 0 && (
                    <div className="file-list">
                      <p className="file-count">
                        {uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''} selected:
                      </p>
                      <ul>
                        {uploadFiles.map((file, index) => (
                          <li key={index}>
                            <span className="file-name">{file.name}</span>
                            {!uploading && (
                              <button
                                type="button"
                                className="remove-file-btn"
                                onClick={() => removeFile(index)}
                                title="Remove file"
                              >
                                ✕
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {uploadError && <div className="upload-error">{uploadError}</div>}

                  <div className="upload-modal-actions">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="btn-cancel"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-upload"
                      disabled={uploading || uploadFiles.length === 0}
                    >
                      {uploading
                        ? `Uploading ${uploadFiles.length} file${uploadFiles.length > 1 ? 's' : ''}...`
                        : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => handleDeleteCancel()}
          onConfirm={handleDeleteConfirm}
          title="Confirm Submission"
          message={'Are you sure you want to delete this image? This action cannot be undone.'}
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />
      </AppShell>
    </ProtectedRoute>
  );
}
