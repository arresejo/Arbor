import Counter from '../components/Counter.jsx';
import Reveal from '../components/Reveal.jsx';

// Held-out (test) metrics from the paper's main results table.
const ROWS = [
  { task: 'Optimizer Design', dir: 'steps ↓', init: '3325', codex: '3325', claude: '3287.5', arbor: '3237.5', gain: 2.63, dec: 2, suf: '%' },
  { task: 'Architecture Design', dir: 'loss ↓', init: '1.098', codex: '1.083', claude: '1.033', arbor: '1.028', gain: 6.38, dec: 2, suf: '%' },
  { task: 'Terminal-Bench 2.0', dir: 'pass ↑', init: '69.81', codex: '73.59', claude: '71.70', arbor: '77.36', gain: 7.55, dec: 2, suf: '' },
  { task: 'BrowseComp', dir: 'acc ↑', init: '45.33', codex: '50.00', claude: '53.33', arbor: '67.67', gain: 22.34, dec: 2, suf: '' },
  { task: 'Search-Agent Data', dir: 'gap ↑', init: '5.00', codex: '9.00', claude: '12.00', arbor: '18.00', gain: 13.0, dec: 2, suf: '' },
  { task: 'Math-Reasoning Data', dir: 'gap ↑', init: '1.04', codex: '6.25', claude: '8.33', arbor: '20.83', gain: 19.79, dec: 2, suf: '' },
];

const MLE = [
  { v: 100.0, suf: '%', l: 'valid submissions' },
  { v: 95.45, suf: '%', l: 'above median' },
  { v: 77.27, suf: '%', l: 'gold medal', gold: true },
  { v: 86.36, suf: '%', l: 'any medal', gold: true },
];

export default function Results() {
  return (
    <section className="band band-deep" id="results" aria-label="Results">
      <div className="container-wide">
        <Reveal>
          <div className="section-head">
            <span className="kicker">Results</span>
            <h2>Best held-out results on every task.</h2>
            <p className="lead">
              One controller across model training, harness engineering, and data synthesis — only
              the material, objective, evaluator, and budget change. Arbor wins the held-out test on
              all six tasks against strong single-agent baselines.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="table-wrap">
            <table className="result-table results-main">
              <thead>
                <tr>
                  <th>Task <span className="th-sub">held-out test</span></th>
                  <th>Initial</th>
                  <th>Codex</th>
                  <th>Claude Code</th>
                  <th className="col-arbor">Arbor</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.task}>
                    <td>
                      {r.task}
                      <span className="td-dir">{r.dir}</span>
                    </td>
                    <td className="num">{r.init}</td>
                    <td className="num">{r.codex}</td>
                    <td className="num">{r.claude}</td>
                    <td className="num col-arbor">{r.arbor}</td>
                    <td className="gain">
                      +<Counter to={r.gain} decimals={r.dec} duration={1.4} />
                      {r.suf}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mle-band">
            <div className="mle-head">
              <span className="panel-kicker">MLE-Bench Lite · GPT-5.5</span>
              <p>
                Best Any-Medal rate in our comparison — ahead of the next-best system at 81.82%,
                under the official benchmark protocol.
              </p>
            </div>
            <div className="mle-stats">
              {MLE.map((m) => (
                <div className={`mle-stat${m.gold ? ' gold' : ''}`} key={m.l}>
                  <div className="v">
                    <Counter to={m.v} decimals={2} duration={1.5} />
                    {m.suf}
                  </div>
                  <div className="l">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <figure className="figure">
            <div className="figure-canvas">
              <img src="assets/images/fig-overview.png" alt="Arbor overview and normalized held-out gains" />
            </div>
            <figcaption>
              A live hypothesis tree, development trajectory, and normalized held-out gains across
              all tasks.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
