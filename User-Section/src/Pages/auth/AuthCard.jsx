import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { logo } from "../Assets/image";

// Shared frame for the log-in and sign-up pages
export const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen flex-col items-center bg-page px-4 pt-16">
    <Link to="/" aria-label="Genius Store home">
      <img src={logo} alt="Genius Store" className="h-10 w-auto" />
    </Link>
    <div className="card mt-10 w-full max-w-sm p-6">
      <h1 className="text-xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
    {footer && <p className="mt-6 text-sm text-ink-2">{footer}</p>}
  </div>
);

export const PasswordField = ({ id, label, value, onChange, autoComplete, hint }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="input pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-3 hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <FiEyeOff size={16} strokeWidth={1.5} /> : <FiEye size={16} strokeWidth={1.5} />}
        </button>
      </div>
      {hint}
    </div>
  );
};
