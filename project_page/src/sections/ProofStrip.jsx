import Counter from '../components/Counter.jsx';
import Reveal from '../components/Reveal.jsx';

const STATS = [
  { to: 6, decimals: 0, suffix: ' / 6', label: 'best held-out results across real AO tasks' },
  { to: 2.5, decimals: 1, suffix: 'x', label: 'average relative held-out gain over Codex / Claude Code' },
  { to: 86.36, decimals: 2, suffix: '%', label: 'Any Medal on MLE-Bench Lite with GPT-5.5' },
];

export default function ProofStrip() {
  return (
    <section className="proof" aria-label="Headline results">
      <div className="container">
        <Reveal distance={24}>
          <div className="proof-grid">
            {STATS.map((s) => (
              <div className="proof-cell" key={s.label}>
                <div className="proof-value">
                  <Counter to={s.to} decimals={s.decimals} duration={1.6} />
                  <span className="suffix">{s.suffix}</span>
                </div>
                <p className="proof-label">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
