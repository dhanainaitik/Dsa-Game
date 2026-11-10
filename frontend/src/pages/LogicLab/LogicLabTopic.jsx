import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { getLabTopic } from '../../data/logiclab';
import { getHintsForQuestion } from '../../data/hints';
import { useProgress } from '../../context/ProgressContext';
import { triggerGoblinDefeatEffects } from '../../utils/goblinEffects';
import HintButton from '../../components/Hint/HintButton';
import HintPanel from '../../components/Hint/HintPanel';
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
  const { awardProblemCoins, isProblemRewarded } = useProgress();

  const [stepIdx, setStepIdx] = useState(0);
  const [challengeCode, setChallengeCode] = useState(topic?.challenge?.starterCode || '');
  const [challengeResult, setChallengeResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);

  // Reset hint state and code when navigating to a different topic
  useEffect(() => {
    setShowHint(false);
    setHintLevel(1);
    setChallengeCode(topic?.challenge?.starterCode || '');
    setChallengeResult(null);
  }, [topicId]);

  if (!topic) return (
    <div className="page"><div className="container page-content"><p>Topic not found.</p></div></div>
  );

  const Visualizer = VISUALIZERS[topicId];
  const currentStep = STEPS[stepIdx];

  // Dry Run: Tests sample case or checks syntax — DOES NOT AWARD COINS
  const runChallenge = () => {
    try {
      const fnName = topic?.challenge?.fnName || topic?.challenge?.starterCode?.match(/function\s+(\w+)/)?.[1] || 'solve';
      // eslint-disable-next-line no-new-func
      const runner = new Function(challengeCode + `\nreturn ${fnName};`);
      const userFn = runner();
      if (typeof userFn !== 'function') {
        throw new Error(`Function "${fnName}" is not defined.`);
      }

      const sampleCase = topic?.challenge?.testCases?.[0];
      if (sampleCase) {
        const args = Array.isArray(sampleCase.input) ? sampleCase.input : [sampleCase.input];
        const actual = userFn(...JSON.parse(JSON.stringify(args)));
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(sampleCase.expected);

        if (actualStr === expectedStr || actual === sampleCase.expected) {
          setChallengeResult({
            success: true,
            msg: `✓ Dry run passed on sample test case! Click "Submit Solution" to test all cases and claim +20 coins.`,
          });
        } else {
          setChallengeResult({
            success: false,
            msg: `Dry run failed on sample case: Expected ${expectedStr}, got ${actualStr}`,
          });
        }
      } else {
        setChallengeResult({
          success: true,
          msg: 'Code executed without errors. Click "Submit Solution" to verify and earn coins.',
        });
      }
    } catch (e) {
      setChallengeResult({ success: false, msg: `Execution Error: ${e.message}` });
    }
  };

  // Authoritative Submission: Validates all test cases & awards +20 coins for first-time solve
  const submitChallenge = () => {
    setIsSubmitting(true);
    try {
      const fnName = topic?.challenge?.fnName || topic?.challenge?.starterCode?.match(/function\s+(\w+)/)?.[1] || 'solve';
      // eslint-disable-next-line no-new-func
      const runner = new Function(challengeCode + `\nreturn ${fnName};`);
      const userFn = runner();
      if (typeof userFn !== 'function') {
        throw new Error(`Function "${fnName}" was not found or is not a function.`);
      }

      const testCases = topic?.challenge?.testCases || [];
      let passedCount = 0;
      let firstFailure = null;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const args = Array.isArray(tc.input) ? tc.input : [tc.input];
        const actual = userFn(...JSON.parse(JSON.stringify(args)));
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(tc.expected);

        if (actualStr === expectedStr || actual === tc.expected) {
          passedCount++;
        } else if (!firstFailure) {
          firstFailure = `Test #${i + 1} Failed: Expected ${expectedStr}, got ${actualStr}`;
        }
      }

      const allPassed = testCases.length > 0 && passedCount === testCases.length;

      if (allPassed) {
        const problemKey = `logiclab-${topicId}`;
        const alreadyClaimed = isProblemRewarded(problemKey);
        const rewardRes = awardProblemCoins(problemKey, {
          problemTitle: `${topic.name}: ${topic.challenge.title}`,
          section: 'Logic Lab',
        });

        if (rewardRes.success) {
          setChallengeResult({
            success: true,
            msg: `🎉 All ${testCases.length} test cases passed! +20 COINS EARNED!`,
          });
        } else if (alreadyClaimed || rewardRes.reason === 'already_rewarded') {
          setChallengeResult({
            success: true,
            msg: `✓ All ${testCases.length} test cases passed! (Reward already claimed for this problem)`,
          });
        } else {
          setChallengeResult({
            success: true,
            msg: `✓ All ${testCases.length} test cases passed!`,
          });
        }
      } else {
        triggerGoblinDefeatEffects({ targetSelector: '.lab-topic-page' });
        setChallengeResult({
          success: false,
          msg: `Tests failed (${passedCount}/${testCases.length} passed). ${firstFailure || ''}`,
        });
      }
    } catch (e) {
      triggerGoblinDefeatEffects({ targetSelector: '.lab-topic-page' });
      setChallengeResult({ success: false, msg: `Runtime Error: ${e.message}` });
    } finally {
      setIsSubmitting(false);
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

                {/* Actions: [ RUN CODE ] [ SUBMIT SOLUTION ] [ SHOW SOLUTION ] [ HINT ] */}
                <div className="lab-challenge-actions-row">
                  <button className="btn btn-outline btn-sm" onClick={runChallenge}>
                    Run Code
                  </button>
                  <button
                    className="btn btn-primary btn-sm lab-submit-btn"
                    onClick={submitChallenge}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setChallengeCode(topic.challenge.solution)}
                  >
                    Show Solution
                  </button>
                  <HintButton
                    isOpen={showHint}
                    onClick={() => setShowHint(v => !v)}
                  />
                </div>

                {/* Progressive Hint Panel */}
                {showHint && (
                  <HintPanel
                    hints={getHintsForQuestion(topicId)?.hints || getHintsForQuestion(topic?.challenge?.title)?.hints || []}
                    hintLevel={hintLevel}
                    onNextLevel={() => setHintLevel(lvl => Math.min(3, lvl + 1))}
                    onPrevLevel={() => setHintLevel(lvl => Math.max(1, lvl - 1))}
                    onClose={() => setShowHint(false)}
                    questionTitle={topic?.challenge?.title || topic?.name}
                  />
                )}

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
