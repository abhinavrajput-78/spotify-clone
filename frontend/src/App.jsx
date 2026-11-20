import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Playlist from "./pages/Playlist";
import LikedSongs from "./pages/LikedSongs";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import Admin from "./pages/Admin";
import AlbumDetails from "./pages/AlbumDetails";
import Premium from "./pages/Premium";
import Loading from "./components/Loading";
import Player from "./components/Player";

import { UserData } from "./context/User";

const App = () => {
  const { loading, isAuthenticated, user } = UserData();

  if (loading) {
    return <Loading />;
  }

  const isAdmin = user?.role?.toLowerCase?.() === "admin";
  const homeRedirect = isAdmin ? "/admin" : "/home";

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={homeRedirect} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/home"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <Home />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/search"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <Search />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <Profile />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/playlist"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <Playlist />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/liked-songs"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <LikedSongs />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/recently-played"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <RecentlyPlayed />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/album/:id"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <AlbumDetails />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/premium"
          element={
            isAuthenticated ? (
              <Premium />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={homeRedirect} replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={homeRedirect} replace />
            ) : (
              <Register />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin ? (
              <Admin />
            ) : (
              <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {isAuthenticated && <Player />}
    </BrowserRouter>
  );
};

export default App;