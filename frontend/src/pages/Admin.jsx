import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { SongData } from "../context/Song";
import { UserData } from "../context/User";
import { MdAlbum, MdAudiotrack, MdDescription, MdImage, MdLibraryMusic, MdMusicNote, MdPerson, MdSearch } from "react-icons/md";
import IconField from "../components/IconField";

function AdminPage() {
  const navigate = useNavigate();
  const { user, logoutUser } = UserData();
  const { fetchSongs } = SongData();

  const [albums, setAlbums] = useState([]);

  // Album states
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumArtist, setAlbumArtist] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumImage, setAlbumImage] = useState(null);

  // Song states
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [songFile, setSongFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryView, setLibraryView] = useState("albums");
  const [userQuery, setUserQuery] = useState("");

  const normalizedLibraryQuery = libraryQuery.trim().toLowerCase();
  const filteredAlbums = albums.filter((album) => {
    const albumMatches = `${album.title} ${album.artist}`.toLowerCase().includes(normalizedLibraryQuery);
    const matchingSongs = (album.songs || []).filter((song) =>
      `${song.title} ${song.artist || album.artist}`.toLowerCase().includes(normalizedLibraryQuery)
    );
    return libraryView === "tracks"
      ? matchingSongs.length > 0
      : !normalizedLibraryQuery || albumMatches || matchingSongs.length > 0;
  });
  const filteredUsers = users.filter((account) =>
    `${account.name} ${account.email} ${account.role}`.toLowerCase().includes(userQuery.trim().toLowerCase())
  );

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.role !== "admin") {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  // =========================
  // GET ALBUMS
  // =========================
  const getAlbums = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/albums/"
      );

      if (data.success) {
        setAlbums(data.data || data.albums || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const editAlbum = async (album) => {
    const title = window.prompt("Album title", album.title);
    const artist = window.prompt("Album artist", album.artist || "");
    if (!title?.trim() || !artist?.trim()) return;
    try {
      await axios.put(`http://localhost:5000/api/albums/${album._id}`, { title, artist }, { withCredentials: true });
      toast.success("Album updated");
      await getAlbums();
    } catch (error) {
      toast.error(error.response?.data?.message || "Album update failed");
    }
  };

  const deleteAlbum = async (albumId) => {
    if (!window.confirm("Delete this album and its songs?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/albums/${albumId}`, { withCredentials: true });
      toast.success("Album deleted");
      await getAlbums();
      await fetchSongs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Album deletion failed");
    }
  };

  const editSong = async (song) => {
    const title = window.prompt("Song title", song.title);
    const artist = window.prompt("Song artist", song.artist || song.album?.artist || "");
    if (!title?.trim() || !artist?.trim()) return;
    try {
      await axios.put(`http://localhost:5000/api/songs/song/${song._id}`, { title, artist }, { withCredentials: true });
      toast.success("Song updated");
      await getAlbums();
      await fetchSongs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Song update failed");
    }
  };

  const deleteSong = async (songId) => {
    if (!window.confirm("Delete this song?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/songs/song/${songId}`, { withCredentials: true });
      toast.success("Song deleted");
      await getAlbums();
      await fetchSongs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Song deletion failed");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      getAlbums();
      const loadAdminData = async () => {
        try {
          const [statsResponse, usersResponse] = await Promise.all([
            axios.get("http://localhost:5000/api/users/admin/dashboard", { withCredentials: true }),
            axios.get("http://localhost:5000/api/users/admin/users", { withCredentials: true }),
          ]);
          setStats(statsResponse.data.data || null);
          setUsers(usersResponse.data.data || []);
        } catch (error) {
          toast.error(error.response?.data?.message || "Unable to load admin data");
        }
      };
      loadAdminData();
    }
  }, [user]);

  // =========================
  // CREATE ALBUM
  // =========================
  const createAlbum = async (e) => {
    e.preventDefault();

    if (
      !albumTitle ||
      !albumArtist ||
      !albumDescription ||
      !albumImage
    ) {
      toast.error("Please fill all album fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", albumTitle);
      formData.append("artist", albumArtist);
      formData.append(
        "description",
        albumDescription
      );
      formData.append("file", albumImage);

      const { data } = await axios.post(
        "http://localhost:5000/api/albums/new",
        formData,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Album created successfully");

        setAlbumTitle("");
        setAlbumArtist("");
        setAlbumDescription("");
        setAlbumImage(null);

        await getAlbums();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Album creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE SONG
  // =========================
  const createSong = async (e) => {
    e.preventDefault();

    if (
      !selectedAlbum ||
      !songTitle ||
      !songArtist ||
      !songDescription ||
      !songFile
    ) {
      toast.error("Please fill all song fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", songTitle);
      formData.append("artist", songArtist);
      formData.append(
        "description",
        songDescription
      );
      formData.append("file", songFile);

      const { data } = await axios.post(
        `http://localhost:5000/api/songs/album/${selectedAlbum}/song/new`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Song added successfully");

        setSongTitle("");
        setSongArtist("");
        setSongDescription("");
        setSongFile(null);
        setSelectedAlbum("");

        await getAlbums();
        await fetchSongs();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Song creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg admin-dashboard min-h-screen px-4 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto max-w-[1480px]">
            <section className="glass-panel relative overflow-hidden rounded-[30px] p-6 md:p-10">
              <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#1db954]/10 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-[#1db954]/5 blur-3xl" />
              <div className="relative flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#1ed760]">Control room / 01</p>
                  <h1 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-6xl">Shape the <span className="gradient-text">signal.</span></h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-[#b3b3b3]">Welcome back, {user?.name || "Administrator"}. Curate albums, publish new tracks, and keep the Spotify catalog growing.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-[#b3b3b3]">Admin workspace <span className="ml-2 text-[#1ed760]">● Online</span></div>
                  <button type="button" onClick={logoutUser} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-[#b3b3b3] transition hover:border-red-400/60 hover:text-red-300">Logout</button>
                </div>
              </div>
            </section>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Albums", value: albums.length },
          { label: "Songs", value: albums.reduce((sum, album) => sum + (album.songs?.length || 0), 0) },
          { label: "Users", value: stats?.totalUsers ?? users.length },
          { label: "Playlists", value: stats?.totalPlaylists ?? 0 },
          { label: "Access", value: "Admin" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-4 transition hover:-translate-y-1 hover:border-[#1db954]/50">
            <p className="text-xs uppercase tracking-[0.16em] text-[#b3b3b3]">{stat.label}</p>
            <h3 className="font-display mt-2 text-2xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* ===================== */}
        {/* CREATE ALBUM */}
        {/* ===================== */}

        <div className="glass-panel rounded-[24px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1ed760]">Publish a collection</p>
          <h2 className="font-display mb-6 mt-2 text-2xl font-semibold">Create Album</h2>

          <form
            onSubmit={createAlbum}
            className="space-y-4"
          >

            <IconField icon={MdAlbum}>
              <input
                type="text"
                placeholder="Album Title"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                className="auth-input auth-input-icon"
              />
            </IconField>

            <IconField icon={MdPerson}>
              <input
                type="text"
                placeholder="Album Artist"
                value={albumArtist}
                onChange={(e) => setAlbumArtist(e.target.value)}
                className="auth-input auth-input-icon"
              />
            </IconField>

            <IconField icon={MdDescription} multiline>
              <textarea
                placeholder="Album Description"
                value={albumDescription}
                onChange={(e) => setAlbumDescription(e.target.value)}
                className="auth-input auth-input-icon min-h-24 resize-y"
              />
            </IconField>

            <IconField icon={MdImage}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAlbumImage(e.target.files[0])}
                className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-3 pl-11 pr-3 text-sm text-[#b3b3b3]"
              />
            </IconField>

            <button
              type="submit"
              disabled={loading}
              className="neon-button w-full rounded-xl p-3 font-bold text-black"
            >
              {loading
                ? "Creating..."
                : "Create Album"}
            </button>

          </form>
        </div>

        {/* ===================== */}
        {/* ADD SONG */}
        {/* ===================== */}

        <div className="glass-panel rounded-[24px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1ed760]">Extend the library</p>
          <h2 className="font-display mb-6 mt-2 text-2xl font-semibold">Add Song</h2>

          <form
            onSubmit={createSong}
            className="space-y-4"
          >

            <IconField icon={MdAlbum}>
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="auth-input auth-input-icon"
              >
                <option value="">Select Album</option>

                {albums.map((album) => (
                  <option key={album._id} value={album._id}>
                    {album.title}
                  </option>
                ))}
              </select>
            </IconField>

            <IconField icon={MdMusicNote}>
              <input
                type="text"
                placeholder="Song Title"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="auth-input auth-input-icon"
              />
            </IconField>

            <IconField icon={MdPerson}>
              <input
                type="text"
                placeholder="Song Artist"
                value={songArtist}
                onChange={(e) => setSongArtist(e.target.value)}
                className="auth-input auth-input-icon"
              />
            </IconField>

            <IconField icon={MdDescription} multiline>
              <textarea
                placeholder="Song Description"
                value={songDescription}
                onChange={(e) => setSongDescription(e.target.value)}
                className="auth-input auth-input-icon min-h-24 resize-y"
              />
            </IconField>

            <IconField icon={MdAudiotrack}>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setSongFile(e.target.files[0])}
                className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-3 pl-11 pr-3 text-sm text-[#b3b3b3]"
              />
            </IconField>

            <button
              type="submit"
              disabled={loading}
              className="neon-button w-full rounded-xl p-3 font-bold text-black"
            >
              {loading
                ? "Adding..."
                : "Add Song"}
            </button>

          </form>
        </div>

      </div>

      {/* ===================== */}
      {/* ALBUM LIST */}
      {/* ===================== */}

      <section className="glass-panel mt-10 rounded-[24px] p-6">

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1ed760]">Content library</p>
            <h2 className="font-display mt-2 text-2xl font-semibold">
              {libraryView === "albums" ? "Albums" : "Tracks"}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1" aria-label="Library view">
              {[{ id: "albums", label: "Albums" }, { id: "tracks", label: "Tracks" }].map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setLibraryView(view.id)}
                  aria-pressed={libraryView === view.id}
                  className={`rounded-lg px-3 py-2 text-sm transition ${libraryView === view.id ? "bg-[#1db954] text-black" : "text-[#b3b3b3] hover:text-white"}`}
                >
                  {view.label}
                </button>
              ))}
            </div>
            <label className="relative block sm:w-64">
              <MdSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#b3b3b3]" />
              <input
                type="search"
                value={libraryQuery}
                onChange={(event) => setLibraryQuery(event.target.value)}
                placeholder={`Search ${libraryView} or artists`}
                aria-label={`Search ${libraryView} or artists`}
                className="auth-input auth-input-icon py-2.5"
              />
            </label>
          </div>
        </div>

        {albums.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-[#b3b3b3]">
            <MdLibraryMusic className="mx-auto mb-2 text-3xl" />
            Your music library is empty. Create an album to get started.
          </div>
        ) : filteredAlbums.length === 0 ? (
          <p className="rounded-xl bg-white/[0.03] p-5 text-sm text-[#b3b3b3]">No {libraryView} match “{libraryQuery}”.</p>
        ) : (
          <div className="space-y-3">

            {filteredAlbums.map((album) => (
              <div
                key={album._id}
                className="flex flex-col items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3 transition hover:border-[#1db954]/50 sm:flex-row sm:items-center"
              >

                <img
                  src={album.thumbnail?.url}
                  alt={album.title}
                  className="h-14 w-14 rounded-xl object-cover"
                />

                {libraryView === "albums" ? (
                  <>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{album.title}</h3>
                      <p className="text-sm text-[#b3b3b3]">{album.artist} · {album.songs?.length || 0} tracks</p>
                      <p className="mt-1 line-clamp-1 text-xs text-[#7f7f7f]">{album.description}</p>
                      <div className="mt-3 space-y-1">
                        {(album.songs || []).map((song) => (
                          <div key={song._id} className="flex items-center gap-2 text-xs text-[#b3b3b3]">
                            <span className="min-w-0 flex-1 truncate">{song.title}</span>
                            <button type="button" onClick={() => editSong(song)} className="hover:text-white">Edit</button>
                            <button type="button" onClick={() => deleteSong(song._id)} className="text-red-300 hover:text-red-200">Delete</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2 sm:ml-auto">
                      <button type="button" onClick={() => editAlbum(album)} className="rounded-lg bg-[#1db954]/15 px-3 py-2 text-xs text-[#baf2ca] hover:bg-[#1db954]/25">Edit album</button>
                      <button type="button" onClick={() => deleteAlbum(album._id)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20">Delete</button>
                    </div>
                  </>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-[#b3b3b3]">{album.title} · {album.artist}</p>
                    <div className="mt-2 space-y-1">
                      {(album.songs || []).filter((song) =>
                        `${song.title} ${song.artist || album.artist}`.toLowerCase().includes(normalizedLibraryQuery)
                      ).map((song) => (
                        <div key={song._id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/[0.04]">
                          <MdMusicNote aria-hidden="true" className="shrink-0 text-[#1ed760]" />
                          <span className="min-w-0 flex-1 truncate">{song.title}</span>
                          <span className="hidden truncate text-xs text-[#b3b3b3] sm:block">{song.artist || album.artist}</span>
                          <button type="button" onClick={() => editSong(song)} className="text-xs text-[#b3b3b3] hover:text-white">Edit</button>
                          <button type="button" onClick={() => deleteSong(song._id)} className="text-xs text-red-300 hover:text-red-200">Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </section>

      <section className="glass-panel mt-8 rounded-[24px] p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1ed760]">Community access</p>
            <h2 className="font-display mt-2 text-2xl font-semibold">Members ({filteredUsers.length})</h2>
          </div>
          <label className="relative block sm:w-72">
            <MdSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#b3b3b3]" />
            <input
              type="search"
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Search name, email, or role"
              aria-label="Search members"
              className="auth-input auth-input-icon py-2.5"
            />
          </label>
        </div>
        <div className="space-y-2">
          {filteredUsers.map((account) => (
            <div key={account._id} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.035] px-3 py-3 text-sm">
              <span>{account.name} <span className="text-[#b3b3b3]">({account.email})</span></span>
              <span className="rounded-full bg-[#1db954]/10 px-2 py-1 text-xs text-[#1ed760]">{account.role}</span>
            </div>
          ))}
          {filteredUsers.length === 0 && <p className="rounded-xl bg-white/[0.03] p-4 text-sm text-[#b3b3b3]">No members match “{userQuery}”.</p>}
        </div>
      </section>

      </div>
    </div>
  );
}

export default AdminPage;