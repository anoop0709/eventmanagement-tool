import './FormCard.css';

export function FormCard({ children, actions }) {
  return (
    <div className="create-event-card">
      {children}
      {actions && <div className="form-actions">{actions}</div>}
    </div>
  );
}
