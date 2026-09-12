import { Link } from 'react-router-dom';

/**
 * EmptyState Component
 * Displays attractive FontAwesome icon + friendly text + CTA button when data lists are empty.
 */
export default function EmptyState({
  icon = 'fa-folder-open',
  title = 'Belum Ada Data',
  description = 'Data tidak ditemukan atau belum ditambahkan ke sistem.',
  actionLink,
  actionText,
  onActionClick,
}) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-desc">{description}</div>
      {actionLink && actionText && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          <i className="fa-solid fa-plus" /> {actionText}
        </Link>
      )}
      {!actionLink && onActionClick && actionText && (
        <button type="button" onClick={onActionClick} className="btn btn-primary btn-sm">
          <i className="fa-solid fa-plus" /> {actionText}
        </button>
      )}
    </div>
  );
}
