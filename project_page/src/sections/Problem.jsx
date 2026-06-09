import Reveal from '../components/Reveal.jsx';

export default function Problem() {
  return (
    <section className="section" aria-label="Research problem">
      <div className="container">
        <div className="split">
          <Reveal>
            <div>
              <span className="kicker">Research Problem</span>
              <h2>Autonomous research needs a durable research state.</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="text-block">
            <p>
              Arbor studies <strong style={{ color: 'var(--ink)' }}>Autonomous Optimization</strong>:
              an agent receives an initial artifact, an objective, a development evaluator, and a
              held-out evaluator, then improves the artifact through iterative experimentation
              without step-level supervision.
            </p>

            <div className="eqn" role="img" aria-label="P equals tuple of M-zero, O, E-dev, E-test">
              <div className="eqn-line">
                <span className="v">P</span>
                <span className="op">=</span>
                <span className="par">(</span>
                <span className="v">M<sub>0</sub></span><span className="sep">,</span>
                <span className="v">O</span><span className="sep">,</span>
                <span className="v">E<sub>dev</sub></span><span className="sep">,</span>
                <span className="v">E<sub>test</sub></span>
                <span className="par">)</span>
              </div>
              <div className="eqn-legend">
                <div className="eqn-term"><span className="sym">M<sub>0</sub></span><span className="desc">initial artifact</span></div>
                <div className="eqn-term"><span className="sym">O</span><span className="desc">objective</span></div>
                <div className="eqn-term"><span className="sym">E<sub>dev</sub></span><span className="desc">development evaluator</span></div>
                <div className="eqn-term"><span className="sym">E<sub>test</sub></span><span className="desc">held-out evaluator</span></div>
              </div>
            </div>

            <p>
              The hard part is not merely running longer. The system must preserve what was tried,
              what failed, what transferred, and which branch deserves the next experiment.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
