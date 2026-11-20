import Playlist from "../models/Playlist.js";
import Song from "../models/song.js";
import User from "../models/User.js";

export const createPlaylist = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required",
      });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description || "",
      image: image || "",
      owner: req.user._id,
      songs: [],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { playlists: playlist._id },
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate("songs")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: playlists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("songs");

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (name && name.trim()) {
      playlist.name = name.trim();
    }

    if (description !== undefined) {
      playlist.description = description;
    }

    if (image !== undefined) {
      playlist.image = image;
    }

    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Playlist updated successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    await playlist.deleteOne();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { playlists: playlist._id },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const addSongToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "Song id is required",
      });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    const playlist = await Playlist.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (playlist.songs.some((songItem) => songItem.toString() === songId)) {
      return res.status(409).json({
        success: false,
        message: "Song already exists in this playlist",
      });
    }

    playlist.songs.push(song._id);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Song added to playlist",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const playlist = await Playlist.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    const initialLength = playlist.songs.length;
    playlist.songs = playlist.songs.filter(
      (songItem) => songItem.toString() !== songId
    );

    if (playlist.songs.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Song not found in playlist",
      });
    }

    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Song removed from playlist",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
