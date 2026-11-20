import express from "express";

import uploadFile from "../middlewares/multer.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

import {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  searchAlbums,
} from "../controllers/albumController.js";

const router = express.Router();

router.get("/search", searchAlbums);
router.get("/", getAlbums);
router.get("/:id", getAlbumById);
router.post("/new", isAuth, isAdmin, uploadFile, createAlbum);
router.put("/:id", isAuth, isAdmin, uploadFile, updateAlbum);
router.delete("/:id", isAuth, isAdmin, deleteAlbum);

export default router;