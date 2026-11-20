import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { UserData } from "../context/User";
import {
  MdClose,
  MdEmail,
  MdEdit,
  MdLock,
  MdPhotoCamera,
  MdPerson,
  MdSave,
  MdWorkspacePremium,
  MdVerified,
  MdReceipt,
  MdCancel,
} from "react-icons/md";
import IconField from "../components/IconField";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    fetchUser,
    subscription,
    fetchSubscription,
    cancelSubscription,
  } = UserData();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || "");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isPremium = user?.isPremium;

  const handleAvatarChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Choose a JPG, PNG, or WebP image");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_PROFILE_IMAGE_SIZE) {
      toast.error("Profile images must be 5 MB or smaller");
      event.target.value = "";
      return;
    }

    setAvatarFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarPreview(reader.result);
    };
    reader.onerror = () => toast.error("Unable to preview this image");
    reader.readAsDataURL(selectedFile);
  };

  const cancelAvatarChange = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.profileImage || "");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const uploadProfileImage = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("file", avatarFile);

    try {
      setAvatarLoading(true);
      const { data } = await axios.put(
        "http://localhost:5000/api/users/me/avatar",
        formData,
        { withCredentials: true }
      );

      if (data.user) {
        setUser({
          ...data.user,
          role: data.user.role?.toLowerCase?.() || "user",
        });
        setAvatarPreview(data.user.profileImage || "");
      } else {
        await fetchUser();
      }

      setAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      toast.success(data.message || "Profile image updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile image update failed");
    } finally {
      setAvatarLoading(false);
    }
  };

  const cancelProfileEdit = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  const updateProfile = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setProfileLoading(true);
      const { data } = await axios.put(
        "http://localhost:5000/api/users/me",
        { name: name.trim(), email: email.trim() },
        { withCredentials: true }
      );
      toast.success(data.message || "Profile updated");

      if (data.user) {
        setUser({
          ...data.user,
          role: data.user.role?.toLowerCase?.() || "user",
        });
        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } else {
        await fetchUser();
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      const { data } = await axios.put(
        "http://localhost:5000/api/users/change-password",
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success(data.message || "Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#000000]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-2 md:px-6">
          <div className="spotify-main-container min-h-full p-6 bg-gradient-to-b from-[#2a2a2a] via-[#121212] to-[#121212]">
            <Navbar />

            {/* Profile Hero Header */}
            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end">
              <div className="relative group flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#282828] shadow-2xl ring-4 ring-[#181818]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-extrabold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition duration-200 group-hover:opacity-100"
                >
                  <MdPhotoCamera className="text-3xl text-white" />
                  <span className="text-[10px] font-bold text-white mt-1">Change Photo</span>
                </button>
              </div>

              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
                  Profile
                </span>
                <h1 className="mt-1 text-3xl font-extrabold text-white md:text-5xl">
                  {user?.name || "Spotify Listener"}
                </h1>
                <p className="mt-2 text-sm text-[#b3b3b3]">{user?.email}</p>

                <input
                  ref={avatarInputRef}
                  id="profile-image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />

                {avatarFile && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={uploadProfileImage}
                      disabled={avatarLoading}
                      className="spotify-btn-green py-1.5 px-4 text-xs font-bold"
                    >
                      {avatarLoading ? "Uploading..." : "Save Photo"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAvatarChange}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Spotify Premium Subscription Card */}
            <div className="mt-8 rounded-2xl border border-[#282828] bg-[#181818] p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#282828] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <MdWorkspacePremium className="text-2xl text-[#1ed760]" />
                    <h2 className="text-xl font-bold text-white">Your Spotify Plan</h2>
                  </div>
                  <p className="mt-1 text-sm text-[#b3b3b3]">
                    {isPremium
                      ? `You are currently subscribed to Spotify Premium ${user?.premiumPlan}.`
                      : "You are currently on Spotify Free with ad-supported streaming."}
                  </p>
                </div>

                <div>
                  {!isPremium ? (
                    <button
                      type="button"
                      onClick={() => navigate("/premium")}
                      className="spotify-btn-green text-xs font-bold py-2.5 px-6 shadow-md"
                    >
                      Upgrade to Premium
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#1ed760]/20 px-3 py-1 text-xs font-bold text-[#1ed760] border border-[#1ed760]/40">
                        ● Active
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate("/premium")}
                        className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                      >
                        Change Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isPremium && (
                <div className="mt-5 grid gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl bg-[#242424] p-4">
                    <p className="text-[#b3b3b3]">Plan Tier</p>
                    <p className="mt-1 text-base font-bold text-white">{user?.premiumPlan}</p>
                  </div>
                  <div className="rounded-xl bg-[#242424] p-4">
                    <p className="text-[#b3b3b3]">Days Remaining</p>
                    <p className="mt-1 text-base font-bold text-[#1ed760]">
                      {subscription?.daysRemaining || 30} days
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#242424] p-4">
                    <p className="text-[#b3b3b3]">Renewal / Expiry</p>
                    <p className="mt-1 text-base font-bold text-white">
                      {user?.premiumExpiresAt
                        ? new Date(user.premiumExpiresAt).toLocaleDateString()
                        : "Active"}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment History Invoices */}
              {subscription?.history?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <MdReceipt className="text-base text-[#1ed760]" />
                    Billing History & Receipts
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#b3b3b3]">
                      <thead>
                        <tr className="border-b border-[#282828] text-white">
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Receipt #</th>
                          <th className="py-2.5">Plan</th>
                          <th className="py-2.5">Amount</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#282828]">
                        {subscription.history.map((item) => (
                          <tr key={item._id} className="hover:bg-[#202020]">
                            <td className="py-2.5">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="py-2.5 font-mono text-white">{item.receiptNumber}</td>
                            <td className="py-2.5 font-semibold text-white">{item.planName}</td>
                            <td className="py-2.5 text-[#1ed760] font-bold">₹{item.amount}</td>
                            <td className="py-2.5">
                              <span className="rounded bg-[#1ed760]/20 px-2 py-0.5 text-[10px] font-bold text-[#1ed760] uppercase">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="rounded-xl bg-[#181818] p-4 border border-[#282828]">
                <p className="text-xs text-[#b3b3b3]">Playlists Created</p>
                <p className="mt-1 text-2xl font-bold text-white">{user?.playlist?.length || 0}</p>
              </div>

              <div className="rounded-xl bg-[#181818] p-4 border border-[#282828]">
                <p className="text-xs text-[#b3b3b3]">Liked Songs</p>
                <p className="mt-1 text-2xl font-bold text-white">{user?.likedSongs?.length || 0}</p>
              </div>

              <div className="rounded-xl bg-[#181818] p-4 border border-[#282828]">
                <p className="text-xs text-[#b3b3b3]">Recently Played</p>
                <p className="mt-1 text-2xl font-bold text-white">{user?.recentlyPlayed?.length || 0}</p>
              </div>

              <div className="rounded-xl bg-[#181818] p-4 border border-[#282828]">
                <p className="text-xs text-[#b3b3b3]">Account Type</p>
                <p className="mt-1 text-2xl font-bold text-[#1ed760]">
                  {isPremium ? "Premium" : "Free"}
                </p>
              </div>
            </div>

            {/* Edit details & Change password forms */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* Profile Details Form */}
              <form onSubmit={updateProfile} className="space-y-4 rounded-2xl bg-[#181818] p-6 border border-[#282828]">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Profile Details</h2>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:border-[#1ed760] hover:text-[#1ed760]"
                    >
                      <MdEdit className="inline mr-1" /> Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-[#b3b3b3] mb-1">Display Name</label>
                  <IconField icon={MdPerson}>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing || profileLoading}
                      required
                      className="auth-input auth-input-icon disabled:opacity-60"
                    />
                  </IconField>
                </div>

                <div>
                  <label className="block text-xs text-[#b3b3b3] mb-1">Email Address</label>
                  <IconField icon={MdEmail}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing || profileLoading}
                      required
                      className="auth-input auth-input-icon disabled:opacity-60"
                    />
                  </IconField>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="spotify-btn-green py-2 px-5 text-xs font-bold"
                    >
                      {profileLoading ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelProfileEdit}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {/* Password change form */}
              <form onSubmit={updatePassword} className="space-y-4 rounded-2xl bg-[#181818] p-6 border border-[#282828]">
                <h2 className="text-base font-bold text-white">Change Password</h2>

                <div>
                  <label className="block text-xs text-[#b3b3b3] mb-1">Current Password</label>
                  <IconField icon={MdLock}>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="auth-input auth-input-icon"
                    />
                  </IconField>
                </div>

                <div>
                  <label className="block text-xs text-[#b3b3b3] mb-1">New Password</label>
                  <IconField icon={MdLock}>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="auth-input auth-input-icon"
                    />
                  </IconField>
                </div>

                <div>
                  <label className="block text-xs text-[#b3b3b3] mb-1">Confirm New Password</label>
                  <IconField icon={MdLock}>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="auth-input auth-input-icon"
                    />
                  </IconField>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-full bg-white px-5 py-2 text-xs font-bold text-black transition hover:bg-[#f0f0f0] disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Profile;
