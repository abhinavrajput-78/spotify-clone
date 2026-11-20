import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { UserData } from "../context/User";
import { SongData } from "../context/Song";
import { FaPlay, FaRegClock, FaHeart } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";

const RecentlyPlayed = () => {
  const { user, toggleLikedSong } = UserData();
  const { playSong, selectedSong } = SongData();
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentlyPlayed = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/recently-played", {
          withCredentials: true,
        });
        setRecentSongs(
          (data.data || []).map((item) => ({ ...item.song, playedAt: item.playedAt })).filter(Boolean)
        );
      } finally {
        setLoading(false);
      }
    };
    loadRecentlyPlayed();
  }, [user?.recentlyPlayed?.length]);

  const formatTime = (date) => {
    const now = new Date();
    const played = new Date(date);
    const diff = now - played;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return played.toLocaleDateString();
  };

  const isLiked = (songId) => user?.likedSongs?.includes(songId);

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#000000]">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-32 pt-2 md:px-6">
          <div className="spotify-main-container min-h-full p-4 md:p-6 bg-gradient-to-b from-[#242424] via-[#121212] to-[#121212]">
            <Navbar />

            {/* Header */}
            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end">
              <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#333333] to-[#1a1a1a] shadow-2xl">
                <MdAccessTime className="text-7xl text-[#1ed760]" />
              </div>

              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Listening History
                </span>
                <h1 className="mt-1 text-3xl font-extrabold text-white md:text-5xl">
                  Recently Played
                </h1>
                <p className="mt-3 text-xs font-semibold text-[#b3b3b3]">
                  {recentSongs.length} tracks played recently
                </p>
              </div>
            </div>

            {/* Action Bar */}
            {recentSongs.length > 0 && (
              <div className="mt-8 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => playSong(recentSongs[0]._id, recentSongs)}
                  className="spotify-play-btn w-14 h-14"
                  aria-label="Play all recently played"
                >
                  <FaPlay className="text-xl text-black ml-1" />
                </button>
              </div>
            )}

            {/* Tracks */}
            {loading ? (
              <div className="mt-8 rounded-lg bg-[#181818] p-12 text-center text-[#b3b3b3]">
                Loading your listening history...
              </div>
            ) : recentSongs.length === 0 ? (
              <div className="mt-8 rounded-lg bg-[#181818] p-12 text-center text-[#b3b3b3]">
                <p className="text-lg font-bold text-white">No listening history yet</p>
                <p className="mt-2 text-xs">Start listening to songs and they'll show up here.</p>
              </div>
            ) : (
              <div className="mt-8">
                <div className="grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_100px] items-center gap-4 border-b border-[#282828] px-4 py-2 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                  <span>#</span>
                  <span>Title</span>
                  <span className="hidden sm:inline">Album</span>
                  <span className="text-right">Played</span>
                </div>

                <div className="mt-2 space-y-1">
                  {recentSongs.map((song, idx) => {
                    const isCurrent = song._id === selectedSong;

                    return (
                      <div
                        key={`${song._id}-${idx}`}
                        className={`group grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_100px] items-center gap-4 rounded-md px-4 py-2.5 transition hover:bg-[#282828] ${
                          isCurrent ? "bg-[#282828]" : ""
                        }`}
                      >
                        <div className="flex items-center text-xs text-[#b3b3b3]">
                          <span className="group-hover:hidden">{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => playSong(song._id, recentSongs)}
                            className="hidden text-white group-hover:block"
                          >
                            <FaPlay className="text-xs" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={song.image?.url || song.album?.thumbnail?.url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded object-cover shadow"
                          />
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => playSong(song._id, recentSongs)}
                              className={`truncate text-sm font-semibold text-left block w-full hover:underline ${
                                isCurrent ? "text-[#1ed760]" : "text-white"
                              }`}
                            >
                              {song.title}
                            </button>
                            <span className="truncate text-xs text-[#b3b3b3] block">
                              {song.artist || "Artist"}
                            </span>
                          </div>
                        </div>

                        <span className="hidden sm:block truncate text-xs text-[#b3b3b3]">
                          {song.album?.title || "Album"}
                        </span>

                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => toggleLikedSong(song._id)}
                            className="text-xs text-[#b3b3b3] hover:text-white"
                          >
                            {isLiked(song._id) ? (
                              <FaHeart className="text-[#1ed760]" />
                            ) : (
                              "♡"
                            )}
                          </button>
                          <span className="text-xs text-[#b3b3b3] font-mono">
                            {formatTime(song.playedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default RecentlyPlayed;
