import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { SongData } from "../context/Song";
import { UserData } from "../context/User";
import { MdSearch, MdClose, MdPlayArrow } from "react-icons/md";
import { FaPlay, FaHeart } from "react-icons/fa";

const SPOTIFY_CATEGORIES = [
  { name: "Podcasts", color: "bg-[#27856a]" },
  { name: "Live Events", color: "bg-[#7358ff]" },
  { name: "Made For You", color: "bg-[#1e3264]" },
  { name: "New Releases", color: "bg-[#e8115b]" },
  { name: "Hindi", color: "bg-[#ba5d07]" },
  { name: "Punjabi", color: "bg-[#bc5900]" },
  { name: "Tamil", color: "bg-[#a56752]" },
  { name: "Telugu", color: "bg-[#e13300]" },
  { name: "Pop", color: "bg-[#148a08]" },
  { name: "Hip-Hop", color: "bg-[#503750]" },
  { name: "Rock", color: "bg-[#e91429]" },
  { name: "Indie", color: "bg-[#608108]" },
  { name: "Mood", color: "bg-[#e1118c]" },
  { name: "Workout", color: "bg-[#777777]" },
  { name: "Party", color: "bg-[#af2896]" },
  { name: "Dance/Electronic", color: "bg-[#0d73ec]" },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { songs, playSong, selectedSong } = SongData();
  const { user, addToPlaylist, toggleLikedSong } = UserData();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(songs.slice(0, 12));
  const [albums, setAlbums] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    let active = true;
    const search = async () => {
      if (!query.trim()) {
        setResults(songs.slice(0, 12));
        setAlbums([]);
        return;
      }
      try {
        setSearchLoading(true);
        setSearchError("");
        const [songResponse, albumResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/songs/search?q=${encodeURIComponent(query)}`),
          axios.get(`http://localhost:5000/api/albums/search?q=${encodeURIComponent(query)}`),
        ]);
        if (active) {
          setResults(songResponse.data.data || songResponse.data.songs || []);
          setAlbums(albumResponse.data.data || albumResponse.data.albums || []);
        }
      } catch (error) {
        if (active) setSearchError(error.response?.data?.message || "Search failed");
      } finally {
        if (active) setSearchLoading(false);
      }
    };
    const timer = setTimeout(search, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, songs]);

  const isLiked = (songId) => user?.likedSongs?.includes(songId);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleCategoryClick = (categoryName) => {
    setQuery(categoryName);
    setSearchParams({ q: categoryName });
  };

  const topResult = results[0];

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#000000]">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-32 pt-2 md:px-6">
          <div className="spotify-main-container min-h-full p-4 md:p-6 bg-gradient-to-b from-[#242424] via-[#121212] to-[#121212]">
            <Navbar />

            {/* Search Input Bar (Spotify Style) */}
            <div className="relative mt-4 max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <MdSearch className="text-2xl text-[#b3b3b3]" />
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchParams(e.target.value ? { q: e.target.value } : {});
                }}
                placeholder="What do you want to play?"
                className="w-full rounded-full border border-transparent bg-[#242424] py-3.5 pl-12 pr-10 text-sm font-medium text-white placeholder-[#727272] outline-none transition focus:border-white focus:bg-[#2a2a2a]"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSearchParams({});
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white"
                >
                  <MdClose className="text-xl" />
                </button>
              )}
            </div>

            {/* If No Query: Show "Browse all" Category Cards */}
            {!query.trim() ? (
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-5">Browse all</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                  {SPOTIFY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleCategoryClick(cat.name)}
                      className={`relative aspect-square overflow-hidden rounded-lg ${cat.color} p-4 text-left shadow-lg transition duration-200 hover:scale-105`}
                    >
                      <span className="text-base font-bold text-white leading-tight block">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <div className="mt-8">
                {searchLoading ? (
                  <p className="text-sm text-[#b3b3b3]">Searching...</p>
                ) : results.length === 0 && albums.length === 0 ? (
                  <div className="mt-12 rounded-xl bg-[#181818] p-12 text-center text-[#b3b3b3]">
                    <h3 className="text-xl font-bold text-white">No results found for "{query}"</h3>
                    <p className="mt-2 text-xs">
                      Please make sure your words are spelled correctly, or use fewer or different keywords.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Top Result + Songs Split Section */}
                    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                      {/* Top Result */}
                      {topResult && (
                        <div>
                          <h2 className="text-xl font-bold text-white mb-4">Top result</h2>
                          <div className="group relative rounded-xl bg-[#181818] p-5 transition duration-300 hover:bg-[#282828]">
                            <img
                              src={topResult.image?.url || topResult.album?.thumbnail?.url}
                              alt=""
                              className="h-24 w-24 rounded-lg object-cover shadow-lg"
                            />
                            <h3 className="mt-4 text-2xl font-extrabold text-white truncate">
                              {topResult.title}
                            </h3>
                            <p className="mt-1 text-xs text-[#b3b3b3] truncate">
                              Song • <span className="text-white font-semibold">{topResult.artist || "Artist"}</span>
                            </p>

                            <button
                              type="button"
                              onClick={() => playSong(topResult._id, results)}
                              className="spotify-play-btn spotify-card-play absolute bottom-5 right-5"
                            >
                              <FaPlay className="text-lg text-black ml-0.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Songs List */}
                      <div>
                        <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
                        <div className="space-y-1">
                          {results.slice(0, 4).map((song) => {
                            const isCurrent = song._id === selectedSong;

                            return (
                              <div
                                key={song._id}
                                className={`group flex items-center justify-between gap-4 rounded-md p-2 transition hover:bg-[#282828] ${
                                  isCurrent ? "bg-[#282828]" : ""
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative h-10 w-10 shrink-0">
                                    <img
                                      src={song.image?.url || song.album?.thumbnail?.url}
                                      alt=""
                                      className="h-full w-full rounded object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => playSong(song._id, results)}
                                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded"
                                    >
                                      <FaPlay className="text-xs" />
                                    </button>
                                  </div>

                                  <div className="min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => playSong(song._id, results)}
                                      className={`truncate text-sm font-semibold text-left block hover:underline ${
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

                                <div className="flex items-center gap-3">
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
                                    {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, "0")}` : "3:30"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Albums Section */}
                    {albums.length > 0 && (
                      <section className="mt-10">
                        <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                          {albums.map((album) => (
                            <div
                              key={album._id}
                              onClick={() => navigate(`/album/${album._id}`)}
                              className="spotify-card group"
                            >
                              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#282828]">
                                <img
                                  src={album.thumbnail?.url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                <span className="spotify-play-btn spotify-card-play absolute bottom-2 right-2">
                                  <FaPlay className="text-sm text-black ml-0.5" />
                                </span>
                              </div>
                              <p className="mt-3 truncate text-sm font-bold text-white">
                                {album.title}
                              </p>
                              <p className="text-xs text-[#b3b3b3]">{album.artist || "Album"}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Search;
