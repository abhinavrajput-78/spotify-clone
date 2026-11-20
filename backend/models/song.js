import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    artist: {
      type: String,
      default: "Unknown Artist",
      trim: true,
    },

    image: {
      id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },

    audio: {
      id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },

    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },

    duration: {
      type: Number,
      default: 0,
    },

    genre: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Song = mongoose.model("Song", songSchema);

export default Song;