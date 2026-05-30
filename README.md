<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs"/>
  <br/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Google_Calendar-4285F4?style=for-the-badge&logo=google-calendar&logoColor=white" alt="Google Calendar"/>
</p>

<div align="center">
  <h1>SkillSwap</h1>
  <h3>Peer-to-Peer Skill Exchange Platform</h3>
  <p>
    <strong>Learn. Teach. Grow.</strong> — A community-driven ecosystem where knowledge has no price tag.
  </p>
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [User Roles](#-user-roles)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**SkillSwap** is a full-stack skill exchange marketplace that connects learners with mentors. Unlike traditional e-learning platforms, SkillSwap fosters **peer-to-peer knowledge sharing** — users can both teach and learn, earning recognition, XP, and building their reputation within the community.

Whether you want to master JavaScript, learn guitar, get feedback on your designs, or teach others your expertise, SkillSwap provides the infrastructure to make it happen with **real-time chat**, **AI-powered recommendations**, **secure payments**, and **gamified progression**.

---

## 🚀 Key Features

### 🔐 Authentication & Security
| Feature | Description |
|---------|-------------|
| **JWT Auth** | HTTP-only cookie-based access & refresh token rotation |
| **Email Verification** | Verify email during registration with resend support |
| **Password Management** | Forgot/reset password flow, change password |
| **Role-Based Access** | Learner, Mentor, and Admin dashboards with guards |
| **Rate Limiting** | Auth endpoints protected against brute-force |
| **Helmet + CORS** | Secure HTTP headers and cross-origin policy |

### 👤 User Profiles & Social
| Feature | Description |
|---------|-------------|
| **Rich Profiles** | Avatar (Cloudinary), bio, skills, interests, social links |
| **Public Profiles** | Shareable profile pages with stats and reviews |
| **Follow System** | Follow/unfollow, follower/following lists, suggestions |
| **Block Users** | Block/unblock with chat restrictions |
| **Activity Feed** | Real-time feed of followed users' activity |

### 🎓 Sessions & Learning
| Feature | Description |
|---------|-------------|
| **Session CRUD** | Create, edit, delete sessions (online/offline, paid/free) |
| **Booking System** | Request to book, mentor accepts/rejects, full status flow |
| **Session Management** | Start, complete, cancel sessions with timeline tracking |
| **Skill Marketplace** | Browse, search, and filter sessions by category |
| **Wishlist** | Save sessions for later |
| **Session Materials** | Upload and share files per session |

### 💬 Real-Time Communication
| Feature | Description |
|---------|-------------|
| **Direct Messaging** | One-on-one chat with typing indicators |
| **Booking Chat** | Session-specific conversation threads |
| **Read Receipts** | Track message read status |
| **File Sharing** | Upload images/documents in chat |
| **Message Reactions** | React with emojis to any message |
| **Delete Messages** | Remove your own messages |
| **Search Messages** | Full-text search within conversations |

### 🤖 AI-Powered Features
| Feature | Description |
|---------|-------------|
| **Skill Recommendations** | AI suggests sessions based on user profile & interests |
| **Learning Roadmap** | Generate personalized learning paths |
| **Content Generation** | Auto-generate session titles, descriptions, tags, outcomes |
| **Mentor Assistant** | AI helper for mentors to craft better sessions |
| **AI Chat** | Conversational AI for guidance |
| **Smart Search** | AI-enhanced session discovery |

### 💰 Payments & Wallet
| Feature | Description |
|---------|-------------|
| **Razorpay Integration** | Secure payment gateway for paid sessions |
| **Wallet System** | Add funds, pay via wallet balance |
| **Earnings Dashboard** | Track mentor earnings and withdrawal history |
| **Transaction History** | Complete audit trail for all financial activity |

### 🏆 Gamification & Reputation
| Feature | Description |
|---------|-------------|
| **XP & Level System** | Earn XP for sessions, reviews, and engagement |
| **Badges** | Achievement badges for milestones |
| **Leaderboards** | Mentor and learner rankings |
| **Reviews & Ratings** | 5-star rating system with written reviews |
| **Certificates** | Auto-generated PDF certificates per skill |

### 🛠️ Mentor Tools
| Feature | Description |
|---------|-------------|
| **Availability Calendar** | Set weekly availability slots |
| **Google Calendar Sync** | OAuth integration for scheduling |
| **Analytics Dashboard** | Session stats, earnings, learner engagement |
| **Mentor Applications** | Apply for mentor status with admin approval |
| **Skill Management** | Create and manage teaching skills |

### ⚙️ Admin Panel
| Feature | Description |
|---------|-------------|
| **Dashboard** | Platform-wide analytics with charts |
| **User Management** | View, block, unblock, manage roles |
| **Skill Moderation** | Approve/reject skills |
| **Session Oversight** | Monitor and manage all sessions |
| **Booking Management** | View and moderate bookings |
| **Payment Tracking** | Full payment and earnings overview |
| **Dispute Resolution** | Handle learner-mentor disputes |
| **Categories** | Manage skill categories |
| **Broadcast** | Send platform-wide notifications |
| **Settings** | Platform configuration |

### 🔔 Notifications
| Feature | Description |
|---------|-------------|
| **Real-Time Push** | Socket.IO-powered instant notifications |
| **Unread Counts** | Badge indicators across the app |
| **Mark Read** | Individual or bulk mark-as-read |
| **Admin Broadcasts** | Platform-wide announcements |
| **Presence Detection** | Online/offline status indicators |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **Socket.IO Client** | Real-time bidirectional events |
| **Chart.js + react-chartjs-2** | Analytics & data visualization |
| **react-calendar** | Date picker & calendar UI |
| **react-toastify** | Toast notifications |
| **SweetAlert2** | Modal dialogs & alerts |
| **react-spinners** | Loading state indicators |
| **Bootstrap 4** | CSS framework (via CDN) |
| **Owl Carousel + jQuery** | Interactive carousels |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | HTTP server & routing |
| **MongoDB + Mongoose 9** | Database & ODM |
| **Socket.IO 4** | WebSocket server |
| **JWT (jsonwebtoken)** | Authentication |
| **bcryptjs** | Password hashing |
| **Joi** | Request validation |
| **Multer + Cloudinary** | File upload & CDN |
| **Razorpay** | Payment gateway |
| **Nodemailer** | Email delivery (Gmail SMTP) |
| **node-cron** | Scheduled jobs |
| **PDFKit** | Certificate PDF generation |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |
| **Google APIs** | Calendar integration |

### AI Integration
| Provider | Usage |
|----------|-------|
| **Google Gemini** (@google/genai) | Recommendations, content generation |
| **Groq** (groq-sdk) | AI chat, search, roadmap |
| **OpenRouter** | Fallback AI provider |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React + Vite)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Auth UI  │  │Dashboards│  │  Charts & Analytics  │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Socket.IO Client (Real-Time)            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Axios HTTP Client (API Calls)           │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Server (Express + Socket.IO)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Auth MW  │  │  Routes  │  │  Socket Events       │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Controllers (28 modules)          │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Services & Utilities Layer               │   │
│  └──────────────────────────────────────────────────┘   │
└──────┬─────────────────────────────────────────┬────────┘
       │                                         │
       ▼                                         ▼
