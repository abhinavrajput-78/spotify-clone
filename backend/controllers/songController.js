import fs from "fs";
import path from "path";
import * as mm from "music-metadata";

import TryCatch from "../utils/TryCatch.js";
import Song from "../models/song.js";
import Album from "../models/Album.js";

const getLocalFileUrl = (fileName) =>
  `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/${fileName}`;

const getSongImageFromAudio = async (filePath, fallbackUrl) => {
  try {
    const metadata = await mm.parseFile(filePath);
    const picture = metadata.common?.picture?.[0];

    if (!picture || !picture.data?.length) {
      return fallbackUrl;
    }

    const mimeType = picture.format || "image/jpeg";
    const base64Image = Buffer.from(picture.data).toString("base64");

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.log("Audio image parse failed:", error.message);
    return fallbackUrl;
  }
};

export const createSong = TryCatch(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const { title, description, artist, genre } = req.body;
  const albumId = req.params.id;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload an audio file",
    });
  }

  const album = await Album.findById(albumId);

  if (!album) {
    return res.status(404).json({
      success: false,
      message: "Album not found",
    });
  }

  const fileName = req.file.filename;
  const fallbackImageUrl = album.thumbnail?.url || getLocalFileUrl(fileName);
  const songImageUrl = await getSongImageFromAudio(req.file.path, fallbackImageUrl);

  const song = await Song.create({
    title: title.trim(),
    description: description || "",
    artist: artist || album.artist || "Unknown Artist",
    genre: genre || "",
    duration: Number(req.body.duration) || 0,
    image: {
      id: `${fileName}-cover`,
      url: songImageUrl,
    },
    audio: {
      id: fileName,
      url: getLocalFileUrl(fileName),
    },
    album: album._id,
  });

  if (!album.songs.includes(song._id)) {
    album.songs.push(song._id);
    await album.save();
  }

  res.status(201).json({
    success: true,
    message: "Song Created Successfully",
    data: { song },
  });
});

export const getSongs = TryCatch(async (req, res) => {
  const songs = await Song.find().populate("album").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: songs,
  });
});

export const getSingleSong = TryCatch(async (req, res) => {
  const song = await Song.findById(req.params.id).populate("album");

  if (!song) {
    return res.status(404).json({
      success: false,
      message: "Song not found",
    });
  }

  res.status(200).json({
    success: true,
    data: { song },
  });
});

export const updateSong = TryCatch(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const song = await Song.findById(req.params.id);

  if (!song) {
    return res.status(404).json({
      success: false,
      message: "Song not found",
    });
  }

  const { title, description, artist, genre } = req.body;

  if (title && title.trim()) song.title = title.trim();
  if (description !== undefined) song.description = description;
  if (artist && artist.trim()) song.artist = artist.trim();
  if (genre !== undefined) song.genre = genre;

  if (req.file) {
    const fileName = req.file.filename;
    song.audio = {
      id: fileName,
      url: getLocalFileUrl(fileName),
    };
  }

  await song.save();

  res.status(200).json({
    success: true,
    message: "Song Updated Successfully",
    data: { song },
  });
});

export const deleteSong = TryCatch(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const song = await Song.findById(req.params.id);

  if (!song) {
    return res.status(404).json({
      success: false,
      message: "Song not found",
    });
  }

  if (song.audio?.id) {
    const localAudioPath = path.join(process.cwd(), "uploads", song.audio.id);

    try {
      if (fs.existsSync(localAudioPath)) {
        fs.unlinkSync(localAudioPath);
      }
    } catch (error) {
      console.log("Song audio delete failed:", error.message);
    }
  }

  if (song.album) {
    await Album.findByIdAndUpdate(song.album, {
      $pull: {
        songs: song._id,
      },
    });
  }

  await song.deleteOne();

  res.status(200).json({
    success: true,
    message: "Song Deleted Successfully",
  });
});

export const searchSongs = TryCatch(async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) {
    const songs = await Song.find().populate("album").sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({
      success: true,
      data: songs,
    });
  }

  const songs = await Song.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
      { genre: { $regex: query, $options: "i" } },
    ],
  })
    .populate("album")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: songs,
  });
});