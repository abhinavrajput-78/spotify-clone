# 🎵 Spotify Clone - Full-Stack Music Streaming Application

A production-ready music streaming platform built with React, Express.js, and MongoDB. Features complete user authentication, album/song management, playlist system, search, artist profiles, and admin dashboard.

**Status:** 🚀 Active Development | **Version:** 2.0.0 | **Last Updated:** 2026-08-17

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [User Roles](#user-roles)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### User Features
- 🔐 User registration and login
- 🎵 Browse and search albums
- ▶️ Play and pause music
- ❤️ Save songs to liked songs
- 📝 Create and manage playlists
- 🔄 View recently played tracks
- 👤 User profile management

### Admin Features
- 📀 Create, edit, and delete albums
- 🎶 Upload and manage songs
- 📊 View dashboard statistics
- 👥 Manage user accounts
- 🖼️ Upload album artwork and audio files

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and development server
- **React Router** - Navigation and routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object modeling for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (v4.4 or higher) - Local or Atlas
- **Git** (for version control)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd SPOTIFY\ CLONE
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Configuration

### Backend Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
BACKEND_URL=http://localhost:5000

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/spotify

# JWT Configuration
JWT_SECRET=spotify123

# Optional: For future cloud storage upgrades
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

#### Environment Variables Explanation:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `BACKEND_URL` | Backend URL for file serving |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |

### MongoDB Setup

#### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB

   # macOS (if installed via Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. Create database:
   ```bash
   mongosh
   > use spotify
   > db.createCollection("users")
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Generate connection string
4. Update `MONGO_URI` in `.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/spotify?retryWrites=true&w=majority
   ```

---

## ▶️ Running the Project

### Start MongoDB (if using local)

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Start Backend Server

```bash
# Option 1: Production mode
npm start

# Option 2: Development mode (with hot reload)
npm run dev
```

Backend runs on: **http://localhost:5000**

### Start Frontend Development Server (in new terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on: **http://localhost:5173**

### Frontend Production Build

```bash
cd frontend
npm run build
```

---

## 📁 Project Structure

```
SPOTIFY CLONE/
├── backend/
│   ├── controllers/
│   │   ├── albumController.js      # Album CRUD operations
│   │   ├── songController.js       # Song CRUD operations
│   │   └── userController.js       # User auth & profile
│   ├── models/
│   │   ├── Album.js                # Album schema
│   │   ├── song.js                 # Song schema
│   │   └── User.js                 # User schema
│   ├── routes/
│   │   ├── albumRoutes.js          # Album endpoints
│   │   ├── songRoutes.js           # Song endpoints
│   │   └── userRoutes.js           # User endpoints
│   ├── middlewares/
│   │   ├── isAuth.js               # JWT authentication
│   │   └── multer.js               # File upload handling
│   ├── utils/
│   │   ├── TryCatch.js             # Error handling wrapper
│   │   ├── genrateToken.js         # JWT token generator
│   │   └── urlGenerator.js         # File URL generator
│   ├── database/
│   │   └── db.js                   # MongoDB connection
│   ├── uploads/                    # Local file storage
│   ├── index.js                    # Server entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── Sidebar.jsx         # Sidebar navigation
│   │   │   ├── Player.jsx          # Music player
│   │   │   ├── SongItem.jsx        # Song list item
│   │   │   ├── AlbumItem.jsx       # Album list item
│   │   │   ├── Loading.jsx         # Loading spinner
│   │   │   ├── PlayListCard.jsx    # Playlist card
│   │   │   └── Layout.jsx          # Layout wrapper
│   │   ├── context/
│   │   │   ├── User.jsx            # User auth context
│   │   │   └── Song.jsx            # Song data context
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── Home.jsx            # User home page
│   │   │   ├── Admin.jsx           # Admin dashboard
│   │   │   ├── Playlist.jsx        # Playlist page
│   │   │   ├── LikedSongs.jsx      # Liked songs page
│   │   │   ├── RecentlyPlayed.jsx  # Recently played page
│   │   │   └── AlbumDetails.jsx    # Album details page
│   │   ├── assets/
│   │   │   └── assets.js           # Static assets
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── public/                     # Static files
│   ├── package.json
│   └── vite.config.js              # Vite configuration
│
├── .env
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/register` | Register new user | ❌ |
| POST | `/api/users/login` | Login user | ❌ |
| GET | `/api/users/logout` | Logout user | ✅ |
| GET | `/api/users/me` | Get current user profile | ✅ |

### Album Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/albums/new` | Create album (Admin only) | ✅ |
| GET | `/api/albums` | Get all albums | ❌ |
| DELETE | `/api/albums/:id` | Delete album (Admin only) | ✅ |

### Song Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/songs/album/:id/song/new` | Add song to album (Admin only) | ✅ |
| GET | `/api/songs/songs` | Get all songs | ❌ |
| GET | `/api/songs/song/:id` | Get single song | ❌ |
| DELETE | `/api/songs/song/:id` | Delete song (Admin only) | ✅ |

### User Playlist Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/song/:id` | Add song to playlist | ✅ |
| POST | `/api/users/like/:id` | Toggle like on song | ✅ |
| POST | `/api/users/recently-played/:id` | Add to recently played | ✅ |

---

## 🗄️ Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ["user", "admin"], default: "user"),
  playlist: [String],  // Array of song IDs
  likedSongs: [String], // Array of liked song IDs
  recentlyPlayed: [String], // Array of recently played song IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Album Model

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  thumbnail: {
    id: String (required),
    url: String (required)
  },
  songs: [ObjectId] (ref: "Song"),
  createdAt: Date,
  updatedAt: Date
}
```

### Song Model

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  image: {
    id: String (required),
    url: String (required)
  },
  audio: {
    id: String (required),
    url: String (required)
  },
  album: ObjectId (ref: "Album", required),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### How Authentication Works

1. **Registration**: User provides name, email, password → Password hashed with bcryptjs → User created in database
2. **Login**: User provides email, password → Password verified → JWT token generated → Token stored in HTTP-only cookie
3. **Protected Routes**: JWT extracted from cookie → Token verified → User attached to request → Endpoint executes

### JWT Token Structure

```javascript
{
  id: user._id,
  iat: issued at timestamp,
  exp: expiration timestamp (24 hours)
}
```

### Authorization Flow

```
Client Request
    ↓
