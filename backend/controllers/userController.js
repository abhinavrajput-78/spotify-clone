import User from "../models/User.js";
import Song from "../models/song.js";
import Playlist from "../models/Playlist.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

const sanitizeUser = (user) => {
  if (!user) return null;

  const data = user.toObject ? user.toObject() : user;
  const { password, ...safeUser } = data;

  return safeUser;
};

const getLocalProfileImagePath = (imageUrl) => {
  const uploadUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/`;

  if (typeof imageUrl !== "string" || !imageUrl.startsWith(uploadUrl)) {
    return null;
  }

  const fileName = imageUrl.slice(uploadUrl.length);

  if (!/^\d+-\d+\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
    return null;
  }

  return path.join(process.cwd(), "uploads", fileName);
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Save To Playlist
export const saveToPlaylist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.playlist.includes(req.params.id)) {
      user.playlist = user.playlist.filter(
        (songId) => songId !== req.params.id
      );

      await user.save();

      return res.json({
        success: true,
        message: "Removed from playlist",
      });
    }

    user.playlist.push(req.params.id);
    await user.save();

    res.json({
      success: true,
      message: "Added to playlist",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Toggle Liked Songs
export const toggleLikedSong = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.likedSongs.includes(req.params.id)) {
      user.likedSongs = user.likedSongs.filter(
        (songId) => songId !== req.params.id
      );

      await user.save();

      return res.json({
        success: true,
        message: "Removed from liked songs",
      });
    }

    user.likedSongs.push(req.params.id);
    await user.save();

    res.json({
      success: true,
      message: "Added to liked songs",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Add To Recently Played
export const addToRecentlyPlayed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove if already exists to avoid duplicates
    user.recentlyPlayed = user.recentlyPlayed.filter(
      (item) => item.songId !== req.params.id
    );

    // Add to the beginning with current timestamp
    user.recentlyPlayed.unshift({
      songId: req.params.id,
      playedAt: new Date(),
    });

    // Keep only last 50 songs
    if (user.recentlyPlayed.length > 50) {
      user.recentlyPlayed = user.recentlyPlayed.slice(0, 50);
    }

    await user.save();

    res.json({
      success: true,
      message: "Added to recently played",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const updateProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please choose a profile image",
    });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const previousImagePath = getLocalProfileImagePath(user.profileImage);
    user.profileImage = `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    await user.save();

    if (previousImagePath && previousImagePath !== req.file.path) {
      await fs.unlink(previousImagePath).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Profile image update failed",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new passwords are required",
      });
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Passwords must be valid text values",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        success: false,
        message: "Account password is not configured correctly",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const likedSongs = await Song.find({
      _id: { $in: user.likedSongs },
    }).populate("album").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: likedSongs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getRecentlyPlayed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const songIds = user.recentlyPlayed.map((item) => item.songId);

    const songs = await Song.find({ _id: { $in: songIds } }).populate("album");
    const songMap = new Map(songs.map((song) => [String(song._id), song]));

    const sortedHistory = [...user.recentlyPlayed]
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .map((item) => ({
        ...item,
        song: songMap.get(String(item.songId)) || null,
      }))
      .filter((item) => item.song);

    res.status(200).json({
      success: true,
      data: sortedHistory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const recentlyPlayedIds = user.recentlyPlayed.map((item) => String(item.songId));
    const likedSongIds = user.likedSongs.map(String);
    const playlistSongIds = (user.playlist || []).map(String);
    const preferredSongIds = [...new Set([...likedSongIds, ...recentlyPlayedIds, ...playlistSongIds])];

    let candidateSongs = await Song.find()
      .populate("album")
      .sort({ createdAt: -1 })
      .limit(50);

    if (candidateSongs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const likedSongs = await Song.find({ _id: { $in: likedSongIds } }).populate("album");
    const likedArtists = new Set(likedSongs.map((song) => song.artist).filter(Boolean));
    const likedGenres = new Set(likedSongs.map((song) => song.genre).filter(Boolean));

    const scoredSongs = candidateSongs
      .filter((song) => !preferredSongIds.includes(String(song._id)))
      .map((song) => {
        let score = 0;

        if (recentlyPlayedIds.includes(String(song._id))) score += 5;
        if (likedArtists.has(song.artist)) score += 4;
        if (likedGenres.has(song.genre)) score += 3;
        if (song.album && song.album.artist && likedArtists.has(song.album.artist)) score += 2;

        return { song, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => item.song);

    const fallbackSongs = likedSongs.length
      ? await Song.find({
          _id: { $nin: preferredSongIds },
          artist: { $in: [...likedArtists] },
        })
          .populate("album")
          .limit(8)
      : [];

    const finalRecommendations = [...scoredSongs, ...fallbackSongs].filter(
      (song, index, arr) =>
        arr.findIndex((item) => String(item._id) === String(song._id)) === index
    );

    res.status(200).json({
      success: true,
      data: finalRecommendations.slice(0, 12),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const [totalUsers, totalSongs, totalAlbums, totalPlaylists] = await Promise.all([
      User.countDocuments(),
      Song.countDocuments(),
      (await import("../models/Album.js")).default.countDocuments(),
      Playlist.countDocuments(),
    ]);

    const users = await User.find().select("-password");
    const totalLikedSongs = users.reduce((sum, currentUser) => sum + (currentUser.likedSongs?.length || 0), 0);
    const totalRecentlyPlayed = users.reduce((sum, currentUser) => sum + (currentUser.recentlyPlayed?.length || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSongs,
        totalAlbums,
        totalPlaylists,
        totalLikedSongs,
        totalRecentlyPlayed,
        totalAdmins: users.filter((user) => user.role === "admin").length,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};