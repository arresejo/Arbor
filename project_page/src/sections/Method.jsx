import SpotlightCard from '../bits/SpotlightCard.jsx';
import Reveal from '../components/Reveal.jsx';

const STEPS = [
  { n: '01', t: 'Observe', d: 'Re-ground in the tree — read the active frontier, recent evidence, ancestor insights, and the current best artifact.' },
  { n: '02', t: 'Ideate', d: 'Propose child hypotheses under a chosen parent, conditioned on validated insights and pruned-node constraints.' },
  { n: '03', t: 'Select', d: 'Choose which pending nodes to run next — frontier control under partial, delayed feedback.' },
  { n: '04', t: 'Dispatch', d: 'Run selected hypotheses in isolated worktrees; each executor evaluates on the dev evaluator and returns a compact report.' },
  { n: '05', t: 'Backpropagate', d: 'Write evidence into leaf nodes and lift causal lessons up the path to the root.' },
  { n: '06', t: 'Decide', d: 'Continue, prune, stop, or merge — promoting only what passes the held-out merge gate.' },
];

export default function Method() {
  return (
    <section className="section" id="method" aria-label="Method">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="kicker">Method</span>
            <h2>Hypothesis-Tree Refinement</h2>
            <p className="lead">
              A long-lived coordinator owns the hypothesis tree and runs a six-step loop; short-lived
              executors test individual nodes in clean worktrees and return structured evidence.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="process-grid six">
            {STEPS.map((s) => (
              <SpotlightCard key={s.n} className="tile process-step" spotlightColor="rgba(70, 224, 196, 0.16)">
                <span className="step-num">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </SpotlightCard>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="container-wide">
          <figure className="figure framework-figure">
            <div className="figure-canvas">
              <img src="assets/images/fig-framework.png" alt="Overall framework of Arbor" />
            </div>
            <figcaption>
              The tree is search space, long-term memory, branch-level audit trail, and merge policy
              for verified artifact improvement.
            </figcaption>
          </figure>
        </div>
      </Reveal>
    </section>
  );
}