Check Cookie for JWT Token
    ↓
Verify Token Signature
    ↓
Decode Token & Extract User ID
    ↓
Fetch User from Database
    ↓
Attach User to Request (req.user)
    ↓
Check User Role (if admin route)
    ↓
Execute Endpoint
```

---

## 👥 User Roles

### Regular User
- ✅ Browse albums and songs
- ✅ Play music
- ✅ Create playlists
- ✅ Like/unlike songs
- ✅ View recently played
- ❌ Create/delete albums
- ❌ Upload songs
- ❌ Access admin panel

### Admin User
- ✅ All user features
- ✅ Create albums
- ✅ Upload and manage songs
- ✅ Delete albums
- ✅ Delete songs
- ✅ View admin dashboard
- ✅ View statistics

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check MongoDB is running
# Windows: net start MongoDB
# macOS: brew services list
# Linux: sudo systemctl status mongod

# Verify connection string in .env
# Local: mongodb://127.0.0.1:27017/spotify
```

### Issue: "CORS error when uploading files"

**Solution:**
- Ensure `frontend` URL in `backend/index.js` CORS config matches your frontend URL
- Default is `http://localhost:5173`

### Issue: "Cannot upload files - 413 Payload Too Large"

**Solution:**
- Increase file size limit in `backend/middlewares/multer.js`
- Current limit: 20MB

### Issue: "JWT token invalid or expired"

**Solution:**
```bash
# Clear browser cookies
# Login again
# Token expires after 24 hours
```

### Issue: "Uploaded files not accessible"

**Solution:**
- Check `uploads/` folder exists in backend directory
- Ensure backend server is running
- Verify file permissions

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Change PORT in .env file
PORT=5001

# Or kill process using port 5000
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -i :5000
```

### Issue: "Frontend build fails"

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🤝 Contributing

### Steps to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Guidelines

- Follow existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Test changes before submitting PR

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Guide](https://jwt.io/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

## 📞 Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed description
4. Include error messages and steps to reproduce

---

## 🎯 Future Enhancements

- [ ] Add search functionality
- [ ] Implement shuffle and repeat modes
- [ ] Add volume control
- [ ] Implement progress bar seeking
- [ ] Add user follow/unfollow
- [ ] Add music recommendations
- [ ] Implement payment integration
- [ ] Add social sharing features
- [ ] Mobile app version
- [ ] Offline download feature

---

## 🙏 Acknowledgments

- Inspired by Spotify's UI/UX
- Built with modern web technologies
- Designed for learning and educational purposes

---

**Happy Listening! 🎵**

Last Updated: 2026-08-17
# spotify-clone
# spotify-clone
# spotify-clone
# spotify-clone
# spotify-clone
# spotify-clone
# spotify-clone
