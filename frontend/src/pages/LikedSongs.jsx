import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { UserData } from "../context/User";
import { SongData } from "../context/Song";
import { FaHeart, FaPlay, FaRegClock } from "react-icons/fa";

const LikedSongs = () => {
  const { user, toggleLikedSong } = UserData();
  const { playSong, selectedSong, isPlaying } = SongData();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/liked-songs", {
          withCredentials: true,
        });
        setLikedSongs(data.data || []);
      } finally {
        setLoading(false);
      }
    };
    loadLikedSongs();
  }, [user?.likedSongs?.length]);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0]._id, likedSongs);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#000000]">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-32 pt-2 md:px-6">
          <div className="spotify-main-container min-h-full p-4 md:p-6 bg-gradient-to-b from-[#4f2796] via-[#121212] to-[#121212]">
            <Navbar />

            {/* Giant Liked Songs Banner */}
            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end">
              <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#450af5] to-[#8e8ee5] shadow-2xl">
                <FaHeart className="text-7xl text-white drop-shadow-md" />
              </div>

              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Playlist
                </span>
                <h1 className="mt-1 text-4xl font-extrabold text-white md:text-6xl">
                  Liked Songs
                </h1>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#d1d1d1]">
                  <span className="text-white font-bold">{user?.name || "User"}</span>
                  <span>•</span>
                  <span>{likedSongs.length} songs</span>
                </div>
              </div>
            </div>

            {/* Action Bar (Play All Button) */}
            <div className="mt-8 flex items-center gap-6">
              {likedSongs.length > 0 && (
                <button
                  type="button"
                  onClick={handlePlayAll}
                  aria-label="Play Liked Songs"
                  className="spotify-play-btn w-14 h-14"
                >
                  <FaPlay className="text-xl text-black ml-1" />
                </button>
              )}
            </div>

            {/* Track List Table */}
            {loading ? (
              <div className="mt-8 rounded-lg bg-[#181818] p-12 text-center text-[#b3b3b3]">
                Loading liked songs...
              </div>
            ) : likedSongs.length === 0 ? (
              <div className="mt-8 rounded-lg bg-[#181818] p-12 text-center text-[#b3b3b3]">
                <p className="text-lg font-bold text-white">Songs you like will appear here</p>
                <p className="mt-2 text-xs">Save songs by tapping the heart icon on any track.</p>
              </div>
            ) : (
              <div className="mt-8">
                {/* Table Header */}
                <div className="grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_60px] items-center gap-4 border-b border-[#282828] px-4 py-2 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                  <span>#</span>
                  <span>Title</span>
                  <span className="hidden sm:inline">Album</span>
                  <span className="text-right flex justify-end">
                    <FaRegClock />
                  </span>
                </div>

                {/* Table Rows */}
                <div className="mt-2 space-y-1">
                  {likedSongs.map((song, index) => {
                    const isCurrent = song._id === selectedSong;

                    return (
                      <div
                        key={song._id}
                        className={`group grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_60px] items-center gap-4 rounded-md px-4 py-2.5 transition hover:bg-[#282828] ${
                          isCurrent ? "bg-[#282828]" : ""
                        }`}
                      >
                        {/* Index / Play on Hover */}
                        <div className="flex items-center text-xs text-[#b3b3b3]">
                          <span className="group-hover:hidden">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => playSong(song._id, likedSongs)}
                            className="hidden text-white group-hover:block"
                          >
                            <FaPlay className="text-xs" />
                          </button>
                        </div>

                        {/* Title & Artist */}
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={song.image?.url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded object-cover shadow"
                          />
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => playSong(song._id, likedSongs)}
                              className={`truncate text-sm font-semibold text-left block w-full hover:underline ${
                                isCurrent ? "text-[#1ed760]" : "text-white"
                              }`}
                            >
                              {song.title}
                            </button>
                            <span className="truncate text-xs text-[#b3b3b3] block hover:underline">
                              {song.artist || "Artist"}
                            </span>
                          </div>
                        </div>

                        {/* Album */}
                        <span className="hidden sm:block truncate text-xs text-[#b3b3b3] hover:underline cursor-pointer">
                          {song.album?.title || "Single"}
                        </span>

                        {/* Like & Duration */}
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => toggleLikedSong(song._id)}
                            className="text-sm text-[#1ed760] transition hover:scale-110"
                            title="Remove from Liked Songs"
                          >
                            <FaHeart />
                          </button>
                          <span className="text-xs text-[#b3b3b3] font-mono">
                            {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, "0")}` : "3:24"}
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

export default LikedSongs;
