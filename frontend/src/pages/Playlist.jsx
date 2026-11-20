import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { UserData } from "../context/User";
import { SongData } from "../context/Song";
import {
  MdEdit,
  MdLibraryMusic,
  MdPlayArrow,
  MdDelete,
  MdAdd,
  MdQueueMusic,
  MdSearch,
} from "react-icons/md";
import { FaPlay, FaRegClock, FaTrash, FaRandom } from "react-icons/fa";
import IconField from "../components/IconField";

const Playlist = () => {
  const {
    playlists,
    fetchPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    user,
  } = UserData();
  const { songs, playSong, selectedSong } = SongData();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (playlists.length > 0 && !selectedPlaylistId) {
      setSelectedPlaylistId(playlists[0]._id);
    }
  }, [playlists]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    const newPl = await createPlaylist(name.trim());
    setName("");
    if (newPl?._id) setSelectedPlaylistId(newPl._id);
  };

  const currentPlaylist = playlists.find((p) => p._id === selectedPlaylistId) || playlists[0];

  const playPlaylist = (playlist, shuffle = false) => {
    if (!playlist) return;
    const playlistSongs = [...(playlist.songs || [])];
    if (shuffle) playlistSongs.sort(() => Math.random() - 0.5);
    if (playlistSongs[0]?._id) playSong(playlistSongs[0]._id, playlistSongs);
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#000000]">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-32 pt-2 md:px-6">
          <div className="spotify-main-container min-h-full p-4 md:p-6 bg-gradient-to-b from-[#1e3264] via-[#121212] to-[#121212]">
            <Navbar />

            {/* Create Playlist Quick Bar */}
            <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Give your new playlist a title..."
                className="flex-1 rounded-full border border-[#282828] bg-[#242424] px-5 py-3 text-sm text-white outline-none focus:border-[#1ed760]"
              />
              <button
                type="submit"
                className="spotify-btn-green py-3 px-6 text-xs font-bold"
              >
                + Create Playlist
              </button>
            </form>

            {/* Playlist Tabs Selector */}
            {playlists.length > 0 && (
              <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                {playlists.map((pl) => (
                  <button
                    key={pl._id}
                    onClick={() => setSelectedPlaylistId(pl._id)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      pl._id === currentPlaylist?._id
                        ? "bg-white text-black"
                        : "bg-[#282828] text-white hover:bg-[#333333]"
                    }`}
                  >
                    {pl.name} ({pl.songs?.length || 0})
                  </button>
                ))}
              </div>
            )}

            {currentPlaylist ? (
              <div className="mt-6">
                {/* Playlist Banner Header */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end">
                  <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#282828] to-[#181818] shadow-2xl">
                    <MdLibraryMusic className="text-6xl text-[#b3b3b3]" />
                  </div>

                  <div className="flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Public Playlist
                    </span>

                    {editingId === currentPlaylist._id ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="rounded bg-[#282828] px-3 py-1 text-2xl font-bold text-white outline-none"
                        />
                        <button
                          onClick={async () => {
                            await updatePlaylist(currentPlaylist._id, { name: editingName });
                            setEditingId(null);
                          }}
                          className="spotify-btn-green py-1 px-3 text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h1 className="mt-1 text-4xl font-extrabold text-white md:text-6xl">
                        {currentPlaylist.name}
                      </h1>
                    )}

                    <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-[#b3b3b3]">
                      <span className="text-white font-bold">{user?.name || "User"}</span>
                      <span>•</span>
                      <span>{currentPlaylist.songs?.length || 0} songs</span>
                    </div>
                  </div>
                </div>

                {/* Playlist Controls Bar */}
                <div className="mt-8 flex items-center gap-4">
                  {currentPlaylist.songs?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => playPlaylist(currentPlaylist)}
                      className="spotify-play-btn w-14 h-14"
                      aria-label="Play Playlist"
                    >
                      <FaPlay className="text-xl text-black ml-1" />
                    </button>
                  )}

                  {currentPlaylist.songs?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => playPlaylist(currentPlaylist, true)}
                      className="rounded-full border border-white/20 p-3 text-white transition hover:scale-105 hover:border-white"
                      title="Shuffle play"
                    >
                      <FaRandom className="text-base" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(currentPlaylist._id);
                      setEditingName(currentPlaylist.name);
                    }}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                  >
                    Rename
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePlaylist(currentPlaylist._id)}
                    className="text-xs text-red-400 hover:text-red-300 ml-auto flex items-center gap-1 font-semibold"
                  >
                    <FaTrash className="text-xs" /> Delete Playlist
                  </button>
                </div>

                {/* Track List Table */}
                {currentPlaylist.songs?.length > 0 ? (
                  <div className="mt-8">
                    <div className="grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_100px] items-center gap-4 border-b border-[#282828] px-4 py-2 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                      <span>#</span>
                      <span>Title</span>
                      <span className="hidden sm:inline">Album</span>
                      <span className="text-right">Action</span>
                    </div>

                    <div className="mt-2 space-y-1">
                      {currentPlaylist.songs.map((song, idx) => (
                        <div
                          key={song._id}
                          className={`group grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_100px] items-center gap-4 rounded-md px-4 py-2.5 transition hover:bg-[#282828] ${
                            song._id === selectedSong ? "bg-[#282828]" : ""
                          }`}
                        >
                          <div className="flex items-center text-xs text-[#b3b3b3]">
                            <span className="group-hover:hidden">{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => playSong(song._id, currentPlaylist.songs)}
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
                                onClick={() => playSong(song._id, currentPlaylist.songs)}
                                className={`truncate text-sm font-semibold text-left block w-full hover:underline ${
                                  song._id === selectedSong ? "text-[#1ed760]" : "text-white"
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

                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => removeSongFromPlaylist(currentPlaylist._id, song._id)}
                              className="text-xs text-gray-400 hover:text-red-400 font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-lg bg-[#181818] p-8 text-center text-[#b3b3b3]">
                    <p className="text-base font-bold text-white">This playlist is empty</p>
                    <p className="mt-1 text-xs">Find more of the songs you love and add them below.</p>
                  </div>
                )}

                {/* Add Songs Search & Select Tool */}
                <div className="mt-10 rounded-xl bg-[#181818] p-6 border border-[#282828]">
                  <h3 className="text-base font-bold text-white mb-2">
                    Recommended songs to add
                  </h3>
                  <p className="text-xs text-[#b3b3b3] mb-4">
                    Based on what's in this playlist
                  </p>

                  <div className="space-y-2">
                    {songs
                      .filter(
                        (song) =>
                          !(currentPlaylist.songs || []).some((item) => item._id === song._id)
                      )
                      .slice(0, 5)
                      .map((song) => (
                        <div
                          key={song._id}
                          className="flex items-center justify-between gap-4 rounded-md p-2 hover:bg-[#242424]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={song.image?.url || song.album?.thumbnail?.url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{song.title}</p>
                              <p className="truncate text-xs text-[#b3b3b3]">{song.artist || "Artist"}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => addSongToPlaylist(currentPlaylist._id, song._id)}
                            className="spotify-btn-outline py-1 px-4 text-xs font-bold"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-12 rounded-xl bg-[#181818] p-12 text-center text-[#b3b3b3]">
                <p className="text-lg font-bold text-white">No playlists found</p>
                <p className="mt-2 text-xs">Create your first playlist above to get started.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Playlist;
