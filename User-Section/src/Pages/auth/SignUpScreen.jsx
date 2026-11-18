import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AUTHENDPOINT, NETWORK_CONFIG } from "../../network/Network_EndPoint";
import { AuthCard, PasswordField } from "./AuthCard";

const MIN_PASSWORD = 8;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;
  const mismatch = confirm.length > 0 && confirm !== password;
  const ready = username.trim() && email.trim() && password.length >= MIN_PASSWORD && confirm === password;

  const signUp = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        NETWORK_CONFIG.apiBaseUrl + AUTHENDPOINT.REGISTER,
        { username: username.trim(), email: email.trim(), password },
        { withCredentials: true }
      );
      localStorage.setItem("authToken", response.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn’t create the account. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Save your address and follow your orders"
      footer={
        <>
          Already have an account? <Link to="/auth/login" className="text-ink underline underline-offset-2">Log in</Link>
        </>
      }
    >
      <form onSubmit={signUp} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="name" className="input" required />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="input" required />
        </div>
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={<p className={`mt-1.5 text-[13px] ${tooShort ? "text-danger" : "text-ink-3"}`}>At least {MIN_PASSWORD} characters</p>}
        />
        <PasswordField
          id="confirm"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          hint={mismatch && <p className="field-error">Passwords don&apos;t match</p>}
        />
        {error && <p className="field-error" role="alert">{error}</p>}
        <button type="submit" disabled={!ready || loading} className="btn btn-dark w-full">
          {loading ? "Creating account" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Signup;
