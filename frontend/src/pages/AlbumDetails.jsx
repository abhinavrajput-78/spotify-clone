import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlay, FaRegClock, FaHeart } from "react-icons/fa";

import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { SongData } from "../context/Song";
import { UserData } from "../context/User";

const AlbumDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, selectedSong } = SongData();
  const { user, toggleLikedSong } = UserData();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/albums/${id}`);
        setAlbum(data.data?.album || data.album || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (album?.songs?.[0]?._id) {
      playSong(album.songs[0]._id, album.songs);
    }
  };

  const isLiked = (songId) => user?.likedSongs?.includes(songId);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-[#000000]">
          <Sidebar />
          <main className="flex-1 p-6 text-[#b3b3b3]">
            <Navbar />
            <div className="mt-12 text-center">Loading album...</div>
          </main>
        </div>
      </Layout>
    );
  }

  if (!album) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-[#000000]">
          <Sidebar />
          <main className="flex-1 p-6 text-[#b3b3b3]">
            <Navbar />
            <div className="mt-12 text-center">Album not found.</div>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#000000]">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-32 pt-2 md:px-6">
          <div className="spotify-main-container min-h-full p-4 md:p-6 bg-gradient-to-b from-[#333333] via-[#121212] to-[#121212]">
            <Navbar />

            {/* Album Header */}
            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end">
              <img
                src={album.thumbnail?.url}
                alt={album.title}
                className="h-52 w-52 rounded-md object-cover shadow-2xl"
              />

              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Album
                </span>
                <h1 className="mt-1 text-3xl font-extrabold text-white md:text-5xl">
                  {album.title}
                </h1>
                <p className="mt-2 text-sm text-[#b3b3b3]">{album.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#b3b3b3]">
                  <span className="text-white font-bold">{album.artist || "Artist"}</span>
                  <span>•</span>
                  <span>{album.songs?.length || 0} songs</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex items-center gap-6">
              {album.songs?.length > 0 && (
                <button
                  type="button"
                  onClick={handlePlayAlbum}
                  aria-label="Play Album"
                  className="spotify-play-btn w-14 h-14"
                >
                  <FaPlay className="text-xl text-black ml-1" />
                </button>
              )}
            </div>

            {/* Track List Table */}
            <div className="mt-8">
              <div className="grid grid-cols-[16px_1fr_60px] items-center gap-4 border-b border-[#282828] px-4 py-2 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                <span>#</span>
                <span>Title</span>
                <span className="text-right flex justify-end">
                  <FaRegClock />
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {album.songs?.length ? (
                  album.songs.map((song, index) => {
                    const isCurrent = song._id === selectedSong;

                    return (
                      <div
                        key={song._id}
                        className={`group grid grid-cols-[16px_1fr_60px] items-center gap-4 rounded-md px-4 py-2.5 transition hover:bg-[#282828] ${
                          isCurrent ? "bg-[#282828]" : ""
                        }`}
                      >
                        <div className="flex items-center text-xs text-[#b3b3b3]">
                          <span className="group-hover:hidden">{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => playSong(song._id, album.songs)}
                            className="hidden text-white group-hover:block"
                          >
                            <FaPlay className="text-xs" />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => playSong(song._id, album.songs)}
                            className={`truncate text-sm font-semibold text-left block w-full hover:underline ${
                              isCurrent ? "text-[#1ed760]" : "text-white"
                            }`}
                          >
                            {song.title}
                          </button>
                          <span className="truncate text-xs text-[#b3b3b3] block">
                            {song.artist || album.artist || "Artist"}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => toggleLikedSong(song._id)}
                            className="text-sm text-[#b3b3b3] hover:text-white"
                          >
                            {isLiked(song._id) ? (
                              <FaHeart className="text-[#1ed760]" />
                            ) : (
                              "♡"
                            )}
                          </button>
                          <span className="text-xs text-[#b3b3b3] font-mono">
                            {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, "0")}` : "3:45"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg bg-[#181818] p-8 text-center text-[#b3b3b3]">
                    No songs in this album yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AlbumDetails;
