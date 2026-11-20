import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../context/User";
import { assets } from "../assets/assets";
import { MdEmail, MdLock } from "react-icons/md";
import IconField from "../components/IconField";

function Login() {
  const navigate = useNavigate();
  const { loginUser, btnLoading } = UserData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    await loginUser(email, password, navigate);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] px-4 py-8">
      {/* Spotify Top Logo Header */}
      <div className="mb-8 flex items-center gap-2">
        <img
          src={assets.spotify_logo}
          alt="Spotify"
          className="h-10 w-10 object-contain"
        />
        <span className="text-2xl font-extrabold tracking-tight text-white">Spotify</span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-[#282828] bg-[#121212] p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-extrabold text-white">
          Log in to Spotify
        </h1>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-white">
              Email address
            </label>
            <IconField icon={MdEmail}>
              <input
                type="email"
                placeholder="name@domain.com"
                className="auth-input auth-input-icon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </IconField>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-white">
              Password
            </label>
            <IconField icon={MdLock}>
              <input
                type="password"
                placeholder="Enter your password"
                className="auth-input auth-input-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </IconField>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="auth-btn mt-2"
          >
            {btnLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <hr className="my-6 border-[#282828]" />

        <p className="text-center text-sm text-[#b3b3b3]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-white underline hover:text-[#1ed760]"
          >
            Sign up for Spotify
          </Link>
        </p>
      </div>

      <footer className="mt-8 text-center text-xs text-[#727272]">
        This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
      </footer>
    </div>
  );
}

export default Login;
