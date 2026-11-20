import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../context/User";
import { assets } from "../assets/assets";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import IconField from "../components/IconField";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, btnLoading } = UserData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser(name, email, password, navigate);
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
        <h1 className="mb-2 text-center text-3xl font-extrabold text-white">
          Sign up to start listening
        </h1>
        <p className="mb-6 text-center text-xs text-[#b3b3b3]">
          Free on Spotify. No credit card required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-white">
              What should we call you?
            </label>
            <IconField icon={MdPerson}>
              <input
                type="text"
                placeholder="Enter your profile name"
                className="auth-input auth-input-icon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </IconField>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-white">
              What's your email?
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
              Create a password
            </label>
            <IconField icon={MdLock}>
              <input
                type="password"
                placeholder="Create a password"
                className="auth-input auth-input-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </IconField>
          </div>

          <button
            type="submit"
            className="auth-btn mt-2"
            disabled={btnLoading}
          >
            {btnLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <hr className="my-6 border-[#282828]" />

        <p className="text-center text-sm text-[#b3b3b3]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-white underline hover:text-[#1ed760]"
          >
            Log in here
          </Link>
        </p>
      </div>

      <footer className="mt-8 text-center text-xs text-[#727272]">
        By signing up, you agree to Spotify's Terms and Privacy Policy.
      </footer>
    </div>
  );
};

export default Register;
