import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ProgressProvider } from './context/ProgressContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import WorldMap from './pages/WorldMap/WorldMap';
import Region from './pages/Region/Region';
import State from './pages/State/State';
import Question from './pages/Question/Question';
import LogicLab from './pages/LogicLab/LogicLab';
import LogicLabTopic from './pages/LogicLab/LogicLabTopic';
import Shop from './pages/Shop/Shop';
import BattleLobby from './pages/BattleLobby/BattleLobby';
import MultiplayerArena from './pages/MultiplayerArena/MultiplayerArena';
import BattleGroundArena from './pages/BattleGround/BattleGroundArena';
import Docs from './pages/Docs/Docs';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import StoryEngine from './pages/Story/StoryEngine';
import Login from './pages/Login/Login';
import Community from './pages/Community/Community';
import PostDetail from './pages/Community/PostDetail';
import CreatePost from './pages/Community/CreatePost';
import Footer from './components/Footer/Footer';
import CoinRewardToast from './components/UI/CoinRewardToast';
import { MultiplayerProvider } from './context/MultiplayerContext';
import { ThemeProvider } from './context/ThemeContext';

// Question page gets full-screen without navbar
function Layout({ children }) {
  const location = useLocation();
  const fullscreen = 
    location.pathname.startsWith('/problem/') || 
    location.pathname === '/login' ||
    location.pathname.startsWith('/story/') ||
    location.pathname.startsWith('/battle/') ||
    location.pathname.startsWith('/battleground/');

  return (
    <>
      <CoinRewardToast />
      {!fullscreen && <Navbar />}
      {children}
      {!fullscreen && <Footer />}
    </>
  );
}

// Protected Route Wrapper — uses Clerk's useUser directly
function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null; // Clerk is still initialising
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ProgressProvider>
            <MultiplayerProvider>
              <Layout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/story/:chapterId" element={<ProtectedRoute><StoryEngine /></ProtectedRoute>} />
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><WorldMap /></ProtectedRoute>} />
                <Route path="/map/:regionId" element={<ProtectedRoute><Region /></ProtectedRoute>} />
                <Route path="/map/:regionId/:stateId" element={<ProtectedRoute><State /></ProtectedRoute>} />
                <Route path="/problem/:problemId" element={<ProtectedRoute><Question /></ProtectedRoute>} />
                <Route path="/logic-lab" element={<ProtectedRoute><LogicLab /></ProtectedRoute>} />
                <Route path="/logic-lab/:topicId" element={<ProtectedRoute><LogicLabTopic /></ProtectedRoute>} />
                <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
                <Route path="/pvp" element={<ProtectedRoute><BattleLobby /></ProtectedRoute>} />
                <Route path="/battle/:roomId" element={<ProtectedRoute><MultiplayerArena /></ProtectedRoute>} />
                <Route path="/battleground/:roomId" element={<ProtectedRoute><BattleGroundArena /></ProtectedRoute>} />
                <Route path="/docs" element={<ProtectedRoute><Docs /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/community/new" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
                <Route path="/community/edit/:postId" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
                <Route path="/community/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Layout>
            </MultiplayerProvider>
          </ProgressProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
