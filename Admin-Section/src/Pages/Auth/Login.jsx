import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginFetch } from "../../Fetch/FetchAPI";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginFetch(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Couldn’t log in. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h1 className="text-xl">Log in</h1>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="input" required />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="input" required />
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-dark w-full">
        {loading ? "Logging in" : "Log in"}
      </button>
      <p className="text-center text-[13px] text-ink-3">Staff accounts are created by an admin</p>
    </form>
  );
};

export default Login;
