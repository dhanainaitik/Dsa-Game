# DSA Game 🎮⚔️

An interactive, gamified RPG platform designed to master Data Structures and Algorithms through story quests, pattern visualizers, and real-time multiplayer coding battles.

---

## 🌟 Key Features

- 🗺️ **World Map & Algorithmic Regions**: Progress through themed algorithmic realms (Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming), unlocking territories as you solve challenges.
- 📜 **Story Mode Engine**: Narrative-driven quest system combining interactive coding problems with an immersive RPG storyline.
- 🧪 **Logic Lab Interactive Visualizers**: Hands-on step-through visualizers for fundamental data structures and algorithmic paradigms:
  - Arrays & Strings
  - Linked Lists
  - Stacks & Queues
  - Binary Trees & BSTs
  - Graph Traversal (BFS / DFS)
  - Dynamic Programming & Recursion
- ⚔️ **PvP Battle Arena & BattleGround**: Real-time multiplayer algorithmic duels powered by WebSockets (Socket.IO).
- 🛒 **Shop & Inventory System**: Earn coins and experience (XP) upon completing problems, level up your rank (Bronze to Abyss), and equip items.
- 🤖 **AI Companion & Code Evaluation**: Automated code reviews, hints, and complexity analysis powered by Google Gemini.
- 👥 **Community Hub**: Share solutions, participate in discussions, upvote posts, and collaborate with peers.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Editor**: [@uiw/react-codemirror](https://uiwjs.github.io/react-codemirror/) (with syntax highlighting for C++, Java, Python, and JavaScript)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Authentication**: [@clerk/clerk-react](https://clerk.com/)
- **Real-Time**: [Socket.io-client](https://socket.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Real-Time Communication**: [Socket.IO](https://socket.io/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL) + [Prisma ORM](https://www.prisma.io/)
- **Auth Verification**: Clerk JWT authentication
- **AI Engine**: Google Gemini API (`@google/generative-ai`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Supabase](https://supabase.com/) account (optional, for persistent player data and community)
- [Clerk](https://clerk.com/) account (for user authentication)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dhanainaitik/Dsa-Game.git
   cd Dsa-Game
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=3001
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
GEMINI_API_KEY=your_google_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_postgresql_database_url
```

### Frontend (`frontend/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001
```

---

## 🏃‍♂️ Running the Application

From the root directory:

- **Start the Backend Server:**
  ```bash
  npm run dev:backend
  ```
  *The backend will start on `http://localhost:3001`.*

- **Start the Frontend Development Server:**
  ```bash
  npm run dev:frontend
  ```
  *The frontend will start on `http://localhost:5173`.*

- **Build for Production:**
  ```bash
  npm run build:frontend
  ```

---

## 📄 License

This project is licensed under the MIT License.

