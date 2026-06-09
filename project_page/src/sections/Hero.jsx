import Threads from '../bits/Threads.jsx';
import Magnet from '../bits/Magnet.jsx';
import Reveal from '../components/Reveal.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { useReducedMotion } from '../components/useReducedMotion';
import { IconPaper, IconGithub, IconPlay } from '../components/icons.jsx';

export default function Hero() {
  const reduced = useReducedMotion();
  const wm = `url(${import.meta.env.BASE_URL}assets/images/arbor-wordmark.png)`;

  return (
    <section className="hero" id="top">
      <div className="hero-threads" aria-hidden="true">
        {!reduced && (
          <ErrorBoundary>
            <Threads color={[0.27, 0.88, 0.77]} amplitude={1.6} distance={0.4} enableMouseInteraction />
          </ErrorBoundary>
        )}
      </div>

      <div className="hero-inner">
        <span className="hero-eyebrow">
          <span className="dot" /> Autonomous Research System
        </span>

        <h1 className="hero-wordmark" aria-label="Arbor">
          <span
            className="wordmark-mask"
            role="img"
            aria-hidden="true"
            style={{ WebkitMaskImage: wm, maskImage: wm }}
          />
        </h1>

        <Reveal delay={0.15} distance={26}>
          <p className="hero-title">
            Toward Generalist Autonomous Research via{' '}
            <span className="grad-text">Hypothesis-Tree Refinement</span>
          </p>
        </Reveal>

        <Reveal delay={0.25} distance={20}>
          <p className="hero-desc">
            Arbor turns long-horizon AI research from isolated attempts into a cumulative
            process: hypotheses branch, experiments return evidence, insights propagate, and
            only held-out improvements are promoted.
          </p>
        </Reveal>

        <Reveal delay={0.32} distance={18}>
          <div className="hero-actions">
            <Magnet padding={70} magnetStrength={4}>
              <a className="btn btn-primary" href="assets/paper/arbor.pdf" target="_blank" rel="noreferrer">
                <IconPaper /> Read Paper
              </a>
            </Magnet>
            <Magnet padding={70} magnetStrength={4}>
              <a className="btn" href="https://github.com/RUC-NLPIR/Arbor" target="_blank" rel="noreferrer">
                <IconGithub /> GitHub
              </a>
            </Magnet>
            <Magnet padding={70} magnetStrength={4}>
              <a className="btn" href="#demo">
                <IconPlay /> Live Demo
              </a>
            </Magnet>
          </div>
        </Reveal>

        <Reveal delay={0.42} distance={14}>
          <div className="hero-authors">
            Jiajie Jin<sup>1,†,‡</sup>, Yuyang Hu<sup>1,†</sup>, Kai Qiu<sup>2</sup>,
            Qi Dai<sup>2</sup>, Chong Luo<sup>2</sup>, Guanting Dong<sup>1</sup>,
            Xiaoxi Li<sup>1</sup>, Tong Zhao<sup>1</sup>, Xiaolong Ma<sup>2</sup>,
            Gongrui Zhang<sup>2</sup>, Zhirong Wu<sup>2</sup>, Bei Liu<sup>2</sup>,
            Zhengyuan Yang<sup>2</sup>, Linjie Li<sup>2</sup>, Lijuan Wang<sup>2</sup>,
            Hongjin Qian<sup>1</sup>, Yutao Zhu<sup>1</sup>, Zhicheng Dou<sup>1,*</sup>
          </div>
          <div className="hero-affil">
            <sup>1</sup> Gaoling School of Artificial Intelligence, Renmin University of China
            <span className="sep" />
            <sup>2</sup> Microsoft Research
          </div>
          <div className="hero-note">
            <sup>†</sup> Equal contribution
            <span className="sep" />
            <sup>‡</sup> Work done during an internship at MSRA
            <span className="sep" />
            <sup>*</sup> Corresponding author
          </div>
          <div className="author-compact">
            Jiajie Jin, Yuyang Hu, Kai Qiu, Qi Dai, Chong Luo, et al. · Renmin University of
            China · Microsoft Research
          </div>
        </Reveal>
      </div>
    </section>
  );
}
