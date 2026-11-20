import express from "express";

import uploadFile from "../middlewares/multer.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

import {
  createSong,
  getSongs,
  getSingleSong,
  updateSong,
  deleteSong,
  searchSongs,
} from "../controllers/songController.js";

const router = express.Router();

router.get("/search", searchSongs);
router.get("/songs", getSongs);
router.get("/song/:id", getSingleSong);
router.post("/album/:id/song/new", isAuth, isAdmin, uploadFile, createSong);
router.put("/song/:id", isAuth, isAdmin, uploadFile, updateSong);
router.delete("/song/:id", isAuth, isAdmin, deleteSong);

export default router;