┌──────────────┐                    ┌─────────────────────┐
│   MongoDB    │                    │  External Services   │
│  (Atlas)    │                    │  ┌───────────────┐  │
│             │                    │  │  Cloudinary   │  │
│             │                    │  ├───────────────┤  │
│             │                    │  │  Razorpay     │  │
│             │                    │  ├───────────────┤  │
│             │                    │  │  Google APIs  │  │
│             │                    │  ├───────────────┤  │
│             │                    │  │  AI Providers │  │
│             │                    │  └───────────────┘  │
└──────────────┘                    └─────────────────────┘
```

### Data Flow
1. **Authentication**: JWT tokens stored in HTTP-only cookies → `authMiddleware` validates on each request
2. **API Requests**: Axios with base URL → Express routes → Controllers → MongoDB → Response
3. **Real-Time**: Socket.IO connection with JWT handshake → Event-driven bidirectional messaging
4. **Payments**: Razorpay order creation → Client-side checkout → Server-side verification
5. **File Upload**: Multer middleware → Cloudinary CDN → URL stored in database

---

## 👥 User Roles

<div align="center">

| Role | Capabilities |
|------|-------------|
| **👤 Learner** | Browse sessions, book sessions, chat with mentors, earn XP, write reviews, manage wallet |
| **🎓 Mentor** | Create/manage sessions, set availability, accept bookings, earn money, view analytics |
| **🛡️ Admin** | Manage users, moderate skills/sessions, resolve disputes, broadcast, platform analytics |

</div>

Users can **apply to become a mentor** through the mentor application system (admin-approved).

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **MongoDB** (local or Atlas URI)
- **npm** or **yarn**
- (Optional) Razorpay, Cloudinary, Google Calendar API keys

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/skillswap.git
cd skillswap

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running the Application

#### 1. Start MongoDB
```bash
# Local MongoDB
mongod
# OR use MongoDB Atlas (connection string in .env)
```

#### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)
```

