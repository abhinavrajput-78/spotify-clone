import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdPlayArrow,
  MdPlayArrow as PlayIcon,
  MdMoreHoriz,
  MdWorkspacePremium,
  MdArrowForward,
  MdSearch,
} from "react-icons/md";

import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { SongData } from "../context/Song";
import { UserData } from "../context/User";

const API_URL = "http://localhost:5000/api";

const getArtwork = (item) =>
  item?.image?.url || item?.thumbnail?.url || item?.album?.thumbnail?.url || "";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const SectionHeading = ({ title, action, onAction }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl hover:underline cursor-pointer">
      {title}
    </h2>
    {action && (
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-xs font-bold text-[#b3b3b3] transition hover:underline hover:text-white"
      >
        {action}
      </button>
    )}
  </div>
);

// Authentic Spotify Song Card
const SongCard = ({ song, songs, playSong, user, toggleLikedSong, addToPlaylist }) => {
  const liked = user?.likedSongs?.includes(song._id);

  return (
    <article className="spotify-card group w-44 shrink-0 md:w-48">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#282828] shadow-md">
        {getArtwork(song) ? (
          <img
            src={getArtwork(song)}
            alt={song.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#b3b3b3]">
            Spotify Track
          </div>
        )}

        {/* Floating Spotify Green Play Button */}
        <button
          type="button"
          onClick={() => playSong(song._id, songs)}
          aria-label={`Play ${song.title}`}
          className="spotify-play-btn spotify-card-play absolute bottom-2 right-2"
        >
          <PlayIcon className="text-2xl text-black ml-0.5" />
        </button>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => playSong(song._id, songs)}
          className="w-full text-left"
        >
          <p className="truncate text-sm font-bold text-white hover:underline">{song.title}</p>
          <p className="mt-1 truncate text-xs text-[#b3b3b3] hover:underline">
            {song.artist || song.album?.title || song.description || "Spotify Music"}
          </p>
        </button>

        <div className="mt-2.5 flex items-center justify-between border-t border-[#282828] pt-2">
          <button
            type="button"
            onClick={() => toggleLikedSong(song._id)}
            aria-label={liked ? "Unlike song" : "Like song"}
            className="text-sm text-[#b3b3b3] transition hover:scale-110"
          >
            {liked ? (
              <span className="text-[#1ed760] font-bold">♥</span>
            ) : (
              <span className="text-[#b3b3b3] hover:text-white">♡</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => addToPlaylist(song._id)}
            className="text-[11px] text-[#b3b3b3] hover:text-white transition"
          >
            + Add to Playlist
          </button>
        </div>
      </div>
    </article>
  );
};

// Authentic Spotify Album Card
const AlbumCard = ({ album, onOpen, songs, playSong }) => {
  const albumSongs = album.songs || [];

  return (
    <article className="spotify-card group w-44 shrink-0 md:w-48">
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-square w-full overflow-hidden rounded-md bg-[#282828] text-left shadow-md"
      >
        {getArtwork(album) ? (
          <img
            src={getArtwork(album)}
            alt={album.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#b3b3b3]">
            Album
          </div>
        )}

        {albumSongs[0]?._id && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              playSong(albumSongs[0]._id, albumSongs);
            }}
            role="button"
            tabIndex={0}
            className="spotify-play-btn spotify-card-play absolute bottom-2 right-2"
          >
            <PlayIcon className="text-2xl text-black ml-0.5" />
          </span>
        )}
      </button>

      <button type="button" onClick={onOpen} className="mt-3 block w-full text-left">
        <p className="truncate text-sm font-bold text-white hover:underline">{album.title}</p>
        <p className="mt-1 truncate text-xs text-[#b3b3b3]">
          {album.artist || album.description || "Album"}
        </p>
      </button>
    </article>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { songs, loading: songsLoading, playSong } = SongData();
  const { user, addToPlaylist, toggleLikedSong, playlists, fetchPlaylists } = UserData();

  const [albums, setAlbums] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const isPremium = user?.isPremium;

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      try {
        setPageLoading(true);
        const [albumResponse, recentResponse, recommendationResponse] = await Promise.allSettled([
          axios.get(`${API_URL}/albums`),
          axios.get(`${API_URL}/users/recently-played`, { withCredentials: true }),
          axios.get(`${API_URL}/users/recommendations`, { withCredentials: true }),
        ]);

        if (!active) return;

        if (albumResponse.status === "fulfilled") {
          setAlbums(albumResponse.value.data.data || albumResponse.value.data.albums || []);
        }
        if (recentResponse.status === "fulfilled") {
          setRecentSongs(
            (recentResponse.value.data.data || [])
              .map((item) => ({ ...item.song, playedAt: item.playedAt }))
              .filter((s) => s?._id)
          );
        }
        if (recommendationResponse.status === "fulfilled") {
          setRecommendations(recommendationResponse.value.data.data || []);
        }
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        if (active) setPageLoading(false);
      }
    };

    fetchPlaylists();
    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  const derivedRecentSongs = recentSongs.length
    ? recentSongs
    : (user?.recentlyPlayed || [])
        .map((item) => songs.find((song) => song._id === item.songId))
        .filter(Boolean);

  const trendingSongs = songs.slice(0, 12);
  const madeForYou = recommendations.length
    ? recommendations
    : derivedRecentSongs.length
    ? derivedRecentSongs
    : songs.slice(0, 8);

  const artists = useMemo(() => {
    const artistMap = new Map();
    songs.forEach((song) => {
      const artist = song.artist || song.album?.artist;
      if (artist && !artistMap.has(artist)) {
        artistMap.set(artist, { name: artist, image: getArtwork(song), song });
      }
    });
    return [...artistMap.values()].slice(0, 8);
  }, [songs]);

  const quickAccess = [
    {
      title: "Liked Songs",
      image: null,
      gradient: "from-[#450af5] to-[#8e8ee5]",
      action: () => navigate("/liked-songs"),
    },
    {
      title: playlists[0]?.name || "Your Playlists",
      image: playlists[0]?.image || getArtwork(playlists[0]?.songs?.[0]),
      action: () => navigate("/playlist"),
    },
    {
      title: "Recently Played",
      image: getArtwork(derivedRecentSongs[0]),
      action: () => navigate("/recently-played"),
    },
    {
      title: "Popular Albums",
      image: getArtwork(albums[0]),
      action: () => navigate("/search"),
    },
  ];

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#000000]">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-32 pt-2 md:px-6">
          <div className="spotify-main-container min-h-full p-4 md:p-6 bg-gradient-to-b from-[#222222] via-[#121212] to-[#121212]">
            <Navbar />

            {/* Top Greeting */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {getGreeting()}{user?.name ? `, ${user.name}` : ""}
              </h1>

              {!isPremium ? (
                <button
                  onClick={() => navigate("/premium")}
                  className="spotify-btn-white text-xs py-2 px-4 shadow"
                >
                  Upgrade to Spotify Premium
                </button>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-[#1ed760]/15 px-3 py-1 text-xs font-bold text-[#1ed760] border border-[#1ed760]/30">
                  ★ Spotify Premium {user?.premiumPlan} Active
                </span>
              )}
            </div>

            {/* Spotify Quick Access 4-Grid / 6-Grid */}
            <section className="mt-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickAccess.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className="group flex h-16 items-center gap-3 overflow-hidden rounded bg-[#2a2a2a]/80 text-left transition hover:bg-[#383838]"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-16 w-16 object-cover shadow"
                      />
                    ) : (
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center bg-gradient-to-br ${
                          item.gradient || "from-green-600 to-green-950"
                        } text-white font-bold text-xl`}
                      >
                        ♥
                      </div>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-white px-2">
                      {item.title}
                    </span>

                    {/* Floating Play Button on hover */}
                    <div className="mr-3 opacity-0 transition duration-200 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg">
                        <PlayIcon className="text-xl ml-0.5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Spotify Premium Promo Card (if not subscribed) */}
            {!isPremium && (
              <section className="mt-8 rounded-xl bg-gradient-to-r from-[#004d40] via-[#00695c] to-[#004d40] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#1ed760]/20">
                <div>
                  <span className="rounded bg-[#1ed760] px-2 py-0.5 text-[10px] font-extrabold text-black uppercase tracking-wider">
                    Special Offer
                  </span>
                  <h3 className="text-2xl font-extrabold mt-2">Get 1 month of Spotify Premium for ₹0</h3>
                  <p className="text-sm text-green-100 mt-1 max-w-xl">
                    Ad-free music listening, offline downloads, unlimited skips, and ultra high audio quality. Cancel anytime.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/premium")}
                  className="spotify-btn-white whitespace-nowrap text-sm px-6 py-3 font-extrabold shadow-2xl hover:scale-105"
                >
                  Try 1 Month Free
                </button>
              </section>
            )}

            {/* Section: Recently played */}
            <section className="mt-9">
              <SectionHeading
                title="Recently played"
                action="Show all"
                onAction={() => navigate("/recently-played")}
              />
              {derivedRecentSongs.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {derivedRecentSongs.slice(0, 8).map((song) => (
                    <SongCard
                      key={`recent-${song._id}`}
                      song={song}
                      songs={derivedRecentSongs}
                      playSong={playSong}
                      user={user}
                      toggleLikedSong={toggleLikedSong}
                      addToPlaylist={addToPlaylist}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-[#181818] p-5 text-sm text-[#b3b3b3]">
                  Play some songs and your recently played tracks will appear here.
                </p>
              )}
            </section>

            {/* Section: Today's biggest hits */}
            <section className="mt-9">
              <SectionHeading
                title="Today's biggest hits"
                action="See all"
                onAction={() => navigate("/search")}
              />
              {songsLoading ? (
                <p className="text-xs text-[#b3b3b3]">Loading music...</p>
              ) : trendingSongs.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {trendingSongs.map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      songs={songs}
                      playSong={playSong}
                      user={user}
                      toggleLikedSong={toggleLikedSong}
                      addToPlaylist={addToPlaylist}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#b3b3b3]">No songs available yet.</p>
              )}
            </section>

            {/* Section: Popular Artists */}
            {artists.length > 0 && (
              <section className="mt-9">
                <SectionHeading title="Popular artists" />
                <div className="flex gap-6 overflow-x-auto pb-2">
                  {artists.map((artist) => (
                    <button
                      key={artist.name}
                      type="button"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(artist.name)}`)}
                      className="group flex w-36 shrink-0 flex-col items-center text-center"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-[#282828] shadow-md ring-2 ring-transparent transition group-hover:ring-[#1ed760]">
                        {artist.image ? (
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl font-bold text-[#b3b3b3]">
                            {artist.name.charAt(0)}
                          </div>
                        )}
                        <span className="spotify-play-btn spotify-card-play absolute bottom-2 right-2">
                          <PlayIcon className="text-2xl text-black ml-0.5" />
                        </span>
                      </div>
                      <p className="mt-3 truncate text-sm font-bold text-white group-hover:underline">
                        {artist.name}
                      </p>
                      <p className="text-xs text-[#b3b3b3]">Artist</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Section: Popular Albums */}
            <section className="mt-9">
              <SectionHeading
                title="Popular albums"
                action="See all"
                onAction={() => navigate("/search")}
              />
              {albums.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {albums.slice(0, 8).map((album) => (
                    <AlbumCard
                      key={album._id}
                      album={album}
                      songs={songs}
                      playSong={playSong}
                      onOpen={() => navigate(`/album/${album._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#b3b3b3]">No albums available yet.</p>
              )}
            </section>

            {/* Section: Made for you */}
            <section className="mt-9">
              <SectionHeading title="Made for you" />
              <div className="flex gap-4 overflow-x-auto pb-2">
                {madeForYou.slice(0, 8).map((song) => (
                  <SongCard
                    key={`made-${song._id}`}
                    song={song}
                    songs={madeForYou}
                    playSong={playSong}
                    user={user}
                    toggleLikedSong={toggleLikedSong}
                    addToPlaylist={addToPlaylist}
                  />
                ))}
              </div>
            </section>

            <Footer />
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Home;
