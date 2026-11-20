import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaSpotify,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const footerGroups = [
  {
    title: "Company",
    links: [
      { name: "About", href: "https://www.spotify.com/about-us/contact/" },
      { name: "Jobs", href: "https://www.lifeatspotify.com/" },
      { name: "For the Record", href: "https://newsroom.spotify.com/" },
    ],
  },
  {
    title: "Communities",
    links: [
      { name: "For Artists", href: "https://artists.spotify.com/" },
      { name: "Developers", href: "https://developer.spotify.com/" },
      { name: "Advertising", href: "https://ads.spotify.com/" },
      { name: "Investors", href: "https://investors.spotify.com/" },
      { name: "Vendors", href: "https://spotifyforvendors.com/" },
    ],
  },
  {
    title: "Useful links",
    links: [
      { name: "Support", href: "https://support.spotify.com/" },
      { name: "Free Mobile App", href: "https://www.spotify.com/free/" },
      { name: "Premium Plans", href: "/premium", internal: true },
    ],
  },
  {
    title: "Spotify Plans",
    links: [
      { name: "Premium Individual", href: "/premium", internal: true },
      { name: "Premium Duo", href: "/premium", internal: true },
      { name: "Premium Family", href: "/premium", internal: true },
      { name: "Premium Student", href: "/premium", internal: true },
      { name: "Spotify Free", href: "/home", internal: true },
    ],
  },
];

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/spotify", icon: FaInstagram },
  { name: "Twitter", href: "https://twitter.com/spotify", icon: FaTwitter },
  { name: "Facebook", href: "https://www.facebook.com/Spotify", icon: FaFacebookF },
];

const Footer = () => (
  <footer className="mt-20 border-t border-[#282828] pt-12 pb-24 text-[#b3b3b3]">
    <div className="grid gap-8 grid-cols-2 md:grid-cols-5">
      {footerGroups.map((group) => (
        <div key={group.title}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            {group.title}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {group.links.map((link) => (
              <li key={link.name}>
                {link.internal ? (
                  <Link
                    to={link.href}
                    className="hover:text-white hover:underline transition"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white hover:underline transition"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Social links */}
      <div className="col-span-2 md:col-span-1 flex md:justify-end gap-3 items-start">
        {socialLinks.map(({ name, href, icon: Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#292929] text-white transition hover:bg-[#1ed760] hover:text-black"
          >
            <Icon className="text-lg" />
          </a>
        ))}
      </div>
    </div>

    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#282828] pt-8 text-xs text-[#727272] gap-4">
      <div className="flex flex-wrap gap-4">
        <span>Legal</span>
        <span>Safety & Privacy Center</span>
        <span>Privacy Policy</span>
        <span>Cookies</span>
        <span>About Ads</span>
        <span>Accessibility</span>
      </div>
      <p>© {new Date().getFullYear()} Spotify AB</p>
    </div>
  </footer>
);

export default Footer;
