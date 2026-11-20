import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    playlist: [
      {
        type: String,
      },
    ],

    playlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],

    likedSongs: [
      {
        type: String,
      },
    ],

    recentlyPlayed: [
      {
        songId: String,
        playedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isPremium: {
      type: Boolean,
      default: false,
    },

    premiumPlan: {
      type: String,
      default: "Free",
    },

    premiumExpiresAt: {
      type: Date,
      default: null,
    },

    subscriptionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", schema);