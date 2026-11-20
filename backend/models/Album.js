import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
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

    thumbnail: {
      id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },

    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Album = mongoose.model("Album", albumSchema);

export default Album;