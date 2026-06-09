import SpotlightCard from '../bits/SpotlightCard.jsx';
import Reveal from '../components/Reveal.jsx';

const ITEMS = [
  {
    n: '01',
    t: 'Branching keeps options alive',
    d: 'Competing hypotheses stay open instead of collapsing exploration into a single trajectory.',
  },
  {
    n: '02',
    t: 'Insights become memory',
    d: 'Structured insights preserve failure causes, applicability conditions, and local discoveries across long horizons.',
  },
  {
    n: '03',
    t: 'Held-out merge gates',
    d: 'Verified merges separate exploratory dev feedback from real artifact improvement.',
  },
];

export default function WhyItMatters() {
  return (
    <section className="section" aria-label="Why it matters">
      <div className="container">
        <div className="split">
          <Reveal>
            <div>
              <span className="kicker">Why It Matters</span>
              <h2>Research state becomes a reusable asset.</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="why-list">
              {ITEMS.map((i) => (
                <SpotlightCard key={i.n} className="tile" spotlightColor="rgba(110, 168, 255, 0.16)">
                  <span className="why-num">{i.n}</span>
                  <div>
                    <h3>{i.t}</h3>
                    <p>{i.d}</p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
