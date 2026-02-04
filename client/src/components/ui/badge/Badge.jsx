import './Badge.css';

export function Badge({ status }) {
  const classMap = {
    Lead: 'badge badge-blue',
    Quoted: 'badge badge-amber',
    Confirmed: 'badge badge-emerald',
    'In Progress': 'badge badge-violet',
    Completed: 'badge badge-zinc',
  };

  return <span className={classMap[status]}>{status}</span>;
}
