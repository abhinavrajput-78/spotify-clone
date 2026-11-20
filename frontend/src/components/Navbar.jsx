import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdChevronLeft,
  MdChevronRight,
  MdSearch,
  MdPerson,
  MdWorkspacePremium,
  MdDownload,
  MdNotificationsNone,
  MdLogout,
  MdSettings,
  MdVerified,
} from "react-icons/md";
import { UserData } from "../context/User";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = UserData();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const dropdownRef = useRef(null);

  const isPremium = user?.isPremium;
  const isSearchPage = location.pathname === "/search";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#000000]/70 text-white transition hover:bg-[#000000] hover:scale-105"
          >
            <MdChevronLeft className="text-2xl" />
          </button>

          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Go forward"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#000000]/70 text-white transition hover:bg-[#000000] hover:scale-105"
          >
            <MdChevronRight className="text-2xl" />
          </button>
        </div>

        {/* Center Search Shortcut (if not on search page) */}
        {!isSearchPage && (
          <div className="hidden flex-1 items-center justify-center md:flex max-w-md">
            <button
              type="button"
              onClick={() => navigate("/search")}
              className="flex w-full items-center gap-3 rounded-full border border-transparent bg-[#242424] px-4 py-2.5 text-left text-xs font-medium text-[#b3b3b3] transition hover:border-white/20 hover:bg-[#2a2a2a] hover:text-white"
            >
              <MdSearch className="text-xl text-white" />
              <span>What do you want to play?</span>
            </button>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Explore Premium / Premium Badge */}
          {!isPremium ? (
            <button
              type="button"
              onClick={() => navigate("/premium")}
              className="spotify-btn-white hidden text-xs font-bold py-1.5 px-4 sm:inline-flex"
            >
              Explore Premium
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/premium")}
              className="hidden items-center gap-1.5 rounded-full bg-[#1ed760]/15 border border-[#1ed760]/30 px-3 py-1 text-xs font-bold text-[#1ed760] transition hover:scale-105 sm:inline-flex"
            >
              <MdVerified className="text-sm" />
              <span>Premium {user?.premiumPlan}</span>
            </button>
          )}

          {/* Install App Button */}
          <button
            type="button"
            onClick={() => window.open("https://www.spotify.com/download", "_blank")}
            className="hidden items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold text-white transition hover:scale-105 hover:bg-black/70 sm:inline-flex"
          >
            <MdDownload className="text-base" />
            <span>Install App</span>
          </button>

          {/* Profile Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              aria-label="User profile menu"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-transparent bg-[#242424] text-white transition hover:scale-105 hover:border-white/20"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user?.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-bold text-xs bg-[#535353]">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </button>

            {/* Spotify Profile Menu Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-md border border-[#282828] bg-[#282828] p-1 shadow-2xl z-50">
                <div className="border-b border-[#3e3e3e] px-3 py-2">
                  <p className="truncate text-sm font-bold text-white">{user?.name || "User"}</p>
                  <p className="truncate text-xs text-[#b3b3b3]">{user?.email}</p>
                  {isPremium ? (
                    <span className="mt-1 inline-block rounded bg-[#1ed760] px-1.5 py-0.2 text-[10px] font-extrabold text-black uppercase">
                      Premium {user?.premiumPlan}
                    </span>
                  ) : (
                    <span className="mt-1 inline-block text-[10px] text-[#b3b3b3]">
                      Spotify Free
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-xs font-semibold text-white transition hover:bg-[#3e3e3e]"
                >
                  <MdPerson className="text-base text-[#b3b3b3]" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/premium");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-xs font-semibold text-white transition hover:bg-[#3e3e3e]"
                >
                  <MdWorkspacePremium className="text-base text-[#1ed760]" />
                  <span>{isPremium ? "Manage Premium" : "Upgrade to Premium"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-xs font-semibold text-white transition hover:bg-[#3e3e3e]"
                >
                  <MdSettings className="text-base text-[#b3b3b3]" />
                  <span>Settings</span>
                </button>

                <div className="my-1 border-t border-[#3e3e3e]" />

                <button
                  type="button"
                  onClick={logoutUser}
                  className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                >
                  <MdLogout className="text-base" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Header (Spotify style) */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:px-6">
        {["All", "Music", "Podcasts", "Made For You", "New Releases"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActiveCategory(item)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
              activeCategory === item
                ? "bg-white text-black"
                : "bg-[#2a2a2a] text-white hover:bg-[#333333]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
