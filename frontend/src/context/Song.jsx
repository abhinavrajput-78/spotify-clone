import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const SongContext = createContext();

export const SongProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState("");

  const fetchSongs = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "http://localhost:5000/api/songs/songs"
      );

      const songList = data.data || data.songs || [];

      setSongs(songList);
      setError("");

      if (!selectedSong && songList.length) {
        setSelectedSong(songList[0]._id);
      }
    } catch (error) {
      console.log(error);
      setError("Unable to load songs");
    } finally {
      setLoading(false);
    }
  };

  const playSong = (songId, nextQueue = songs) => {
    if (!songId) return;

    setQueue(nextQueue?.length ? nextQueue : songs);
    setSelectedSong(songId);
    setIsPlaying(true);
  };

  const fetchSong = async (id = selectedSong) => {
    if (!id) {
      setSong(null);
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/songs/song/${id}`
      );
      setSong(data.data?.song || data.song || null);
    } catch (error) {
      console.log(error);
      setSong(null);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (selectedSong) {
      fetchSong(selectedSong);
    }
  }, [selectedSong]);

  return (
    <SongContext.Provider
      value={{
        songs,
        song,
        loading,
        fetchSongs,
        fetchSong,
        selectedSong,
        setSelectedSong,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        queue,
        setQueue,
        playSong,
        error,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

export const SongData = () => useContext(SongContext);