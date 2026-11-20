import React, { useEffect, useState } from "react";
import { FaPlay, FaHeart, FaRegHeart } from "react-icons/fa";
import { UserData } from "../context/User";
import { SongData } from "../context/Song";

const SongItem = ({ image, name, desc, id }) => {
  const { toggleLikedSong, user } = UserData();
  const { setSelectedSong, playSong } = SongData();

  const isLiked = user?.likedSongs?.includes(id);

  return (
    <div className="spotify-card group">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#282828] shadow-md">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />

        <button
          className="spotify-play-btn spotify-card-play absolute bottom-2 right-2"
          onClick={() => playSong(id)}
          aria-label={`Play ${name}`}
        >
          <FaPlay className="text-black ml-0.5 text-sm" />
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-white truncate hover:underline cursor-pointer" onClick={() => playSong(id)}>
            {name}
          </p>
          <p className="text-[#b3b3b3] text-xs truncate mt-0.5">{desc}</p>
        </div>

        <button
          onClick={() => toggleLikedSong(id)}
          className="text-sm mt-1 transition hover:scale-110"
        >
          {isLiked ? (
            <FaHeart className="text-[#1ed760]" />
          ) : (
            <FaRegHeart className="text-[#b3b3b3] hover:text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SongItem;
