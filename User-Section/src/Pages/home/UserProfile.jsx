import { useEffect, useMemo, useState } from "react";
import MyOrderPage from "./My_Order";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";
import axios from "axios";
import { FiLogOut, FiPackage, FiUser } from "react-icons/fi";
import { changePassword, fetchUserInfo, updateUserInfo } from "../../FetchAPI/Fetch";

const emptyProfile = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone_number: "",
  location: "",
  address: "",
  profile_picture: "",
};

const emptyPassword = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const UserProfile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [profileDraft, setProfileDraft] = useState(emptyProfile);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Personal");
  const [feedback, setFeedback] = useState(null);
  const [passwordForm, setPasswordForm] = useState(emptyPassword);

  const loadProfile = async () => {
    try {
      // First, try to load from localStorage (cached profile)
      const cachedProfile = localStorage.getItem("userProfile");
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfile(parsedProfile);
        setProfileDraft(parsedProfile);
        setPreviewUrl(parsedProfile.profile_picture ? `${NETWORK_CONFIG.apiBaseUrl}/${parsedProfile.profile_picture}` : "");
      }

      const response = await fetchUserInfo();
      const user = response?.data?.[0];

      if (!user) {
        setIsLoggedIn(false);
        return;
      }

      // Split username into first and last name if needed
      const nameParts = (user.username || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const nextProfile = {
        firstName: firstName,
        lastName: lastName,
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        location: user.location || "",
        address: user.address || "",
        profile_picture: user.profile_picture || "",
      };

      setProfile(nextProfile);
      setProfileDraft(nextProfile);
      setPreviewUrl(nextProfile.profile_picture ? `${NETWORK_CONFIG.apiBaseUrl}/${nextProfile.profile_picture}` : "");
      
      // Save to localStorage for persistence
      localStorage.setItem("userProfile", JSON.stringify(nextProfile));
      
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Still logged in if we have cached data
      const cachedProfile = localStorage.getItem("userProfile");
      if (cachedProfile) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      loadProfile();
      // Clear password fields on mount
      setPasswordForm(emptyPassword);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => () => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const avatarLabel = useMemo(() => getInitial(profile.username, profile.email), [profile.username, profile.email]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Ends the server session too, not only the local copy of the token
  const signOut = async () => {
    try {
      await axios.post(`${NETWORK_CONFIG.apiBaseUrl}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userProfile");
      window.location.href = "/";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      const fullName = `${profileDraft.firstName} ${profileDraft.lastName}`.trim();
      formData.append("username", fullName);
      formData.append("email", profileDraft.email);
      formData.append("phone_number", profileDraft.phone_number);
      formData.append("location", profileDraft.location);
      formData.append("address", profileDraft.address);
      formData.append("existing_profile_picture", profileDraft.profile_picture || "");

      if (selectedImage) {
        formData.append("profile_picture", selectedImage);
      }

      // The profile endpoint ignores passwords; they go through /user/change-password
      const wantsPassword = passwordForm.oldPassword || passwordForm.newPassword || passwordForm.confirmPassword;
      if (wantsPassword) {
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
          throw new Error("Enter your current password and a new one");
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          throw new Error("New passwords don\u2019t match");
        }
      }

      const response = await updateUserInfo(formData);
      if (wantsPassword) {
        await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      }
      if (response?.token) {
        localStorage.setItem("authToken", response.token);
      }

      setFeedback({ ok: true, text: wantsPassword ? "Profile and password updated" : "Profile updated" });
      localStorage.setItem("userProfile", JSON.stringify(profileDraft));
      setProfile(profileDraft);
      setPasswordForm(emptyPassword);
      await loadProfile();
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      setFeedback({ ok: false, text: serverMessage || error?.message || "Couldn\u2019t update your profile" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="page-container py-24 text-center text-sm text-ink-3">Loading your profile</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="page-container py-24 text-center">
        <p className="text-ink">Log in to see your profile and orders</p>
        <a href="/auth/login" className="btn btn-dark mt-6">Log in</a>
      </div>
    );
  }

  const tabs = [
    { id: "Personal", label: "Profile", icon: FiUser },
    { id: "My Order", label: "Orders", icon: FiPackage },
  ];

  return (
    <div className="page-container grid gap-8 pt-8 md:grid-cols-[220px_1fr]">
      <aside>
        <div className="flex items-center gap-3 px-2">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-raised text-sm text-ink-2">{avatarLabel}</span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{profile.username || "Your account"}</p>
            <p className="truncate text-xs text-ink-3">{profile.email}</p>
          </div>
        </div>
        <nav className="mt-6 flex gap-1 md:flex-col">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setActiveTab(id); setPasswordForm(emptyPassword); }}
              className={`flex h-9 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors duration-150 ease-out ${
                activeTab === id ? "bg-raised text-ink" : "text-ink-2 hover:bg-raised hover:text-ink"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} className="text-ink-3" />
              {label}
            </button>
          ))}
          <button type="button" onClick={signOut} className="flex h-9 items-center gap-2.5 rounded-lg px-2 text-sm text-ink-2 transition-colors duration-150 ease-out hover:bg-danger-soft hover:text-danger">
            <FiLogOut size={16} strokeWidth={1.5} />
            Log out
          </button>
        </nav>
      </aside>

      <main className="min-w-0">
        {activeTab === "Personal" && (
          <form onSubmit={handleProfileSubmit} className="max-w-2xl">
            <h1 className="text-3xl tracking-[-0.01em]">Profile</h1>

            <section className="card mt-8 p-6">
              <div className="flex flex-wrap items-center gap-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-raised text-xl text-ink-2">{avatarLabel}</span>
                )}
                <div className="flex gap-2">
                  <label className="btn btn-secondary btn-sm cursor-pointer">
                    Change photo
                    <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                  </label>
                  {previewUrl && (
                    <button type="button" onClick={() => { setProfileDraft({ ...profileDraft, profile_picture: "" }); setPreviewUrl(""); setSelectedImage(null); }} className="btn btn-ghost btn-sm">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="First name" name="firstName" value={profileDraft.firstName} onChange={handleProfileChange} autoComplete="given-name" />
                <Field label="Last name" name="lastName" value={profileDraft.lastName} onChange={handleProfileChange} autoComplete="family-name" />
                <Field label="Email" name="email" value={profileDraft.email} onChange={handleProfileChange} type="email" autoComplete="email" />
                <Field label="Phone" name="phone_number" value={profileDraft.phone_number} onChange={handleProfileChange} autoComplete="tel" />
                <div className="sm:col-span-2">
                  <Field label="Delivery address" name="address" value={profileDraft.address} onChange={handleProfileChange} autoComplete="street-address" />
                </div>
              </div>
            </section>

            <section className="card mt-4 p-6">
              <h2 className="text-base font-medium">Password</h2>
              <p className="mt-1 text-[13px] text-ink-3">Leave empty to keep your current password</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Current" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} type="password" autoComplete="current-password" />
                <Field label="New" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} type="password" autoComplete="new-password" />
                <Field label="Confirm new" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} type="password" autoComplete="new-password" />
              </div>
            </section>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? "Saving" : "Save changes"}</button>
              <button type="button" onClick={() => { loadProfile(); setPasswordForm(emptyPassword); setFeedback(null); }} className="btn btn-ghost">Discard</button>
              {feedback && <p className={`text-sm ${feedback.ok ? "text-brand" : "text-danger"}`} role="status">{feedback.text}</p>}
            </div>
          </form>
        )}

        {activeTab === "My Order" && <MyOrderPage />}
      </main>
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = "text", autoComplete = "on" }) => (
  <div>
    <label htmlFor={name} className="label">{label}</label>
    <input id={name} name={name} value={value} onChange={onChange} type={type} autoComplete={autoComplete} className="input" />
  </div>
);

const getInitial = (username, email) => (username || email || "U").trim().charAt(0).toUpperCase();

export default UserProfile;