#### 3. Start the Backend
```bash
cd server
npm run dev    # Development with nodemon (port 5000)
```

#### 4. Start the Frontend
```bash
cd client
npm run dev    # Vite dev server (port 5173)
```

The frontend proxies `/api` requests to the backend. Open `http://localhost:5173` in your browser.

#### 5. Seed Admin User (Optional)
```bash
cd server
node config/seeder.js
```

---

## 🔐 Environment Variables

Create `.env` in the `server/` directory:

| Variable | Description | Required |
|----------|-------------|:--------:|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret for signing access tokens | ✅ |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | ✅ |
| `JWT_EXPIRES_IN` | Access token expiry (e.g. `15m`) | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `7d`) | ✅ |
| `CLIENT_URL` | Frontend URL (`http://localhost:5173`) | ✅ |
| `PORT` | Server port (default: `5000`) | |
| `NODE_ENV` | `development` or `production` | |
| `EMAIL_USER` | Gmail address for Nodemailer | |
| `EMAIL_PASS` | Gmail app password | |
| `RAZORPAY_KEY_ID` | Razorpay API key | |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | |
| `CLOUDINARY_API_KEY` | Cloudinary API key | |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | |
| `GEMINI_API_KEY` | Google Gemini API key | |
| `GROQ_API_KEY` | Groq API key | |
| `OPENROUTER_API_KEY` | OpenRouter API key | |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI | |

---

## 📁 Project Structure

```
skillSwap/
├── client/                        # React + Vite Frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── main.jsx               # Entry point
│   │   ├── App.jsx                # Router + Auth + routes
│   │   ├── Apiservices.js         # Axios API client
│   │   ├── responsive.css         # Responsive breakpoints
│   │   ├── context/
│   │   │   └── SocketContext.jsx  # Socket.IO provider
│   │   ├── components/
│   │   │   ├── pages/             # Public & auth pages
│   │   │   │   ├── learnerPages/  # Learner dashboard (14 pages)
│   │   │   │   └── mentorPages/   # Mentor dashboard (12 pages)
│   │   │   ├── adminPages/        # Admin panel (18 components)
│   │   │   ├── layout/            # Layout components
│   │   │   │   ├── user/          # Navbar, Footer, Sidebars
│   │   │   │   └── admin/         # AdminMaster, AdminSidebar
│   │   │   ├── shared/            # Shared components (8)
│   │   │   └── ui/                # Skeleton, XpCelebration
│   │   └── utils/                 # Helpers & utilities
│   └── package.json
│
├── server/                        # Node.js + Express Backend
│   ├── index.js                   # Express app entry
│   ├── socket.js                  # Socket.IO setup
│   ├── config/                    # DB, Cloudinary, Razorpay, Seeder
│   ├── middleware/                 # Auth, roles, upload, validation
│   ├── validations/               # Joi schemas
│   ├── routes/                    # Express route definitions
│   ├── apis/                      # 28 feature modules
│   │   ├── Auth/
│   │   ├── Users/
│   │   ├── Profile/
│   │   ├── Skills/
│   │   ├── Session/
│   │   ├── Request/
│   │   ├── Chat/
│   │   ├── Payment/
│   │   ├── AI/
│   │   ├── Admin/
│   │   └── ...                    # 18 more modules
│   ├── services/                  # Business logic layer
│   ├── utilities/                 # Helpers (email, paginate, etc.)
│   ├── jobs/                      # Cron jobs (reminders, auto-complete)
│   └── package.json
```

