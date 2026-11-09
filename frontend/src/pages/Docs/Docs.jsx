import { useState } from 'react';
import { BookOpen, Map, Target, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import './Docs.css';

const SECTIONS = [
  {
    id: 'player-guide',
    icon: BookOpen,
    title: 'Player Guide',
    content: [
      {
        heading: 'What is Codo Leveling?',
        body: `Codo Leveling is a structured DSA learning and practice environment. It is not a coding contest platform. It is a place to genuinely understand Data Structures and Algorithms — visually, interactively, and progressively.`,
      },
      {
        heading: 'How to use the Logic Lab',
        body: `The Logic Lab follows a strict 5-step flow for every topic:
1. SEE — Observe the data structure rendered visually.
2. TOUCH — Interact with elements directly.
3. EXPERIMENT — Try things freely in a safe environment.
4. UNDERSTAND — Concept is introduced in words.
5. CODE — Implementation and syntax are revealed last.`,
      },
      {
        heading: 'How the Practice System works',
        body: `Start at the World Map. Each region represents one DSA topic. Click a region to enter it. Inside, you'll find States — each state is a sealed gate with 5 problems. Complete all 5 to advance.`,
      },
    ],
  },
  {
    id: 'topic-guide',
    icon: Target,
    title: 'Topic Notes',
    content: [
      {
        heading: 'Arrays',
        body: `Time: O(1) access, O(n) search/insert/delete. Space: O(n). Patterns: Two Pointers, Sliding Window, Prefix Sums.`,
      },
      {
        heading: 'Linked Lists',
        body: `Time: O(n) access, O(1) insert/delete at known position. Space: O(n). Patterns: Fast/Slow Pointers, Dummy Head Node.`,
      },
      {
        heading: 'Trees',
        body: `Time: O(log n) BST operations (balanced), O(n) traversal. Patterns: DFS, BFS, Divide and Conquer.`,
      },
    ],
  },
  {
    id: 'platform',
    icon: Map,
    title: 'Platform Guide',
    content: [
      {
        heading: 'World Map',
        body: `The main navigation hub. Geographical regions represent DSA concepts like Arrays, Strings, etc.`,
      },
      {
        heading: 'States (Gates)',
        body: `Each region contains States. Each state has 5 problems with a smooth difficulty ramp.`,
      },
       {
        heading: 'Logic Lab',
        body: `The educational core. Use it to build intuition before tackling map problems.`,
      },
    ],
  },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('player-guide');
  const [openHeading, setOpenHeading] = useState(null);
  const section = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="page docs-page animate-fadeIn" style={{ backgroundColor: 'var(--neo-beige)', paddingBottom: 100 }}>
      <PageHeader 
        title="THE CODEX" 
        description="The ultimate repository of knowledge for modern ascendants. Learn the rules of the system before you break them."
      />

      <div className="container">
        <div className="docs-layout grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="docs-sidebar space-y-4">
            {SECTIONS.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  className={`w-full flex items-center gap-4 px-6 py-4 neo-border font-black text-sm uppercase transition-all ${activeSection === sec.id ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => { setActiveSection(sec.id); setOpenHeading(null); }}
                >
                  <Icon size={18} />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {section?.content.map((item, i) => (
              <div key={i} className="docs-section bg-white neo-border neo-shadow">
                <button
                  className="w-full text-left p-8 flex items-center justify-between group"
                  onClick={() => setOpenHeading(openHeading === i ? null : i)}
                >
                  <h3 className="text-2xl font-black uppercase tracking-tight">{item.heading}</h3>
                  <ChevronRight
                    size={24}
                    className={`transition-transform duration-200 ${openHeading === i ? 'rotate-90' : 'text-gray-300'}`}
                  />
                </button>

                {(openHeading === i || openHeading === null) && (
                  <div className="px-8 pb-8 animate-fadeIn">
                    <div className="h-px bg-black/5 mb-8" />
                    {item.body.split('\n').map((line, j) => (
                      line.trim()
                        ? <p key={j} className="text-gray-600 font-medium leading-relaxed mb-4">{line.trim()}</p>
                        : <div key={j} className="h-4" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
