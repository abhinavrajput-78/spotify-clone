import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  myProfile,
  saveToPlaylist,
  toggleLikedSong,
  addToRecentlyPlayed,
  getLikedSongs,
  getRecentlyPlayed,
  updateProfile,
  changePassword,
  getRecommendations,
  getUserStats,
  getAllUsers,
  updateProfileImage,
} from "../controllers/userController.js";

import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { uploadAvatar } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuth, logoutUser);

router.get("/me", isAuth, myProfile);
router.put("/me", isAuth, updateProfile);
router.put("/me/avatar", isAuth, uploadAvatar, updateProfileImage);
router.put("/change-password", isAuth, changePassword);
router.get("/liked-songs", isAuth, getLikedSongs);
router.get("/recently-played", isAuth, getRecentlyPlayed);
router.get("/recommendations", isAuth, getRecommendations);

router.post("/song/:id", isAuth, saveToPlaylist);
router.post("/like/:id", isAuth, toggleLikedSong);
router.post("/recently-played/:id", isAuth, addToRecentlyPlayed);

router.get("/admin/users", isAuth, isAdmin, getAllUsers);
router.get("/admin/dashboard", isAuth, isAdmin, getUserStats);

export default router;