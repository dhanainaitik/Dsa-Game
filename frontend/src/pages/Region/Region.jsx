import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, ArrowLeft, CheckCircle2, Zap } from 'lucide-react';
import { getRegionById } from '../../data/regions';
import { getStatesForRegion } from '../../data/problems';
import { useProgress } from '../../context/ProgressContext';
import PageHeader from '../../components/UI/PageHeader';
import './Region.css';

export default function Region() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const region = getRegionById(regionId);
  const { progress, isStateLocked, isRegionLocked, getStateProgress, getRegionProgress, spendCoins } = useProgress();

  if (!region) {
    return (
      <div className="page" style={{ backgroundColor: 'var(--neo-beige)', minHeight: '100vh' }}>
        <PageHeader title="REGION NOT FOUND" description="This part of the Abyss remains hidden." />
        <div className="container text-center">
            <button className="neo-btn" onClick={() => navigate('/map')}>Back to World Map</button>
        </div>
      </div>
    );
  }

  const lockedRegion = isRegionLocked(regionId);
  const states = getStatesForRegion(regionId);
  const regionProg = getRegionProgress(regionId);
  const regionPct = regionProg.total > 0 ? Math.round((regionProg.solved / regionProg.total) * 100) : 0;
  
  const regionUnlockCosts = {
    'strings': 300,
    'linked-lists': 400,
    'trees': 500,
  };
  const unlockCost = regionUnlockCosts[regionId] || 999;

  const handleUnlock = () => {
    if (progress.coins >= unlockCost) {
      if (window.confirm(`Unlock ${region.name} for ${unlockCost} coins?`)) {
        spendCoins(unlockCost);
        // Force unlock by updating the context unlockedRegions
        const progressData = JSON.parse(localStorage.getItem('codo-progress') || "{}");
        progressData.unlockedRegions = { ...progressData.unlockedRegions, [regionId]: true };
        progressData.coins -= unlockCost;
        localStorage.setItem('codo-progress', JSON.stringify(progressData));
        window.location.reload();
      }
    } else {
      alert("Not enough coins!");
    }
  };

  return (
    <div className="page region-page animate-fadeIn" style={{ backgroundColor: 'var(--neo-beige)', paddingBottom: 100 }}>
      {/* Region header via PageHeader */}
      <PageHeader 
        title={region.name.toUpperCase()} 
        description={region.description}
      >
        <div className="flex flex-col items-center gap-6">
           <div className="flex items-center gap-12">
              <div className="flex flex-col items-center">
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Completion</div>
                 <div className="text-3xl font-black">{regionPct}%</div>
              </div>
              <div className="w-px h-12 bg-black/10" />
              <div className="flex flex-col items-center">
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Solved</div>
                 <div className="text-3xl font-black">{regionProg.solved}/{regionProg.total}</div>
              </div>
           </div>
           <div className="w-full max-w-md h-4 bg-gray-100 neo-border relative overflow-hidden">
              <div className="h-full bg-black transition-all duration-1000" style={{ width: `${regionPct}%` }} />
           </div>
        </div>
      </PageHeader>

      <div className="container">
        {/* Navigation Breadcrumb */}
        <button className="neo-btn btn-sm mb-12 flex items-center gap-2" onClick={() => navigate('/map')}>
          <ArrowLeft size={16} /> BACK TO WORLD MAP
        </button>

        {/* States grid OR Locked Screen */}
        {lockedRegion ? (
          <div className="region-locked-screen bg-white neo-border neo-shadow p-24 text-center">
             <div className="w-24 h-24 bg-gray-100 neo-border mx-auto mb-8 flex items-center justify-center">
                <Lock size={48} className="text-gray-400" />
             </div>
             <h2 className="text-4xl font-black mb-4">GATE SEALED</h2>
             <p className="text-gray-500 font-bold max-w-md mx-auto mb-12 uppercase tracking-tight">
                You have not defeated the required enemies to unlock this region. You may bypass the seal with Coins.
             </p>
             <button className="neo-btn neo-btn-primary px-12 py-4 text-xl" onClick={handleUnlock} disabled={progress.coins < unlockCost}>
                <Zap size={20} fill="currentColor" className="mr-3" /> Pay {unlockCost} Coins to Unlock
             </button>
             {progress.coins < unlockCost && <p className="text-xs font-black text-red-500 mt-6 uppercase">Insufficent Wealth</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 stagger-children">
            {states.map((state, idx) => {
              const locked = isStateLocked(state.id);
              const prog = getStateProgress(state.id);
              const pct = prog.total > 0 ? (prog.solved / prog.total) * 100 : 0;
              const complete = prog.solved === prog.total && prog.total > 0;

              return (
                <div
                  key={state.id}
                  className={`state-card bg-white neo-border neo-shadow h-full flex flex-col p-8 group transition-all ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-2 cursor-pointer'}`}
                  onClick={() => !locked && navigate(`/map/${regionId}/${state.id}`)}
                >
                  <div className="flex justify-between items-start mb-8">
                     <span className="text-5xl font-black text-gray-100 group-hover:text-yellow-400 transition-colors">
                        {String(idx + 1).padStart(2, '0')}
                     </span>
                     {complete ? (
                       <CheckCircle2 size={32} className="text-emerald-500" />
                     ) : locked ? (
                       <Lock size={24} className="text-gray-400" />
                     ) : (
                       <ChevronRight size={24} className="text-gray-300 group-hover:text-black group-hover:translate-x-2 transition-all" />
                     )}
                  </div>

                  <div className="flex-1">
                     <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{state.name}</h3>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{state.label}</p>
                  </div>

                  <div className="mt-auto space-y-4">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{locked ? 'Encrypted' : `${prog.solved} / ${prog.total}`}</span>
                     </div>
                     <div className="h-4 w-full bg-gray-50 neo-border relative overflow-hidden">
                        <div 
                           className={`h-full transition-all duration-700 ${complete ? 'bg-emerald-500' : 'bg-black'}`}
                           style={{ width: `${pct}%` }} 
                        />
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
