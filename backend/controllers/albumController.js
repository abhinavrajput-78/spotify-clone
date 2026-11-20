import fs from "fs";
import path from "path";

import TryCatch from "../utils/TryCatch.js";
import Album from "../models/Album.js";
import Song from "../models/song.js";

const getLocalFileUrl = (fileName) =>
  `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/${fileName}`;

export const createAlbum = TryCatch(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const { title, description, artist } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image",
    });
  }

  const fileName = req.file.filename;

  const album = await Album.create({
    title: title.trim(),
    description: description || "",
    artist: artist || "Unknown Artist",
    thumbnail: {
      id: fileName,
      url: getLocalFileUrl(fileName),
    },
    songs: [],
  });

  res.status(201).json({
    success: true,
    message: "Album Created Successfully",
    data: { album },
  });
});

export const getAlbums = TryCatch(async (_req, res) => {
  const albums = await Album.find().populate("songs").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: albums,
  });
});

export const getAlbumById = TryCatch(async (req, res) => {
  const album = await Album.findById(req.params.id).populate("songs");

  if (!album) {
    return res.status(404).json({
      success: false,
      message: "Album not found",
    });
  }

  res.status(200).json({
    success: true,
    data: { album },
  });
});

export const updateAlbum = TryCatch(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const album = await Album.findById(req.params.id);

  if (!album) {
    return res.status(404).json({
      success: false,
      message: "Album not found",
    });
  }

  const { title, description, artist } = req.body;

  if (title && title.trim()) album.title = title.trim();
  if (description !== undefined) album.description = description;
  if (artist && artist.trim()) album.artist = artist.trim();

  if (req.file) {
    const fileName = req.file.filename;
    album.thumbnail = {
      id: fileName,
      url: getLocalFileUrl(fileName),
    };
  }

  await album.save();

  res.status(200).json({
    success: true,
    message: "Album Updated Successfully",
    data: { album },
  });
});

export const deleteAlbum = TryCatch(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const album = await Album.findById(req.params.id);

  if (!album) {
    return res.status(404).json({
      success: false,
      message: "Album not found",
    });
  }

  if (album.thumbnail?.id) {
    const localImagePath = path.join(process.cwd(), "uploads", album.thumbnail.id);

    try {
      if (fs.existsSync(localImagePath)) {
        fs.unlinkSync(localImagePath);
      }
    } catch (error) {
      console.log("Album image delete failed:", error.message);
    }
  }

  await Song.deleteMany({ album: album._id });
  await album.deleteOne();

  res.status(200).json({
    success: true,
    message: "Album Deleted Successfully",
  });
});

export const searchAlbums = TryCatch(async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) {
    const albums = await Album.find().populate("songs").sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({
      success: true,
      data: albums,
    });
  }

  const albums = await Album.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
    ],
  })
    .populate("songs")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: albums,
  });
});