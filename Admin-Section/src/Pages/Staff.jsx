import { useState } from "react";
import { createStaff } from "../Fetch/FetchAPI";
import Notice from "../Component/Notice";
import PageHeader from "../Component/PageHeader";

// Mirrors ROLE_PERMISSIONS in API/Utils/rbac.js (descriptions only; the API decides access).
const ROLE_OPTIONS = [
  { value: "support", label: "Support", description: "View orders, products and dashboard; handle chat; moderate reviews." },
  { value: "manager", label: "Manager", description: "Everything Support can do, plus manage products, orders, payments, promotions, inventory and messages." },
  { value: "admin", label: "Admin", description: "Full access, including creating staff accounts." },
];

const EMPTY_FORM = { username: "", email: "", password: "", role: "support" };

const Staff = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { ok: boolean, text: string }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await createStaff(formData);
      setStatus({ ok: true, text: `Created ${formData.role} account for ${formData.username}.` });
      setFormData(EMPTY_FORM);
    } catch (error) {
      setStatus({ ok: false, text: error?.response?.data?.message || "Failed to create staff account." });
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Create an account for a team member. Their role decides what they can see and change" />
      <form className="card max-w-xl space-y-4 p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input id="username" name="username" value={formData.username} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="input" required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="password" className="label">Temporary password</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="input" autoComplete="new-password" required />
          </div>
        </div>
        <fieldset>
          <legend className="label">Role</legend>
          <div className="space-y-2">
            {ROLE_OPTIONS.map(({ value, label, description }) => (
              <label
                key={value}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors duration-150 ease-out ${
                  formData.role === value ? "border-ink" : "border-line-strong hover:border-ink-3"
                }`}
              >
                <input type="radio" name="role" value={value} checked={formData.role === value} onChange={handleChange} className="mt-0.5 accent-brand" />
                <span>
                  <span className="block text-sm text-ink">{label}</span>
                  <span className="block text-[13px] text-ink-3">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={loading} className="btn btn-dark">{loading ? "Creating" : "Create account"}</button>
        {status && <Notice tone={status.ok ? "ok" : "error"}>{status.text}</Notice>}
      </form>
    </div>
  );
};

export default Staff;
