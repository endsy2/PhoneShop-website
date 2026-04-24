import React, { useEffect, useState } from "react";
import MyOrderPage from "./My_Order";
import { NETWORK_CONFIG, USERENDPOINT } from "../../network/Network_EndPoint";
import axios from "axios";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    address: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      getProfile();
    }
    // getProfile();
  }, []);
  const getProfile = async () => {

    try {
      const response = await axios.get(`${NETWORK_CONFIG.apiBaseUrl}${USERENDPOINT.GET_USERINFO}`, { withCredentials: true });
      if (response.status === 200) {
        const { username, email, address } = response.data.data[0]; // Assuming response structure
        setProfile({ username, email, address }); // Update profile state
        setIsLoggedIn(true);
      }

    } catch (error) {
      setIsLoggedIn(false);
      console.error("Error fetching profile:", error);
    }
  };



  return (
    <>
      {isLoggedIn ? (
        <div style={styles.container}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <div
                style={{ ...styles.sidebarProfile, cursor: "pointer" }}

              >
                <img
                  src="https://via.placeholder.com/50"
                  alt="Profile"
                  style={styles.sidebarProfileImage}
                />
                <div style={styles.sidebarTextContainer}>
                  <p style={styles.sidebarProfileName}>{profile.username}</p>
                  <p style={styles.sidebarProfileEmail}>{profile.email}</p>
                </div>
              </div>
              <div style={styles.sidebarArrow}>
                <span>&gt;</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={styles.mainContent}>
            <ProfileContent
              profile={profile}
            />
          </div>
        </div>
      ) : (
        <div style={styles.loginMessage}>
          <p>Please log in to access your profile and orders.</p>
        </div>
      )}
    </>
  );
};

const ProfileContent = ({ profile, setActiveSection }) => {

  return (
    <div>
      <>
        <div style={styles.headerContainer}>
          <div style={styles.profileInfo} onClick={() => setActiveSection("Profile")}>
            <img
              src="https://via.placeholder.com/60"
              alt="Profile"
              style={styles.profileImageHeader}
            />
            <div style={styles.textContainer}>
              <h3 style={styles.profileName}>{profile.username}</h3>
              <p style={styles.profileRole}>{profile.email}</p>
              <p style={styles.profileLocation}>{profile.address}</p>
            </div>
          </div>
        </div>
        <MyOrderPage />
      </>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
  },
  loginMessage: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "16px",
    minHeight: "50vh",
    backgroundColor: "#f9f9f9",
    color: "#4CAF4F",
  },
  sidebar: {
    width: "25%",
    backgroundColor: "#f4f4f4",
    padding: "15px", // Adjusted padding
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  sidebarHeader: {
    backgroundColor: "#a8d5a5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px", // Reduced padding for smaller size
    borderRadius: "8px",
    marginBottom: "15px", // Reduced margin
    width: "100%",
  },
  sidebarProfile: {
    display: "flex",
    alignItems: "center",
  },
  sidebarProfileImage: {
    width: "40px", // Reduced profile image size
    height: "40px", // Reduced profile image size
    borderRadius: "50%",
    marginRight: "10px",
  },
  sidebarTextContainer: {
    display: "flex",
    flexDirection: "column",
  },
  sidebarProfileName: {
    fontSize: "14px", // Reduced font size
    fontWeight: "bold",
    margin: 0,
  },
  sidebarProfileEmail: {
    fontSize: "12px", // Reduced font size
    color: "#333",
    margin: 0,
  },
  sidebarArrow: {
    fontSize: "16px", // Reduced arrow size
    fontWeight: "bold",
    color: "#000",
  },
  sidebarMenu: {
    listStyle: "none",
    padding: 0,
    width: "100%",
  },
  sidebarItem: (isActive) => ({
    padding: "8px 15px", // Reduced padding
    cursor: "pointer",

    borderBottom: "1px solid #ddd",
    textAlign: "left",
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "green" : "inherit", // Change color when active
  }),
  mainContent: {
    flex: 1,
    padding: "20px",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px", // Reduced margin
  },
  profileInfo: {
    display: "flex",
    alignItems: "center",
  },
  profileImageHeader: {
    width: "50px", // Reduced profile image size
    height: "50px", // Reduced profile image size
    borderRadius: "50%",
    marginRight: "15px",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
  },
  profileRole: {
    margin: 0,
    fontSize: "13px", // Reduced font size
    color: "#888",
  },
  profileLocation: {
    margin: 0,
    fontSize: "13px", // Reduced font size
    color: "#aaa",
  },
};

export default UserProfile;
