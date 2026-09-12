/**
 * Custom Glassmorphism Confirm Modal
 * Replaces native browser confirm() dialog with accessible, animated modal.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  const iconClass =
    type === 'danger'
      ? 'fa-solid fa-triangle-exclamation text-danger'
      : type === 'warning'
      ? 'fa-solid fa-circle-exclamation text-warning'
      : 'fa-solid fa-circle-question text-primary';

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.75rem', display: 'flex' }}>
            <i className={iconClass} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{title}</h3>
        </div>

        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-circle-notch fa-spin" /> Memproses...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
