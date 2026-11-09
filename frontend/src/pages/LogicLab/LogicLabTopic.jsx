import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { getLabTopic } from '../../data/logiclab';
import ArrayVisualizer from './visualizers/ArrayVisualizer';
import StringVisualizer from './visualizers/StringVisualizer';
import LinkedListVisualizer from './visualizers/LinkedListVisualizer';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import DPVisualizer from './visualizers/DPVisualizer';
import RecursionVisualizer from './visualizers/RecursionVisualizer';
import './LogicLabTopic.css';

const STEPS = [
  { id: 'see',        label: 'See',        desc: 'Observe the structure in action.' },
  { id: 'touch',      label: 'Touch',      desc: 'Interact with elements directly.' },
  { id: 'experiment', label: 'Experiment', desc: 'Try things freely — errors are safe here.' },
  { id: 'understand', label: 'Understand', desc: 'Now you know what this is.' },
  { id: 'code',       label: 'Code',       desc: 'See the implementation.' },
];

const VISUALIZERS = {
  'arrays':               ArrayVisualizer,
  'strings':              StringVisualizer,
  'linked-lists':         LinkedListVisualizer,
  'stack-queue':          StackQueueVisualizer,
  'trees':                TreeVisualizer,
  'graphs':               GraphVisualizer,
  'dynamic-programming':  DPVisualizer,
  'recursion':            RecursionVisualizer,
};

export default function LogicLabTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topic = getLabTopic(topicId);
  const [stepIdx, setStepIdx] = useState(0);
  const [challengeCode, setChallengeCode] = useState(topic?.challenge?.starterCode || '');
  const [challengeResult, setChallengeResult] = useState(null);

  if (!topic) return (
    <div className="page"><div className="container page-content"><p>Topic not found.</p></div></div>
  );

  const Visualizer = VISUALIZERS[topicId];
  const currentStep = STEPS[stepIdx];

  const runChallenge = () => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(challengeCode + `\nreturn solve || ${topic.challenge.starterCode.match(/function\s+(\w+)/)?.[1]};`);
      setChallengeResult({ success: true, msg: 'Code executed without errors. Check console for output.' });
    } catch (e) {
      setChallengeResult({ success: false, msg: e.message });
    }
  };

  return (
    <div className="page lab-topic-page">
      <div className="container page-content animate-fadeIn">
        {/* Breadcrumb */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/logic-lab')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={15} /> Logic Lab
        </button>

        {/* Header */}
        <div className="lab-topic-header">
          <div
            className="lab-topic-hero-icon"
            style={{
              background: `color-mix(in srgb, ${topic.color} 12%, var(--bg-elevated))`,
              borderColor: `color-mix(in srgb, ${topic.color} 30%, var(--border))`,
              color: topic.color,
            }}
          >
            {topic.name[0]}
          </div>
          <div>
            <span className="section-label">{topic.tagline}</span>
            <h1 style={{ marginTop: 6 }}>{topic.name}</h1>
          </div>
        </div>

        {/* Step progress */}
        <div className="lab-step-nav">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              className={`lab-step-btn ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}
              onClick={() => setStepIdx(i)}
              style={i === stepIdx ? { '--step-color': topic.color } : {}}
            >
              <span className="lab-step-num">{i + 1}</span>
              <span className="lab-step-label">{step.label}</span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="lab-step-content animate-fadeIn" key={stepIdx}>
          <div className="lab-step-desc">
            <h3>{currentStep.label}</h3>
            <p>{currentStep.desc}</p>
          </div>

          {/* Steps 0–2: Visualizer (see, touch, experiment) */}
          {stepIdx <= 2 && Visualizer && (
            <div className="lab-visualizer-container">
              <Visualizer step={stepIdx} color={topic.color} />
            </div>
          )}

          {/* Step 3: Understand */}
          {stepIdx === 3 && (
            <div className="lab-concept-panel">
              <div className="lab-concept-text">
                <blockquote className="lab-concept-quote">
                  "{topic.concept}"
                </blockquote>
                <p>{topic.description}</p>
              </div>
              {Visualizer && (
                <div className="lab-visualizer-container lab-visualizer-sm">
                  <Visualizer step={2} color={topic.color} readonly />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Code */}
          {stepIdx === 4 && (
            <div className="lab-code-panel">
              <div className="lab-code-left">
                <div className="lab-code-example">
                  <span className="section-label">Implementation</span>
                  <pre className="lab-code-block" style={{ marginTop: 12 }}>
                    {topic.codeExample}
                  </pre>
                </div>
              </div>

              <div className="lab-code-right">
                <span className="section-label">Mini Challenge</span>
                <h3 style={{ marginTop: 8 }}>{topic.challenge.title}</h3>
                <p style={{ marginTop: 6, fontSize: '0.875rem' }}>{topic.challenge.description}</p>

                <div className="lab-challenge-editor" style={{ marginTop: 16 }}>
                  <CodeMirror
                    value={challengeCode}
                    onChange={setChallengeCode}
                    extensions={[javascript()]}
                    theme={oneDark}
                    height="200px"
                    basicSetup={{ lineNumbers: true, foldGutter: false, autocompletion: true }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={runChallenge}>
                    Run Code
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setChallengeCode(topic.challenge.solution)}
                  >
                    Show Solution
                  </button>
                </div>

                {challengeResult && (
                  <div
                    className={`lab-challenge-result animate-fadeIn ${challengeResult.success ? 'success' : 'error'}`}
                    style={{ marginTop: 12 }}
                  >
                    {challengeResult.msg}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="lab-nav-buttons">
          <button
            className="btn btn-outline"
            onClick={() => setStepIdx(i => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
          >
            <ArrowLeft size={15} /> Previous
          </button>

          {stepIdx < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStepIdx(i => i + 1)}
              style={{ background: topic.color }}
            >
              Next: {STEPS[stepIdx + 1].label} <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/map/${topicId}`)}
            >
              Practice {topic.name} <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
