import express from "express";

import { isAuth } from "../middlewares/isAuth.js";
import {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../controllers/playlistController.js";

const router = express.Router();

router.post("/", isAuth, createPlaylist);
router.get("/", isAuth, getPlaylists);
router.get("/:id", isAuth, getPlaylistById);
router.put("/:id", isAuth, updatePlaylist);
router.delete("/:id", isAuth, deletePlaylist);
router.post("/:id/songs", isAuth, addSongToPlaylist);
router.delete("/:id/songs/:songId", isAuth, removeSongFromPlaylist);

export default router;