---

## 📸 Screenshots

> *Screenshots coming soon. Here's what you'll see:*

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Home Page</strong></td>
      <td align="center"><strong>Explore Sessions</strong></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/400x250?text=Home+Page" alt="Home Page"/></td>
      <td><img src="https://via.placeholder.com/400x250?text=Explore+Sessions" alt="Explore Sessions"/></td>
    </tr>
    <tr>
      <td align="center"><strong>Mentor Dashboard</strong></td>
      <td align="center"><strong>Real-Time Chat</strong></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/400x250?text=Mentor+Dashboard" alt="Mentor Dashboard"/></td>
      <td><img src="https://via.placeholder.com/400x250?text=Chat" alt="Chat"/></td>
    </tr>
    <tr>
      <td align="center"><strong>Admin Analytics</strong></td>
      <td align="center"><strong>AI Recommendations</strong></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/400x250?text=Admin+Analytics" alt="Admin Analytics"/></td>
      <td><img src="https://via.placeholder.com/400x250?text=AI+Recommendations" alt="AI Recommendations"/></td>
    </tr>
  </table>
</div>

---

## 🗺️ Roadmap

### ✅ Implemented
- [x] User authentication (register, login, verify, refresh tokens, logout)
- [x] Email verification & password management
- [x] Rich user profiles with Cloudinary avatars
- [x] Full skill CRUD with admin approval workflow
- [x] Categories management (admin)
- [x] Session CRUD (create, edit, delete, manage)
- [x] Booking system with request/accept/reject flow
- [x] Real-time messaging (DM, booking chat, reactions, file uploads, block)
- [x] Real-time notifications with Socket.IO
- [x] Razorpay payment integration
- [x] Wallet system (add funds, pay, transactions)
- [x] Mentor earnings & withdrawals
- [x] AI-powered recommendations & content generation
- [x] AI chat assistant & learning roadmap
- [x] Google Calendar integration
- [x] Review & rating system (1-5 stars)
- [x] Follow/unfollow system with suggestions
- [x] Activity feed
- [x] XP & level progression system
- [x] Badges & achievements
- [x] Leaderboards (mentors & learners)
- [x] Wishlist
- [x] Session materials upload
- [x] PDF certificate generation
- [x] Dispute resolution system
- [x] Admin panel (dashboard, users, skills, sessions, payments, disputes, broadcast)
- [x] Mentor application & approval
- [x] Real-time user presence (online/offline)
- [x] Loading skeletons & error boundaries
- [x] Responsive design (XS to XXL)
- [x] Cron jobs (session reminders, auto-complete)
- [x] Rate limiting (auth routes)
- [x] Security headers (Helmet), CORS

### 🔜 In Progress / Planned
- [ ] Skill rating & trust index
- [ ] Advanced search & matching algorithm
- [ ] Unit & integration tests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Docker containerization
- [ ] Production build configuration (serve React from Express)
- [ ] End-to-end testing (Playwright/Cypress)
- [ ] Rate limiting expansion to all API routes
- [ ] Monitoring & logging (Winston, Sentry)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code follows the existing style conventions and includes appropriate validation.

### Development Guidelines
- Follow the existing file structure (controllers in `apis/`, routes in `routes/`)
- Use Joi schemas for input validation
- Maintain JWT authentication patterns (authMiddleware for protected routes)
- Test manually before submitting PRs (test suite coming soon)

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <p>
    Built with ❤️ as a full-stack portfolio project
    <br/>
    <sub>Part of the journey to build real-world applications and explore scalable system design.</sub>
  </p>
</div>
