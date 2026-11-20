import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";

const AlbumItem = ({ image, name, desc, id }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/album/" + id)}
      className="spotify-card group"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#282828] shadow-md">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />

        <span className="spotify-play-btn spotify-card-play absolute bottom-2 right-2">
          <FaPlay className="text-black ml-0.5 text-sm" />
        </span>
      </div>

      <p className="font-bold text-sm text-white truncate mt-3 hover:underline">
        {name}
      </p>

      <p className="text-[#b3b3b3] text-xs truncate mt-1">
        {desc || "Album"}
      </p>
    </div>
  );
};

export default AlbumItem;
