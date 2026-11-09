import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, ChevronRight, Lock } from 'lucide-react';
import { getRegionById } from '../../data/regions';
import { getState, getProblem } from '../../data/problems';
import { useProgress } from '../../context/ProgressContext';
import PageHeader from '../../components/UI/PageHeader';
import './State.css';

const DIFF_ORDER = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'];

export default function State() {
  const { regionId, stateId } = useParams();
  const navigate = useNavigate();
  const region = getRegionById(regionId);
  const state = getState(stateId);
  const { progress, isStateLocked, getStateProgress } = useProgress();

  if (!region || !state) {
    return <div className="page" style={{ background: 'var(--neo-beige)', minHeight: '100vh' }}><PageHeader title="NOT FOUND" description="This part of the Abyss remains hidden." /></div>;
  }

  if (isStateLocked(stateId)) {
    return (
      <div className="page" style={{ background: 'var(--neo-beige)', minHeight: '100vh' }}>
        <PageHeader title="GATE SEALED" description="Complete the previous state to unlock this one." />
        <div className="container text-center">
            <button className="neo-btn" onClick={() => navigate(`/map/${regionId}`)}>
                <ArrowLeft size={16} /> BACK TO {region.name.toUpperCase()}
            </button>
        </div>
      </div>
    );
  }

  const problems = state.problems.map(pid => getProblem(pid)).filter(Boolean);
  const prog = getStateProgress(stateId);
  const pct = prog.total > 0 ? Math.round((prog.solved / prog.total) * 100) : 0;
  const complete = prog.solved === prog.total && prog.total > 0;

  return (
    <div className="page state-page animate-fadeIn" style={{ backgroundColor: 'var(--neo-beige)', paddingBottom: 100 }}>
       <PageHeader 
          title={state.label.toUpperCase()} 
          description={`Five missions within this gate. Each mission increases in difficulty. Complete all to advance.`}
       >
          <div className="flex flex-col items-center gap-6">
             <div className="flex items-center gap-12">
                <div className="flex flex-col items-center">
                   <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gate Progress</div>
                   <div className="text-3xl font-black">{prog.solved}/{prog.total}</div>
                </div>
                <div className="w-px h-12 bg-black/10" />
                <div className="flex flex-col items-center">
                   <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</div>
                   <div className={`text-xl font-black ${complete ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {complete ? 'CLEARED' : 'IN PROGRESS'}
                   </div>
                </div>
             </div>
             <div className="w-full max-w-md h-4 bg-gray-100 neo-border relative overflow-hidden">
                <div className="h-full bg-black transition-all duration-1000" style={{ width: `${pct}%` }} />
             </div>
          </div>
       </PageHeader>

      <div className="container">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 mb-12">
          <button className="neo-btn btn-sm" onClick={() => navigate('/map')}>WORLD MAP</button>
          <span className="font-black text-gray-400">/</span>
          <button className="neo-btn btn-sm" onClick={() => navigate(`/map/${regionId}`)}>{region.name.toUpperCase()}</button>
          <span className="font-black text-gray-400">/</span>
          <span className="font-black text-xs uppercase tracking-widest py-2 px-4 bg-black text-white neo-border">{state.name}</span>
        </div>

        {/* Problem list */}
        <div className="problem-list space-y-6 animate-fadeIn">
          {problems.map((problem, idx) => {
            const solved = !!progress.solvedProblems[problem.id];
            const diff = DIFF_ORDER[idx];
            const diffClass = diff.toLowerCase().replace(/[^a-z]/g, '');

            return (
              <div
                key={problem.id}
                className={`problem-row bg-white neo-border neo-shadow p-8 flex items-center gap-8 cursor-pointer hover:-translate-y-1 transition-all ${solved ? 'bg-emerald-50/30' : ''}`}
                onClick={() => navigate(`/problem/${problem.id}`)}
              >
                <div className="text-5xl font-black text-gray-100 group-hover:text-black transition-colors w-16">{idx + 1}</div>

                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-2xl font-black uppercase tracking-tight">{problem.title}</h3>
                       {solved && <CheckCircle2 size={24} className="text-emerald-500" />}
                   </div>
                   <p className="text-sm text-gray-500 font-bold uppercase tracking-tight line-clamp-1">{problem.mission.split('\n')[0].trim()}</p>
                </div>

                <div className="flex items-center gap-8">
                   <span className={`px-4 py-2 neo-border font-black text-xs uppercase ${diffClass === 'easy' ? 'bg-blue-100 text-blue-700' : diffClass === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {diff}
                   </span>
                   <ChevronRight size={24} className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

