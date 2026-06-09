import SpotlightCard from '../bits/SpotlightCard.jsx';
import Reveal from '../components/Reveal.jsx';

// Held-out (test) accuracy on BrowseComp — matches the paper's main results table.
const AXIS_MAX = 80;
const BARS = [
  { name: 'Initial', val: 45.33 },
  { name: 'Codex', val: 50.0 },
  { name: 'Claude Code', val: 53.33 },
  { name: 'Arbor', val: 67.67, win: true, gain: '+22.34' },
];

const FINDINGS = [
  {
    n: '01',
    t: 'Candidate coverage was the bottleneck',
    d: 'When all independent trajectories missed the entity, ordinary judging could not recover it.',
  },
  {
    n: '02',
    t: 'Prompt-only control regressed',
    d: 'Structured belief tables, decomposition, and persona-diversified agents spent budget without widening useful evidence.',
  },
  {
    n: '03',
    t: 'Override authority broke the ceiling',
    d: 'A judge allowed to search beyond the candidate set, under constraint-PASS gating, lifted held-out accuracy.',
  },
];

export default function CaseStudy() {
  return (
    <section className="section" id="case" aria-label="BrowseComp run">
      <div className="container-wide">
        <Reveal>
          <div className="section-head">
            <span className="kicker">Case Study · BrowseComp</span>
            <h2>From correlated search failures to a tool-empowered judge.</h2>
            <p className="lead">
              Arbor explored prompt-only belief-state fixes, adversarial falsification, retrieval
              enumeration, and cross-trajectory ensembling before merging a judge-with-override
              design — lifting held-out accuracy well past strong single-agent baselines.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="bc-panel">
            <div className="bc-head">
              <span className="bc-title">Held-out accuracy</span>
              <span className="bc-sub">BrowseComp · higher is better</span>
            </div>
            <div className="bc-chart">
              {BARS.map((b) => (
                <div className={`bc-row${b.win ? ' win' : ''}`} key={b.name}>
                  <span className="bc-name">{b.name}</span>
                  <span className="bc-track">
                    <span className="bc-fill" style={{ width: `${(b.val / AXIS_MAX) * 100}%` }} />
                  </span>
                  <span className="bc-val">
                    {b.val.toFixed(2)}
                    {b.gain && <span className="bc-gain">{b.gain}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="case-explore">
            <span className="case-explore-meta">
              Explore a full BrowseComp run — node scores, merge decisions, and per-experiment
              evidence preserved end to end.
            </span>
            <span className="case-explore-links">
              <a className="case-link" href="assets/demo/browsecomp/dashboard.html" target="_blank" rel="noreferrer">
                Open dashboard <span aria-hidden="true">↗</span>
              </a>
              <a className="case-link" href="assets/demo/browsecomp/idea_tree.html" target="_blank" rel="noreferrer">
                Open idea tree <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="findings">
            {FINDINGS.map((f) => (
              <SpotlightCard key={f.n} className="tile finding" spotlightColor="rgba(70, 224, 196, 0.16)">
                <span className="finding-num">{f.n}</span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </SpotlightCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
