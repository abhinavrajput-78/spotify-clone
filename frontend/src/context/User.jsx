import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const normalizeUser = (userData) => {
    if (!userData) return null;

    return {
      ...userData,
      role: userData.role?.toLowerCase?.() || "user",
    };
  };

  // Register User
  const registerUser = async (name, email, password, navigate) => {
    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/register",
        { name, email, password },
        { withCredentials: true }
      );

      toast.success(data.message);

      const registeredUser = normalizeUser(data.user);
      setUser(registeredUser);
      setIsAuthenticated(true);

      navigate(registeredUser?.role === "admin" ? "/admin" : "/home", {
        replace: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Register Failed");
    } finally {
      setBtnLoading(false);
    }
  };

  // Login User
  const loginUser = async (email, password, navigate) => {
    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password },
        { withCredentials: true }
      );

      toast.success(data.message);

      const loggedInUser = normalizeUser(data.user || data);
      setUser(loggedInUser);
      setIsAuthenticated(true);

      if (loggedInUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    } finally {
      setBtnLoading(false);
    }
  };

  // Fetch User
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          withCredentials: true,
        }
      );

      const profileUser = normalizeUser(data.user);
      setUser(profileUser);
      setIsAuthenticated(Boolean(profileUser));
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/playlists", {
        withCredentials: true,
      });
      setPlaylists(data.data || data.playlists || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load playlists");
    }
  };

  const createPlaylist = async (name, description = "") => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/playlists",
        { name, description },
        { withCredentials: true }
      );
      toast.success(data.message || "Playlist created");
      await fetchPlaylists();
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to create playlist");
      return null;
    }
  };

  const updatePlaylist = async (id, payload) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/playlists/${id}`,
        payload,
        { withCredentials: true }
      );
      toast.success(data.message || "Playlist updated");
      await fetchPlaylists();
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update playlist");
      return null;
    }
  };

  const deletePlaylist = async (id) => {
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/playlists/${id}`, {
        withCredentials: true,
      });
      toast.success(data.message || "Playlist deleted");
      await fetchPlaylists();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete playlist");
      return false;
    }
  };

  const addSongToPlaylist = async (playlistId, songId) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/playlists/${playlistId}/songs`,
        { songId },
        { withCredentials: true }
      );
      toast.success(data.message || "Song added");
      await fetchPlaylists();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to add song");
      return false;
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/playlists/${playlistId}/songs/${songId}`,
        { withCredentials: true }
      );
      toast.success(data.message || "Song removed");
      await fetchPlaylists();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to remove song");
      return false;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Add to Playlist
  const addToPlaylist = async (id) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/users/song/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // Toggle Liked Songs
  const toggleLikedSong = async (id) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/users/like/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // Add To Recently Played
  const addToRecentlyPlayed = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/users/recently-played/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchUser();
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch Premium Plans
  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/payment/plans");
      if (data.success) {
        setPlans(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load plans", err);
    }
  };

  // Fetch Current Subscription
  const fetchSubscription = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/payment/subscription", {
        withCredentials: true,
      });
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription", err);
    }
  };

  // Subscribe to Spotify Premium Plan
  const subscribePlan = async (planId, paymentMethod = "card", billingDetails = {}) => {
    setPaymentLoading(true);
    try {
      // 1. Create order
      const orderRes = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        { planId },
        { withCredentials: true }
      );

      const orderData = orderRes.data?.order;

      // 2. Verify and activate subscription
      const verifyRes = await axios.post(
        "http://localhost:5000/api/payment/verify",
        {
          orderId: orderData?.orderId,
          planId,
          paymentMethod,
          billingDetails,
        },
        { withCredentials: true }
      );

      if (verifyRes.data?.success) {
        toast.success(verifyRes.data.message || "Welcome to Spotify Premium!");
        if (verifyRes.data.user) {
          setUser((prev) => ({
            ...prev,
            ...normalizeUser(verifyRes.data.user),
          }));
        } else {
          await fetchUser();
        }
        await fetchSubscription();
        return { success: true, receipt: verifyRes.data.receipt };
      }
      return { success: false };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Payment failed. Please try again.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setPaymentLoading(false);
    }
  };

  // Cancel Spotify Subscription
  const cancelSubscription = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/cancel",
        {},
        { withCredentials: true }
      );
      toast.success(data.message || "Subscription updated");
      await fetchSubscription();
      await fetchUser();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel subscription");
      return false;
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      await axios.get("http://localhost:5000/api/users/logout", {
        withCredentials: true,
      });

      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout Failed");
    }
  };

  return (
    <UserContext.Provider
      value={{
        loginUser,
        registerUser,
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        btnLoading,
        loading,
        logoutUser,
        addToPlaylist,
        fetchUser,
        toggleLikedSong,
        addToRecentlyPlayed,
        playlists,
        fetchPlaylists,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        plans,
        fetchPlans,
        subscription,
        fetchSubscription,
        subscribePlan,
        cancelSubscription,
        paymentLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);