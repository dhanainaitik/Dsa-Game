import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { LOGIC_LAB_TOPICS } from '../../data/logiclab';
import PageHeader from '../../components/UI/PageHeader';
import './LogicLab.css';

const STEPS = ['See', 'Touch', 'Experiment', 'Understand', 'Code'];

export default function LogicLab() {
  const navigate = useNavigate();

  return (
    <div className="page logic-lab-home animate-fadeIn" style={{ backgroundColor: 'var(--neo-beige)', paddingBottom: 100 }}>
      <PageHeader 
        title="THE LOGIC LAB" 
        description="Visual-first, interactive DSA learning. See a concept, touch it, experiment, then understand it. Code comes last."
      />

      <div className="container">
        {/* Step flow legend */}
        <div className="lab-flow-strip mb-16">
          {STEPS.map((step, i) => (
            <div key={step} className="lab-flow-step">
              <div className="lab-flow-num neo-border">{i + 1}</div>
              <span className="lab-flow-label">{step}</span>
              {i < STEPS.length - 1 && <div className="lab-flow-arrow">→</div>}
            </div>
          ))}
        </div>

        {/* Topics grid */}
        <div className="lab-topics-grid stagger-children">
          {LOGIC_LAB_TOPICS.map(topic => (
            <div
              key={topic.id}
              className="lab-topic-card animate-fadeIn bg-white neo-border neo-shadow cursor-pointer hover:-translate-y-1 transition-all p-6 flex items-center gap-6"
              onClick={() => navigate(`/logic-lab/${topic.id}`)}
              style={{ '--topic-color': topic.color }}
            >
              <div
                className="lab-topic-icon neo-border"
                style={{
                  background: `color-mix(in srgb, ${topic.color} 10%, #fff)`,
                  color: topic.color,
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 900
                }}
              >
                {topic.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black">{topic.name}</h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-tight">{topic.tagline}</p>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
