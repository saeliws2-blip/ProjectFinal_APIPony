export default function DataState({ loading, error, onRetry, empty, emptyMessage }) {
  if (loading) {
    return (
      <div className="data-state loading-state" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <strong>กำลังโหลดข้อมูล...</strong>
        <div className="skeleton-list" aria-hidden="true">
          {[0, 1, 2].map((item) => <span key={item} />)}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="data-state error-state" role="alert">
        <span className="data-state-icon" aria-hidden="true">⚠️</span>
        <h2>โหลดข้อมูลไม่สำเร็จ</h2>
        <p>{error}</p>
        <p>ตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง</p>
        <button onClick={onRetry}>ลองโหลดอีกครั้ง</button>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="data-state empty-state" role="status">
        <span className="data-state-icon" aria-hidden="true">🦄</span>
        <h2>ยังไม่มีข้อมูล</h2>
        <p>{emptyMessage || "ไม่พบข้อมูลที่ต้องการ"}</p>
      </div>
    );
  }
  return null;
}
