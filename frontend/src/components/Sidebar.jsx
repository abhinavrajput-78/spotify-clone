import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MdHome,
  MdSearch,
  MdLibraryMusic,
  MdFavorite,
  MdAccessTime,
  MdLogout,
  MdPerson,
  MdDashboard,
  MdMenu,
  MdAdd,
  MdClose,
  MdWorkspacePremium,
  MdArrowForward,
} from "react-icons/md";
import { FaSpotify } from "react-icons/fa";
import { UserData } from "../context/User";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser, playlists, createPlaylist } = UserData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const isAdmin = user?.role?.toLowerCase?.() === "admin";
  const isPremium = user?.isPremium;
  const isActive = (path) => location.pathname === path;

  const handleCreateNewPlaylist = async () => {
    const defaultName = `My Playlist #${(playlists?.length || 0) + 1}`;
    await createPlaylist(defaultName);
    navigate("/playlist");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed left-4 top-4 z-40 block md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#121212] border border-[#282828] text-white shadow-lg"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
        </button>
      </div>

      <aside
        className={`
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          fixed inset-y-0 left-0 z-30 flex w-72 flex-col gap-2 bg-[#000000] p-2 transition-transform duration-300 md:static md:w-72 md:translate-x-0
        `}
      >
        {/* Top Box: Spotify Logo, Home, Search */}
        <div className="rounded-lg bg-[#121212] p-4">
          <div
            onClick={() => navigate(isAdmin ? "/admin" : "/home")}
            className="mb-5 flex cursor-pointer items-center gap-2.5 px-2"
          >
            <img
              src={assets.spotify_logo}
              alt="Spotify"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-white">Spotify</span>
            {isPremium && (
              <span className="rounded bg-[#1ed760] px-1.5 py-0.2 text-[10px] font-extrabold text-black uppercase">
                Premium
              </span>
            )}
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => {
                navigate(isAdmin ? "/admin" : "/home");
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-4 rounded-md px-3 py-3 text-sm font-bold transition duration-200 ${
                isActive("/home") || isActive("/admin")
                  ? "text-white font-extrabold"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <MdHome className="text-2xl" />
              <span>{isAdmin ? "Admin Dashboard" : "Home"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate("/search");
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-4 rounded-md px-3 py-3 text-sm font-bold transition duration-200 ${
                isActive("/search")
                  ? "text-white font-extrabold"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <MdSearch className="text-2xl" />
              <span>Search</span>
            </button>
          </nav>
        </div>

        {/* Bottom Box: Your Library */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-[#121212] p-3">
          {/* Library Header */}
          <div className="flex items-center justify-between px-2 py-2">
            <button
              type="button"
              onClick={() => navigate(isAdmin ? "/admin" : "/playlist")}
              className="flex items-center gap-3 text-sm font-bold text-[#b3b3b3] transition hover:text-white"
            >
              <MdLibraryMusic className="text-2xl" />
              <span>Your Library</span>
            </button>

            {!isAdmin && (
              <button
                type="button"
                onClick={handleCreateNewPlaylist}
                title="Create playlist"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#b3b3b3] transition hover:bg-[#282828] hover:text-white"
              >
                <MdAdd className="text-2xl" />
              </button>
            )}
          </div>

          {!isAdmin && (
            <>
              {/* Filter Pills */}
              <div className="my-2 flex gap-1.5 overflow-x-auto px-1 py-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-full px-3 py-1 transition ${
                    filter === "all"
                      ? "bg-white text-black"
                      : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("playlists")}
                  className={`rounded-full px-3 py-1 transition ${
                    filter === "playlists"
                      ? "bg-white text-black"
                      : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
                  }`}
                >
                  Playlists
                </button>
              </div>

              {/* Playlists & Liked Songs Scroll Area */}
              <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                {/* Liked Songs Tile */}
                <button
                  type="button"
                  onClick={() => {
                    navigate("/liked-songs");
                    setMobileOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-[#242424] ${
                    isActive("/liked-songs") ? "bg-[#282828]" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#450af5] to-[#8e8ee5] text-white shadow">
                    <MdFavorite className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">Liked Songs</p>
                    <p className="truncate text-xs text-[#b3b3b3]">
                      Playlist • {user?.likedSongs?.length || 0} songs
                    </p>
                  </div>
                </button>

                {/* Recently Played Shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    navigate("/recently-played");
                    setMobileOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-[#242424] ${
                    isActive("/recently-played") ? "bg-[#282828]" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#242424] text-[#1ed760]">
                    <MdAccessTime className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">Recently Played</p>
                    <p className="truncate text-xs text-[#b3b3b3]">Listening history</p>
                  </div>
                </button>

                {/* User Playlists */}
                {playlists?.map((pl) => (
                  <button
                    key={pl._id}
                    type="button"
                    onClick={() => {
                      navigate("/playlist");
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-[#242424]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#282828] text-white">
                      <MdLibraryMusic className="text-lg text-[#b3b3b3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{pl.name}</p>
                      <p className="truncate text-xs text-[#b3b3b3]">
                        Playlist • {pl.songs?.length || 0} songs
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Spotify Premium Card in Sidebar */}
          <div className="mt-auto pt-3">
            {!isPremium ? (
              <div className="rounded-lg bg-gradient-to-br from-[#242424] to-[#1a1a1a] p-4 border border-[#2e2e2e]">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1ed760] text-black text-xs font-bold">
                    ★
                  </span>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Spotify Premium
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#b3b3b3]">
                  Listen to ad-free music with offline downloads and Ultra HD 320kbps sound.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/premium");
                    setMobileOpen(false);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-white py-2 text-xs font-bold text-black transition hover:bg-[#f2f2f2] hover:scale-105"
                >
                  <span>Explore Plans</span>
                  <MdArrowForward className="text-sm" />
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-[#181818] p-3 border border-[#1ed760]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MdWorkspacePremium className="text-lg text-[#1ed760]" />
                    <span className="text-xs font-bold text-white">
                      Premium {user?.premiumPlan}
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#1ed760] shadow-[0_0_8px_#1ed760]" />
                </div>
                <Link
                  to="/premium"
                  className="mt-2 block text-[11px] font-semibold text-[#1ed760] hover:underline"
                >
                  Manage Subscription →
                </Link>
              </div>
            )}

            {/* Logout button */}
            <div className="mt-3 border-t border-[#282828] pt-2">
              <button
                type="button"
                onClick={logoutUser}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs font-semibold text-[#b3b3b3] transition hover:bg-red-500/10 hover:text-red-400"
              >
                <MdLogout className="text-base" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
