import React, { useEffect, useMemo, useState } from "react";
import MyOrderPage from "./My_Order";
import { NETWORK_CONFIG } from "../../network/Network_EndPoint";
import { fetchUserInfo, updateUserInfo, changePassword } from "../../FetchAPI/Fetch";

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
  const [feedback, setFeedback] = useState("");
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

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

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
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
    setFeedback("");

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

      // Add password if old password is provided
      if (passwordForm.oldPassword && passwordForm.newPassword) {
        formData.append("oldPassword", passwordForm.oldPassword);
        formData.append("newPassword", passwordForm.newPassword);
      }

      const response = await updateUserInfo(formData);
      if (response?.token) {
        localStorage.setItem("authToken", response.token);
      }

      setFeedback("Profile updated successfully.");
      localStorage.setItem("userProfile", JSON.stringify(profileDraft));
      setProfile(profileDraft);
      setPasswordForm(emptyPassword);
      await loadProfile();
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      setFeedback(serverMessage || error?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={styles.loginMessage}><p>Loading your profile...</p></div>;
  }

  if (!isLoggedIn) {
    return <div style={styles.loginMessage}><p>Please log in to access your profile and orders.</p></div>;
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarProfile}>
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" style={styles.sidebarProfileImage} />
            ) : (
              <div style={styles.sidebarAvatar}>{avatarLabel}</div>
            )}
            <div style={styles.sidebarTextContainer}>
              <p style={styles.sidebarProfileName}>{profile.username || "Your name"}</p>
              <p style={styles.sidebarProfileEmail}>{profile.email || "Your email"}</p>
            </div>
          </div>
          <div style={styles.sidebarArrow}>&gt;</div>
        </div>

        <nav style={styles.sidebarMenu}>
          {[
            "My Order",
            "Personal",
          ].map((item) => (
            <button key={item} type="button" onClick={() => {
              setActiveTab(item);
              // Clear password fields when switching tabs
              if (item === "Personal") {
                setPasswordForm(emptyPassword);
              }
            }} style={styles.sidebarItem(activeTab === item)}>
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("userProfile");
              window.location.href = "/";
            }}
            style={styles.sidebarLogout}
          >
            Sign out
          </button>
        </nav>
      </aside>

      <main style={styles.mainContent}>
        <section style={styles.card}>
          <div style={styles.headerContainer}>
            <div style={styles.profileInfo}>
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" style={styles.profileImageHeader} />
              ) : (
                <div style={styles.profileAvatar}>{avatarLabel}</div>
              )}
              <div style={styles.textContainer}>
                <h3 style={styles.profileName}>{profile.firstName} {profile.lastName}</h3>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <label style={styles.uploadButton}>
                Upload New Photo
                <input type="file" accept="image/*" onChange={handleImageChange} style={styles.hiddenInput} />
              </label>
              <button type="button" style={styles.deleteButton} onClick={() => {
                setProfileDraft({ ...profileDraft, profile_picture: "" });
                setPreviewUrl("");
                setSelectedImage(null);
              }}>
                Delete
              </button>
            </div>
          </div>

          {activeTab === "Personal" && (
            <form onSubmit={handleProfileSubmit}>
              <div style={styles.formGrid}>
                <Field label="First Name" name="firstName" value={profileDraft.firstName} onChange={handleProfileChange} placeholder="Enter first name" />
                <Field label="Last Name" name="lastName" value={profileDraft.lastName} onChange={handleProfileChange} placeholder="Enter last name" />
              </div>
              <div style={styles.formGrid}>
                <Field label="Email Address" name="email" value={profileDraft.email} onChange={handleProfileChange} placeholder="Enter email address" type="email" />
              </div>
              <div style={styles.formGrid}>
                <Field label="Phone Number" name="phone_number" value={profileDraft.phone_number} onChange={handleProfileChange} placeholder="Enter phone number" />
              </div>
              <div style={styles.formGrid}>
                <Field label="Address" name="address" value={profileDraft.address} onChange={handleProfileChange} placeholder="Enter delivery address" />
              </div>
              <div style={styles.formGrid}>
                <Field label="Current Password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} placeholder="Enter current password" type="password" autoComplete="current-password" />
                <div style={styles.passwordFieldContainer}>
                  <Field label="New Password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="Enter new password" type={showPasswords.newPassword ? "text" : "password"} autoComplete="new-password" />
                  <button type="button" style={styles.eyeButton} onClick={() => togglePasswordVisibility("newPassword")}>
                    {showPasswords.newPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.passwordFieldContainer}>
                  <Field label="Confirm New Password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" type={showPasswords.confirmPassword ? "text" : "password"} autoComplete="new-password" />
                  <button type="button" style={styles.eyeButton} onClick={() => togglePasswordVisibility("confirmPassword")}>
                    {showPasswords.confirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div style={styles.actionRow}>
                <button type="button" style={styles.signoutButton} onClick={() => {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userProfile");
                  window.location.href = "/";
                }}>
                  Sign out
                </button>
                <button type="button" style={styles.cancelButton} onClick={() => {
                  loadProfile();
                  setPasswordForm(emptyPassword);
                }}>
                  Cancel
                </button>
                <button type="submit" style={styles.editButton} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</button>
              </div>
              {feedback ? <p style={styles.feedbackText}>{feedback}</p> : null}
            </form>
          )}

          {activeTab === "My Order" && (
            <div style={styles.sectionSpacing}>
              <MyOrderPage />
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const Field = ({ label, name, value, onChange, placeholder, type = "text", autoComplete = "on" }) => (
  <label style={styles.field}>
    <span style={styles.fieldLabel}>{label}</span>
    <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} style={styles.input} autoComplete={autoComplete} />
  </label>
);

const SectionPlaceholder = ({ title, text }) => (
  <div style={styles.placeholderBox}>
    <h3 style={styles.placeholderTitle}>{title}</h3>
    <p style={styles.placeholderText}>{text}</p>
  </div>
);

const getInitial = (username, email) => (username || email || "U").trim().charAt(0).toUpperCase();

const styles = {
  container: { display: "flex", fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f9f9f9" },
  loginMessage: { textAlign: "center", marginTop: "20px", fontSize: "16px", minHeight: "50vh", backgroundColor: "#f9f9f9", color: "#4CAF4F" },
  sidebar: { width: "25%", backgroundColor: "#f4f4f4", padding: "15px", display: "flex", flexDirection: "column", alignItems: "center" },
  sidebarHeader: { backgroundColor: "#a8d5a5", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", borderRadius: "8px", marginBottom: "15px", width: "100%" },
  sidebarProfile: { display: "flex", alignItems: "center" },
  sidebarProfileImage: { width: "35px", height: "35px", borderRadius: "50%", marginRight: "10px", objectFit: "cover", border: "3px solid #16a34a" },
  sidebarAvatar: { width: "35px", height: "35px", borderRadius: "50%", marginRight: "10px", backgroundColor: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: "3px solid #16a34a" },
  sidebarTextContainer: { display: "flex", flexDirection: "column" },
  sidebarProfileName: { fontSize: "14px", fontWeight: "bold", margin: 0 },
  sidebarProfileEmail: { fontSize: "12px", color: "#333", margin: 0 },
  sidebarArrow: { fontSize: "16px", fontWeight: "bold", color: "#000" },
  sidebarMenu: { listStyle: "none", padding: 0, width: "100%", display: "grid", gap: "10px" },
  sidebarItem: (isActive) => ({ padding: "10px 15px", cursor: "pointer", border: "1px solid #d1d5db", borderRadius: "10px", textAlign: "left", fontWeight: isActive ? "bold" : "normal", backgroundColor: isActive ? "#e9f8ee" : "#fff", color: isActive ? "#15803d" : "inherit" }),
  sidebarLogout: { padding: "10px 15px", cursor: "pointer", border: "1px solid #fecaca", borderRadius: "10px", textAlign: "left", fontWeight: 700, backgroundColor: "#fff1f2", color: "#b91c1c" },
  mainContent: { flex: 1, padding: "20px" },
  card: { backgroundColor: "#fff", borderRadius: "18px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" },
  headerContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "18px", flexWrap: "wrap" },
  profileInfo: { display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" },
  profileImageHeader: { width: "55px", height: "55px", borderRadius: "50%", objectFit: "cover", border: "3px solid #16a34a" },
  profileAvatar: { width: "55px", height: "55px", borderRadius: "50%", backgroundColor: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", border: "3px solid #16a34a" },
  textContainer: { display: "flex", flexDirection: "column" },
  profileName: { margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" },
  profileRole: { margin: 0, fontSize: "14px", color: "#4b5563" },
  profileLocation: { margin: 0, fontSize: "14px", color: "#6b7280" },
  uploadButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 18px", borderRadius: "12px", backgroundColor: "#eef6f0", color: "#15803d", fontWeight: 700, cursor: "pointer", border: "1px solid #bbf7d0", minWidth: "140px" },
  deleteButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 18px", borderRadius: "12px", backgroundColor: "#fff", color: "#dc2626", fontWeight: 700, cursor: "pointer", border: "1px solid #fecaca" },
  hiddenInput: { display: "none" },
  tabRow: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "18px" },
  tabButton: (active) => ({ border: "1px solid #d1d5db", backgroundColor: active ? "#16a34a" : "#fff", color: active ? "#fff" : "#111827", borderRadius: "999px", padding: "10px 16px", fontWeight: 700, cursor: "pointer" }),
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "10px" },
  field: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  fieldLabel: { fontSize: "13px", fontWeight: 700, color: "#374151" },
  input: { height: "48px", borderRadius: "12px", border: "1px solid #d1d5db", padding: "0 40px 0 14px", outline: "none", backgroundColor: "#fff", width: "100%", boxSizing: "border-box" },
  actionRow: { marginTop: "18px", display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" },
  editButton: { border: "none", borderRadius: "12px", backgroundColor: "#16a34a", color: "#fff", padding: "12px 20px", fontWeight: 700, cursor: "pointer" },
  signoutButton: { border: "1px solid #cbd5e1", borderRadius: "12px", backgroundColor: "#fff", color: "#4b5563", padding: "12px 20px", fontWeight: 700, cursor: "pointer" },
  cancelButton: { border: "1px solid #cbd5e1", borderRadius: "12px", backgroundColor: "#fff", color: "#4b5563", padding: "12px 20px", fontWeight: 700, cursor: "pointer" },
  feedbackText: { margin: 0, fontSize: "14px", color: "#374151" },
  sectionSpacing: { marginTop: "18px", marginBottom: "22px" },
  placeholderBox: { padding: "28px", borderRadius: "16px", border: "1px dashed #cbd5e1", backgroundColor: "#f8fafc" },
  placeholderTitle: { margin: 0, fontSize: "18px", fontWeight: 700 },
  placeholderText: { marginTop: "8px", color: "#6b7280" },
  checkboxRow: { display: "flex", alignItems: "center", gap: "10px", marginTop: "16px", fontWeight: 600, color: "#374151" },
  passwordFieldContainer: { position: "relative", display: "flex", alignItems: "center", width: "100%" },
  eyeButton: { position: "absolute", right: "14px", bottom: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" },
};

export default UserProfile;