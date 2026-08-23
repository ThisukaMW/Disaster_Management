import { useState, useEffect } from "react";
import { createResponderAccount, subscribeToResponders } from "../firebase";
import "./responder-management.css";

function ResponderManagement() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [responders, setResponders] = useState([]);

  // Subscribe to responders list
  useEffect(() => {
    const unsubscribe = subscribeToResponders((data) => {
      setResponders(data);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user types
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Create responder account
      // - Email and password are stored in Firebase Authentication (password is hashed securely)
      // - Only essential data (email, name, phone) is stored in Firestore "responders" collection
      console.log("Attempting to create account with:", {
        email: formData.email.trim(),
        passwordLength: formData.password.length,
        name: formData.name.trim(),
      });
      
      const uid = await createResponderAccount({
        email: formData.email.trim(),
        password: formData.password.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      console.log("✓ Responder account created successfully with UID:", uid);
      setSuccess(`Responder registered successfully! Email: ${formData.email} | Use this email and password to login.`);
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "",
      });
    } catch (err) {
      console.error("Error creating responder:", err);
      setError(err.message || "Failed to register responder. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="responder-management-page">
      <div className="page-header">
        <div>
          <p className="label">Responder Management</p>
          <h1>Register New Responder</h1>
          <p className="muted">Create new responder accounts for field operations</p>
        </div>
      </div>

      <div className="management-content">
        {/* Registration Form */}
        <div className="panel registration-panel">
          <div className="panel-header">
            <div>
              <p className="label">Registration</p>
              <h2>New Responder Account</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="responder-form">
            {error && (
              <div className="form-message error warning-message-box">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div className="error-content">
                  <span className="error-text">{error.split('\n')[0]}</span>
                  {error.includes('\n') && (
                    <pre className="error-details">{error.split('\n').slice(1).join('\n')}</pre>
                  )}
                </div>
              </div>
            )}

            {success && (
              <div className="form-message success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="responder@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
                <p className="field-hint">Password must be at least 6 characters long</p>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 1V17M1 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Register Responder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Responders List */}
        <div className="panel list-panel">
          <div className="panel-header">
            <div>
              <p className="label">Registered Responders</p>
              <h2>All Responders ({responders.length})</h2>
            </div>
          </div>

          <div className="responders-list">
            {responders.length === 0 ? (
              <div className="empty-state">
                <p>No responders registered yet.</p>
                <p className="muted small">Register a new responder using the form above.</p>
              </div>
            ) : (
              <div className="responders-table">
                <div className="table-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Registered</span>
                </div>
                <div className="table-body">
                  {responders.map((responder) => (
                    <div key={responder.id} className="table-row">
                      <span className="responder-name">{responder.name || "N/A"}</span>
                      <span className="responder-email">{responder.email}</span>
                      <span>{responder.phone || "N/A"}</span>
                      <span className="mono small">
                        {responder.createdAt?.toDate
                          ? responder.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResponderManagement;
