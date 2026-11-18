import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AUTHENDPOINT, NETWORK_CONFIG } from "../../network/Network_EndPoint";
import { AuthCard, PasswordField } from "./AuthCard";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${NETWORK_CONFIG.apiBaseUrl}${AUTHENDPOINT.LOGIN}`,
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("authToken", response.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn’t log in. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Track orders and check out faster"
      footer={
        <>
          New to Genius Store? <Link to="/auth/signup" className="text-ink underline underline-offset-2">Create an account</Link>
        </>
      }
    >
      <form onSubmit={login} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="input" required />
        </div>
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        {error && <p className="field-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-dark w-full">
          {loading ? "Logging in" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;
