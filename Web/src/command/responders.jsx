import { useEffect, useState } from "react";
import "./dashboard.css";
import { createResponderAccount, subscribeToResponders } from "../firebase";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  zone: "",
  password: "",
  confirm: "",
};

function Responders() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = subscribeToResponders((rows) => setItems(rows));
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!form.email || !form.password || !form.name) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await createResponderAccount({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim(),
        zone: form.zone.trim(),
      });
      setMessage("Responder created successfully.");
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || "Failed to create responder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="label">Responders</p>
            <h2>Register responder access</h2>
          </div>
          <span className="badge neutral">Creates Auth user + Firestore profile</span>
        </div>

        {message && <div className="status-pill status-live" style={{ marginBottom: "0.6rem" }}>{message}</div>}
        {error && <div className="status-pill status-idle" style={{ marginBottom: "0.6rem", color: "#ffb4b4" }}>{error}</div>}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "0.75rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="label" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            Responder details
            <span className="muted small">Name, contact, zone</span>
          </div>
          <div style={{ display: "grid", gap: "0.6rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Responder name" required />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <input name="zone" value={form.zone} onChange={handleChange} placeholder="Zone (e.g., Western)" />
          </div>

          <div className="label" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            Login credentials
            <span className="muted small">Email + password used by responder app</span>
          </div>
          <div style={{ display: "grid", gap: "0.6rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" required />
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <input type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Confirm password" required />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
            <button type="button" className="close-btn" onClick={() => setForm(emptyForm)}>
              Reset
            </button>
            <button type="submit" className="dispatch-btn" disabled={loading}>
              {loading ? "Creating..." : "Create responder"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="label">Directory</p>
            <h2>Existing responders</h2>
          </div>
          <span className="badge">Live Firestore feed</span>
        </div>

        <div className="dispatch-table" role="table" aria-label="Responders table">
          <div className="table-head" role="row">
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Zone</span>
            <span>Role</span>
          </div>
          <div className="table-body">
            {items.length === 0 ? (
              <div className="empty-state">
                <p>No responders yet.</p>
              </div>
            ) : (
              items.map((r) => (
                <div key={r.id} className="table-row" role="row">
                  <span>{r.name || "N/A"}</span>
                  <span>{r.email || "N/A"}</span>
                  <span>{r.phone || "—"}</span>
                  <span>{r.zone || "—"}</span>
                  <span>{r.role || "responder"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Responders;

