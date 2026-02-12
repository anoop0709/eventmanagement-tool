import './ConfirmationDialog.css';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes, Submit',
  cancelText = 'Go Back',
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <div className="confirmation-dialog-header">
          <h2>{title}</h2>
        </div>
        <div className="confirmation-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirmation-dialog-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
