import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaHeart,
  FaRegHeart,
  FaVolumeUp,
  FaVolumeMute,
  FaRandom,
  FaRedo,
} from "react-icons/fa";
import {
  MdQueueMusic,
  MdDevices,
  MdHighQuality,
  MdFullscreen,
  MdWorkspacePremium,
} from "react-icons/md";
import { SongData } from "../context/Song";
import { UserData } from "../context/User";

const Player = () => {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const trackStarted = useRef(false);
  const [playbackError, setPlaybackError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [isShuffle, setIsShuffle] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  const {
    songs,
    selectedSong,
    setSelectedSong,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    queue,
    setQueue,
    playSong,
  } = SongData();

  const { user, addToRecentlyPlayed, toggleLikedSong } = UserData();

  const playableQueue = queue.length ? queue : songs;
  const currentSong = useMemo(
    () =>
      playableQueue.find((item) => item._id === selectedSong) ||
      songs.find((item) => item._id === selectedSong) ||
      songs[0] ||
      null,
    [playableQueue, songs, selectedSong]
  );

  const currentIndex = playableQueue.findIndex((item) => item._id === currentSong?._id);

  const formatTime = (time) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isLiked = (songId) => user?.likedSongs?.includes(songId);
  const isPremium = user?.isPremium;

  useEffect(() => {
    trackStarted.current = false;
  }, [currentSong?._id]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;
    const audioUrl = currentSong.audio?.url;

    if (!audioUrl) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      setPlaybackError("Track missing audio stream.");
      return;
    }

    audio.src = audioUrl;
    audio.load();
    setProgress(0);
    setDuration(Number(currentSong.duration) || 0);
    setPlaybackError("");
  }, [currentSong?._id, currentSong?.audio?.url, currentSong?.duration, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong?.audio?.url) {
      audio.pause();
      return;
    }

    if (!isPlaying) {
      audio.pause();
      return;
    }

    audio
      .play()
      .then(() => {
        if (currentSong && !trackStarted.current) {
          addToRecentlyPlayed(currentSong._id);
          trackStarted.current = true;
        }
      })
      .catch((error) => {
        console.error("Playback failed:", error);
        setPlaybackError("Unable to play. Check audio file.");
        setIsPlaying(false);
      });
  }, [isPlaying, currentSong?._id, currentSong?.audio?.url, addToRecentlyPlayed, setIsPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * playableQueue.length);
        setSelectedSong(playableQueue[randomIndex]?._id || null);
        return;
      }

      if (currentIndex >= 0 && playableQueue[currentIndex + 1]) {
        setSelectedSong(playableQueue[currentIndex + 1]._id);
      } else if (repeatMode === "all") {
        setSelectedSong(playableQueue[0]?._id || null);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, isShuffle, repeatMode, setSelectedSong, setIsPlaying, playableQueue]);

  const togglePlay = async () => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current?.play();
      setPlaybackError("");
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback failed:", error);
      setPlaybackError("Unable to play track.");
      setIsPlaying(false);
    }
  };

  const handleSeek = (event) => {
    if (!audioRef.current || !duration) return;
    const value = Number(event.target.value);
    audioRef.current.currentTime = (value / 100) * duration;
    setProgress(value);
  };

  const playPrevious = () => {
    if (!playableQueue.length) return;

    if (audioRef.current && audioRef.current.currentTime > 5) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playableQueue.length - 1;
    setSelectedSong(playableQueue[prevIndex]._id);
  };

  const playNext = () => {
    if (!playableQueue.length) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playableQueue.length);
      setSelectedSong(playableQueue[randomIndex]._id);
      return;
    }

    const nextIndex = currentIndex < playableQueue.length - 1 ? currentIndex + 1 : 0;
    setSelectedSong(playableQueue[nextIndex]._id);
  };

  if (!currentSong) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-[88px] border-t border-[#282828] bg-[#000000] px-4 text-white">
      <audio ref={audioRef} src={currentSong.audio?.url || ""} preload="metadata" />

      <div className="flex h-full items-center justify-between gap-4">
        {/* Left Track Info */}
        <div className="flex min-w-[180px] max-w-[30%] items-center gap-3.5">
          <img
            src={currentSong.image?.url || currentSong.album?.thumbnail?.url}
            alt={currentSong.title}
            className="h-14 w-14 shrink-0 rounded-md object-cover shadow-md"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white hover:underline cursor-pointer">
              {currentSong.title}
            </p>
            <p className="truncate text-xs text-[#b3b3b3] hover:underline cursor-pointer">
              {currentSong.artist || currentSong.album?.title || "Unknown Artist"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleLikedSong(currentSong._id)}
            aria-label={isLiked(currentSong._id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
            className="ml-2 text-base transition hover:scale-110"
          >
            {isLiked(currentSong._id) ? (
              <FaHeart className="text-[#1ed760]" />
            ) : (
              <FaRegHeart className="text-[#b3b3b3] hover:text-white" />
            )}
          </button>
        </div>

        {/* Center Controls & Scrubber */}
        <div className="flex max-w-[722px] flex-1 flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-5">
            {/* Shuffle */}
            <button
              type="button"
              onClick={() => setIsShuffle((prev) => !prev)}
              title="Enable shuffle"
              className={`text-sm transition ${
                isShuffle ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <FaRandom />
            </button>

            {/* Prev */}
            <button
              type="button"
              onClick={playPrevious}
              title="Previous"
              className="text-base text-[#b3b3b3] transition hover:text-white"
            >
              <FaStepBackward />
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
            >
              {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="ml-0.5 text-sm" />}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={playNext}
              title="Next"
              className="text-base text-[#b3b3b3] transition hover:text-white"
            >
              <FaStepForward />
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={() => {
                if (repeatMode === "off") setRepeatMode("all");
                else if (repeatMode === "all") setRepeatMode("one");
                else setRepeatMode("off");
              }}
              title="Repeat"
              className={`text-sm transition ${
                repeatMode !== "off" ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <FaRedo />
            </button>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="flex w-full items-center gap-2 text-[11px] text-[#b3b3b3] font-mono">
            <span>{formatTime((progress / 100) * duration)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="spotify-slider w-full"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Tools (Volume, Quality, Queue, Devices) */}
        <div className="flex min-w-[180px] max-w-[30%] items-center justify-end gap-3 text-[#b3b3b3]">
          {/* Audio Quality indicator */}
          {isPremium ? (
            <span
              className="hidden items-center gap-1 rounded bg-[#1ed760]/10 px-2 py-0.5 text-[10px] font-bold text-[#1ed760] lg:inline-flex border border-[#1ed760]/30"
              title="Spotify Premium 320kbps High Fidelity Streaming"
            >
              <MdHighQuality className="text-sm" /> 320kbps
            </span>
          ) : (
            <Link
              to="/premium"
              className="hidden text-[10px] text-[#b3b3b3] hover:text-[#1ed760] lg:inline-block font-semibold"
              title="Upgrade to Spotify Premium for 320kbps Lossless Audio"
            >
              Standard 160kbps
            </Link>
          )}

          {/* Queue toggle */}
          <button
            type="button"
            onClick={() => setQueueOpen((open) => !open)}
            title="Queue"
            className={`transition hover:text-white ${queueOpen ? "text-[#1ed760]" : ""}`}
          >
            <MdQueueMusic className="text-xl" />
          </button>

          {/* Connect to device */}
          <button
            type="button"
            title="Connect to a device"
            className="transition hover:text-white"
          >
            <MdDevices className="text-lg" />
          </button>

          {/* Volume icon & slider */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="transition hover:text-white"
            >
              {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(event) => {
                const newValue = Number(event.target.value);
                setVolume(newValue);
                setIsMuted(newValue === 0);
              }}
              className="spotify-slider hidden w-20 sm:block"
            />
          </div>
        </div>
      </div>

      {/* Queue Drawer */}
      {queueOpen && (
        <div className="absolute bottom-[94px] right-4 max-h-80 w-80 overflow-y-auto rounded-lg border border-[#282828] bg-[#282828] p-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#3e3e3e] pb-2">
            <p className="text-sm font-bold text-white">Playback Queue</p>
            <button
              type="button"
              onClick={() => setQueue([])}
              className="text-xs text-[#b3b3b3] hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="mt-2 space-y-1">
            {playableQueue.map((item, idx) => (
              <button
                type="button"
                key={item._id}
                onClick={() => playSong(item._id, playableQueue)}
                className={`flex w-full items-center gap-3 rounded p-2 text-left transition hover:bg-[#3e3e3e] ${
                  item._id === currentSong._id ? "bg-[#3e3e3e] text-[#1ed760]" : "text-white"
                }`}
              >
                <span className="w-4 text-xs text-[#b3b3b3] font-mono">{idx + 1}</span>
                <img
                  src={item.image?.url || item.album?.thumbnail?.url}
                  alt=""
                  className="h-9 w-9 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{item.title}</p>
                  <p className="truncate text-[10px] text-[#b3b3b3]">{item.artist || "Artist"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Player;
