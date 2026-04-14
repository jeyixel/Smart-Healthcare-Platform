"use client";

interface AdminAuthPanelProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  loading: boolean;
  isAuthenticated: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onRegister: () => void;
  onLogin: () => void;
  authRole: string | null;
}

export function AdminAuthPanel({
  email,
  password,
  firstName,
  lastName,
  loading,
  isAuthenticated,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onRegister,
  onLogin,
  authRole,
}: AdminAuthPanelProps) {
  return (
    <section className="panel auth-panel">
      <div className="auth-panel-head">
        <div>
          <p className="eyebrow">Operator sign-in</p>
          <h2>Access the admin console</h2>
          <p className="panel-subtitle">
            Register once, then login to manage patient status and review the
            live healthcare event stream.
          </p>
        </div>

        <div className={`auth-status ${isAuthenticated ? "auth-status-live" : "auth-status-muted"}`}>
          {isAuthenticated ? "Authenticated" : "Locked"}
          {authRole ? <span>{authRole}</span> : null}
        </div>
      </div>

      <div className="auth-panel-body">
        <div className="auth-panel-form">
          <div className="grid-two">
            <label>
              <span>Email</span>
              <input
                value={email}
                type="email"
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="admin@hospital.com"
                autoComplete="email"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                value={password}
                type="password"
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </label>

            <label>
              <span>First name</span>
              <input
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                placeholder="Admin"
                autoComplete="given-name"
              />
            </label>

            <label>
              <span>Last name</span>
              <input
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                placeholder="User"
                autoComplete="family-name"
              />
            </label>
          </div>

          <div className="actions-row auth-actions">
            <button
              disabled={loading}
              onClick={onRegister}
              className="btn btn-ghost"
              type="button"
            >
              Create account
            </button>
            <button disabled={loading} onClick={onLogin} className="btn" type="button">
              Sign in
            </button>
          </div>
        </div>

        <aside className="auth-panel-side">
          <div className="side-card">
            <span className="side-label">What you can do</span>
            <ul>
              <li>Register and authenticate administrators</li>
              <li>Update patient activation state</li>
              <li>View the async event trail when Kafka is online</li>
            </ul>
          </div>

          <div className="side-card side-card-muted">
            <span className="side-label">Current state</span>
            <p>
              {isAuthenticated
                ? "Session ready for patient operations."
                : "Login required before patient actions are enabled."}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
