import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../store/authSlice";
import { updateProfile, changePassword } from "../api/authApi";
import Loader from "../components/Loader";
import ImageLightbox from "../components/ImageLightbox";

function Profile() {
  const [activeTab, setActiveTab] = useState("edit");
  const [showForms, setShowForms] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.auth);
  const [profileForm, setProfileForm] = useState({
    bio: "",
    first_name: "",
    last_name: "",
    email: "",
    profile_image: null,
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        bio: profile.bio || "",
        first_name: profile.user?.first_name || "",
        last_name: profile.user?.last_name || "",
        email: profile.user?.email || "",
        profile_image: null,
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await updateProfile(profileForm);
      setMessage("Profile updated successfully.");
      dispatch(fetchProfile());
      setShowForms(false);
    } catch {
      setError("Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await changePassword(passwordForm);
      setMessage("Password changed successfully.");
      setPasswordForm({ old_password: "", new_password: "", new_password2: "" });
      setShowForms(false);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.old_password || data?.new_password?.[0] || "Password change failed.");
    }
  };

  if (loading && !profile) return <Loader />;

  const avatarUrl = profile?.profile_image || null;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.username;
  const initials = fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const bio = profile?.bio || "";
  const bioTruncated = bio.length > 120;

  return (
    <div className="container page">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!showForms ? (
        /* ── Full-width profile card ── */
        <div className="profile-card">
          <div className="profile-card-avatar">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="profile-avatar clickable-img" onClick={() => setLightbox(true)} />
              : <div className="profile-avatar-placeholder">{initials}</div>
            }
          </div>
          <div className="profile-card-info">
            <h2 className="profile-name">{fullName}</h2>
            <p className="profile-username">@{profile?.username}</p>
            <p className="profile-email">{profile?.email}</p>
            {bio && (
              <div className="profile-bio-wrap">
                <p className="profile-bio">
                  {bioExpanded || !bioTruncated ? bio : bio.slice(0, 280) + "…"}
                </p>
                {bioTruncated && (
                  <button className="bio-toggle" onClick={() => setBioExpanded((p) => !p)}>
                    {bioExpanded ? "See less" : "See more"}
                  </button>
                )}
              </div>
            )}
            <button className="btn btn-primary profile-edit-btn" onClick={() => setShowForms(true)}>
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-forms">
          <div className="profile-tabs">
            <button className={`profile-tab ${activeTab === "edit" ? "active" : ""}`} onClick={() => setActiveTab("edit")}>Edit Info</button>
            <button className={`profile-tab ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>Change Password</button>
            <button className="profile-tab profile-tab-cancel" onClick={() => setShowForms(false)}>✕ Cancel</button>
          </div>

          {activeTab === "edit" && (
            <form className="card" onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} />
              </div>
              <div className="form-group">
                <label>Profile Image</label>
                <input type="file" accept="image/*" onChange={(e) => setProfileForm({ ...profileForm, profile_image: e.target.files[0] })} />
              </div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          )}

          {activeTab === "password" && (
            <form className="card" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={passwordForm.new_password2} onChange={(e) => setPasswordForm({ ...passwordForm, new_password2: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          )}
        </div>
      )}
      {lightbox && <ImageLightbox src={avatarUrl} alt={fullName} onClose={() => setLightbox(false)} />}
    </div>
  );
}

export default Profile;
