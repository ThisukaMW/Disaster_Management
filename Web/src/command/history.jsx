import "./dashboard.css";

function History({ items }) {
  return (
    <section className="panel history-panel">
      <div className="panel-header">
        <div>
          <p className="label">History</p>
          <h2>Recent incidents closed</h2>
        </div>
      </div>
      <div className="history-list">
        {items.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-dot" />
            <div>
              <p className="mono">{item.id}</p>
              <p className="history-title">{item.type}</p>
              <p className="muted">{item.result}</p>
            </div>
            <span className="muted">{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default History;

