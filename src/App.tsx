"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  size: number;
  seed: number;
};

const chapters = [
  {
    label: "Runtime / UCLA PSS Lab",
    title: "Cold starts should not feel cold.",
    metric: "337 → 125 ms",
    metricLabel: "first-request latency",
    story:
      "Bursty serverless workloads throw away the runtime knowledge they just paid to learn. I research how profile and compilation artifacts can survive across cold starts—turning a blank process into one that remembers.",
    proof: [
      "2.7× faster first request in controlled OpenFaaS benchmarks",
      "Redis-backed compilation caching traced with gdb",
      "31.6% lower startup compile/load time",
    ],
    link: "https://github.com/MK-523/hivejit-openfaas",
    linkLabel: "Open the runtime experiments",
    mode: "FORGE / CACHE / REUSE",
  },
  {
    label: "Decision Systems / Flex",
    title: "Every decision should explain itself.",
    metric: "<5 min",
    metricLabel: "from 30–60 minute reviews",
    story:
      "Financial risk logic is only useful when engineers and operators can follow it. At Flex, I turned dense underwriting paths into inspectable decision traces—so the route from an applicant input to an outcome became visible.",
    proof: [
      "Python and TypeScript underwriting workflows",
      "Interactive ReactFlow decision traces",
      "Type-safe rulebooks built for testing and auditability",
    ],
    mode: "TRACE / EXPLAIN / DECIDE",
  },
  {
    label: "Competitive Intelligence / ChessStalker",
    title: "Preparation at grandmaster scale.",
    metric: "11M+",
    metricLabel: "official games indexed",
    story:
      "Before a serious chess game, the opponent is a dataset. ChessStalker brings Lichess, Chess.com, and FIDE histories into one search surface, then turns millions of games into concrete Stockfish-backed preparation.",
    proof: [
      "Used by Hikaru Nakamura and competitive players",
      "100K+ combined online and FIDE analyses",
      "Search, identity resolution, and engine analysis in one product",
    ],
    link: "https://chessstalker.com/",
    linkLabel: "Enter ChessStalker",
    mode: "SEARCH / PREPARE / PLAY",
  },
  {
    label: "Machine Perception / A-Eye",
    title: "Turn a camera feed into a safer next step.",
    metric: "1 / 76",
    metricLabel: "LA Hacks track winner",
    story:
      "A-Eye converts a wearable camera stream into priority-aware spoken guidance for blind and low-vision users. I co-created it with Arya Kunisetty, Krishay Garg, and Hui-Peng-John-Yao at LA Hacks 2026.",
    proof: [
      "YOLOv8 and ByteTrack obstacle tracking",
      "Surface segmentation and route-aware guidance",
      "MLH Best Use of ElevenLabs winner",
    ],
    link: "https://devpost.com/software/a-eye-pk9sdw",
    linkLabel: "See the winning build",
    mode: "PERCEIVE / PRIORITIZE / GUIDE",
  },
  {
    label: "Network Experiments / UC Santa Barbara",
    title: "Packets reveal the system underneath.",
    metric: "10K+",
    metricLabel: "packet samples analyzed",
    story:
      "I studied how adaptive bitrate strategies behave when throughput and latency stop being friendly. Three years of network experiments became comparable traces, charts, and evidence for congestion-aware decisions.",
    proof: [
      "Benchmarked 6+ adaptive bitrate variants",
      "OCaml/ML analysis across TCP/IP simulations",
      "Experimental work supporting ACM SIGCOMM ’24 research",
    ],
    mode: "MEASURE / MODEL / VERIFY",
  },
];

const artifacts = [
  {
    number: "A",
    title: "SAT Policy Audit",
    subtitle: "When the learned policy ignores the formula",
    description:
      "Audited a policy-gradient SAT prototype, found a tensor-shape failure and formula-independent behavior, then built deterministic evaluation over 600 held-out 3-CNF formulas.",
    tags: ["PyTorch", "Reinforcement learning", "Exact enumeration"],
    href: "https://github.com/MK-523/BooleanSatisfiability/tree/main/benchmark",
  },
  {
    number: "B",
    title: "Sentiment → Music",
    subtitle: "Mapping emotional language into musical structure",
    description:
      "Explored BERT sentiment representations, expressive music generation, and a tokenized Braille-to-music interface presented at the Stanford HAI AI + Education Summit.",
    tags: ["BERT", "NLTK", "Music AI"],
    href: "https://github.com/MK-523/NLP-music-sentimentanalysis",
  },
  {
    number: "C",
    title: "Chess Life Archive",
    subtitle: "Making decades of chess history searchable",
    description:
      "Helped shape a SQL-backed archive and editorial workflow for US Chess, giving 250K+ monthly readers a better way to retrieve and explore Chess Life issues.",
    tags: ["SQL", "Drupal", "Pantheon"],
    href: "https://new.uschess.org/chess-life-magazine",
  },
];

const disciplines = [
  {
    title: "Languages",
    line: "Python · TypeScript · JavaScript · Java · C++ · SQL · Rust · OCaml",
  },
  {
    title: "Systems",
    line: "Linux · Docker · Kubernetes · OpenFaaS · Redis · TCP/IP · gdb · Git",
  },
  {
    title: "Product + ML",
    line: "React · ReactFlow · PyTorch · JAX/XLA · BERT · OpenCV · Benchmarking",
  },
];

const honors = [
  ["US Chess Top 100 Juniors", "Competitive chess"],
  ["LA Hacks Winner", "Best Use of ElevenLabs · 1st of 76 teams"],
  ["AIME Qualifier", "Mathematics"],
  ["USNCO Finalist", "Chemistry"],
  ["Valedictorian", "American High School"],
];

const accents = [
  [240, 106, 36],
  [216, 162, 92],
  [234, 215, 173],
  [104, 174, 222],
  [152, 184, 198],
];

function PixelSword({ activeChapter = 0, intro = false }: { activeChapter?: number; intro?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeChapter);

  useEffect(() => {
    activeRef.current = activeChapter;
  }, [activeChapter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.src = "/forged-longsword.webp";
    let frame = 0;
    let particles: Particle[] = [];
    let drawBox = { x: 0, y: 0, width: 0, height: 0 };
    let start = performance.now();
    let pointer = { x: -1000, y: -1000 };
    let width = 1;
    let height = 1;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const swordHeight = Math.min(height * (intro ? 0.94 : 0.82), width * (intro ? 1.72 : 1.56));
      const swordWidth = swordHeight * (image.naturalWidth / image.naturalHeight);
      drawBox = {
        x: width / 2 - swordWidth / 2,
        y: height / 2 - swordHeight / 2,
        width: swordWidth,
        height: swordHeight,
      };

      const offscreen = document.createElement("canvas");
      offscreen.width = Math.ceil(width);
      offscreen.height = Math.ceil(height);
      const offContext = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offContext) return;
      offContext.drawImage(image, drawBox.x, drawBox.y, drawBox.width, drawBox.height);
      const pixels = offContext.getImageData(0, 0, offscreen.width, offscreen.height).data;
      const step = width < 600 ? 7 : intro ? 5 : 6;
      const next: Particle[] = [];

      for (let y = Math.max(0, Math.floor(drawBox.y)); y < Math.min(height, drawBox.y + drawBox.height); y += step) {
        for (let x = Math.max(0, Math.floor(drawBox.x)); x < Math.min(width, drawBox.x + drawBox.width); x += step) {
          const offset = (Math.floor(y) * offscreen.width + Math.floor(x)) * 4;
          const alpha = pixels[offset + 3];
          if (alpha > 80 && Math.random() > 0.12) {
            const angle = Math.random() * Math.PI * 2;
            const distance = intro ? 90 + Math.random() * Math.max(width, height) * 0.55 : 40 + Math.random() * 180;
            next.push({
              x: x + Math.cos(angle) * distance,
              y: y + Math.sin(angle) * distance,
              tx: x,
              ty: y,
              r: pixels[offset],
              g: pixels[offset + 1],
              b: pixels[offset + 2],
              alpha: alpha / 255,
              size: 0.7 + Math.random() * 1.8,
              seed: Math.random(),
            });
          }
        }
      }

      particles = next.length > 1800 ? next.filter((_, index) => index % 2 === 0) : next;
      start = performance.now();
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const onPointerLeave = () => {
      pointer = { x: -1000, y: -1000 };
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);
      const elapsed = time - start;
      const mode = activeRef.current;
      const accent = accents[mode] ?? accents[0];
      const settled = reducedMotion ? 1 : Math.min(1, elapsed / (intro ? 1900 : 1100));
      const solidness = reducedMotion ? 0.72 : Math.max(0, Math.min(0.55, (elapsed - 1000) / 2100));

      if (solidness > 0) {
        context.save();
        context.globalAlpha = solidness;
        context.drawImage(image, drawBox.x, drawBox.y, drawBox.width, drawBox.height);
        context.restore();
      }

      const scanY = (time * 0.16) % Math.max(1, height + 160) - 80;

      for (const particle of particles) {
        let targetX = particle.tx;
        let targetY = particle.ty;
        const drift = Math.sin(time * 0.0012 + particle.seed * 18);

        if (mode === 1) targetX += Math.sin(particle.ty * 0.038 + time * 0.0024) * (2 + particle.seed * 7);
        if (mode === 2 && particle.seed > 0.7) {
          targetX += Math.sin(time * 0.0018 + particle.seed * 20) * 16;
          targetY += Math.cos(time * 0.0015 + particle.seed * 16) * 7;
        }
        if (mode === 3 && Math.abs(particle.ty - scanY) < 68) targetX += (particle.seed - 0.5) * 24;
        if (mode === 4) targetX += Math.sin(particle.ty * 0.025 - time * 0.0022 + particle.seed) * 9;

        const ease = reducedMotion ? 1 : 0.035 + settled * 0.045;
        particle.x += (targetX - particle.x) * ease;
        particle.y += (targetY - particle.y) * ease;

        if (!reducedMotion) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 92 && distance > 0) {
            const force = (92 - distance) / 92;
            particle.x += (dx / distance) * force * 3.8;
            particle.y += (dy / distance) * force * 3.8;
          }
        }

        const blend = 0.25 + (mode === 3 && Math.abs(particle.ty - scanY) < 68 ? 0.58 : 0.16 * (1 + drift));
        const red = Math.round(particle.r * (1 - blend) + accent[0] * blend);
        const green = Math.round(particle.g * (1 - blend) + accent[1] * blend);
        const blue = Math.round(particle.b * (1 - blend) + accent[2] * blend);
        const assemblyAlpha = reducedMotion ? 0.92 : Math.min(0.95, 0.18 + settled * 0.8);

        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${particle.alpha * assemblyAlpha})`;
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
      }

      frame = requestAnimationFrame(render);
    };

    const onResize = () => {
      if (image.complete && image.naturalWidth) build();
    };

    image.onload = () => {
      build();
      frame = requestAnimationFrame(render);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [intro]);

  return <canvas ref={canvasRef} className="pixel-sword" aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

    const chapterObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveChapter(Number((visible.target as HTMLElement).dataset.chapter ?? 0));
      },
      { threshold: [0.35, 0.55, 0.75] },
    );
    document.querySelectorAll("[data-chapter]").forEach((node) => chapterObserver.observe(node));

    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty("--page-progress", `${window.scrollY / total}`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      chapterObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
        <a className="identity" href="#top" onClick={closeMenu} aria-label="Mahesh Karthikeyan home">
          Mahesh Karthikeyan
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Primary navigation">
          <a href="#chapters" onClick={closeMenu}>Chapters</a>
          <i>/</i>
          <a href="#artifacts" onClick={closeMenu}>Artifacts</a>
          <i>/</i>
          <a href="#arsenal" onClick={closeMenu}>Arsenal</a>
          <i>/</i>
          <a href="#record" onClick={closeMenu}>Record</a>
        </nav>
        <div className="header-progress" aria-hidden="true"><span /></div>
      </header>

      <section className="forge-hero" id="top">
        <div className="forge-backdrop" aria-hidden="true" />
        <div className="hero-geometry" aria-hidden="true"><span /><span /><span /></div>
        <div className="hero-copy">
          <p className="overline">UCLA CS · Portfolio / 2026</p>
          <h1><span>Systems</span> engineer.<br />Chess player.<br /><em>Builder.</em></h1>
          <div className="hero-actions">
            <a className="forge-button" href="#chapters"><span>Begin the story</span><b>↓</b></a>
            <a className="text-link" href="mailto:mahesh523k@gmail.com">Start a conversation ↗</a>
          </div>
        </div>

        <div className="hero-sword">
          <PixelSword intro />
          <div className="forge-readout" aria-hidden="true"><span /> aggregating pixels</div>
        </div>

        <div className="hero-proof">
          <p className="proof-label">Selected signals</p>
          <div><strong>337 ms → 125 ms</strong><span>serverless first request</span></div>
          <div><strong>30–60 min → &lt;5 min</strong><span>decision review</span></div>
          <div><strong>Used by Hikaru</strong><span>ChessStalker</span></div>
        </div>

        <div className="hero-coordinate" aria-hidden="true">34.0689° N / 118.4452° W</div>
        <div className="scroll-instruction"><span>Scroll to temper the blade</span><i /></div>
      </section>

      <section className="opening-statement reveal">
        <p className="section-code">FIELD NOTE / 00</p>
        <blockquote>
          I like systems that can <em>show their work</em>—where a latency number, a risk decision, or a chess recommendation can be traced back to the machinery underneath.
        </blockquote>
      </section>

      <section className="chronicle" id="chapters">
        <div className="chronicle-grid">
          <div className="chronicle-sword">
            <div className="chapter-dial" aria-hidden="true">
              {chapters.map((chapter, index) => (
                <span className={activeChapter === index ? "active" : ""} key={chapter.label}>{String(index + 1).padStart(2, "0")}</span>
              ))}
            </div>
            <PixelSword activeChapter={activeChapter} />
            <div className="sword-mode" aria-live="polite">
              <span>{String(activeChapter + 1).padStart(2, "0")}</span>
              {chapters[activeChapter].mode}
            </div>
          </div>

          <div className="chapter-copy">
            {chapters.map((chapter, index) => (
              <article
                className={activeChapter === index ? "chapter is-active" : "chapter"}
                data-chapter={index}
                key={chapter.label}
              >
                <div className="chapter-inner">
                  <div className="chapter-topline"><span>{String(index + 1).padStart(2, "0")}</span><p>{chapter.label}</p></div>
                  <div className="chapter-metric"><strong>{chapter.metric}</strong><span>{chapter.metricLabel}</span></div>
                  <h2>{chapter.title}</h2>
                  <p className="chapter-story">{chapter.story}</p>
                  <ul>{chapter.proof.map((item) => <li key={item}>{item}</li>)}</ul>
                  {chapter.link && <a className="chapter-link" href={chapter.link} target="_blank" rel="noreferrer">{chapter.linkLabel} <span>↗</span></a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="artifact-section" id="artifacts">
        <div className="section-intro reveal">
          <p className="section-code">SIDE QUESTS / OPEN THE OBJECT</p>
          <h2>Other things worth<br /><em>taking apart.</em></h2>
          <p>Smaller experiments, each built around one question that would not leave me alone.</p>
        </div>
        <div className="artifact-list">
          {artifacts.map((artifact) => (
            <a className="artifact reveal" href={artifact.href} target="_blank" rel="noreferrer" key={artifact.title}>
              <span className="artifact-number">{artifact.number}</span>
              <div><p>{artifact.subtitle}</p><h3>{artifact.title}</h3></div>
              <p className="artifact-description">{artifact.description}</p>
              <div className="artifact-tags">{artifact.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <span className="artifact-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="arsenal-section" id="arsenal">
        <div className="section-intro reveal">
          <p className="section-code">ARSENAL / TOOLS I REACH FOR</p>
          <h2>Use the smallest tool<br />that can <em>survive reality.</em></h2>
        </div>
        <div className="discipline-list">
          {disciplines.map((discipline, index) => (
            <div className="discipline reveal" key={discipline.title}>
              <span>0{index + 1}</span><h3>{discipline.title}</h3><p>{discipline.line}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="record-section" id="record">
        <div className="record-heading reveal">
          <p className="section-code">INSCRIBED / THE RECORD</p>
          <h2>Different arenas.<br />Same instinct.</h2>
        </div>
        <div className="record-list reveal">
          {honors.map(([title, field], index) => (
            <div key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{field}</p></div>
          ))}
        </div>
      </section>

      <section className="contact-forge" id="contact">
        <div className="contact-sigil" aria-hidden="true"><span /><span /></div>
        <p className="section-code">THE NEXT PROBLEM / UNWRITTEN</p>
        <h2>What should we<br /><em>make faster?</em></h2>
        <a href="mailto:mahesh523k@gmail.com">mahesh523k@gmail.com <span>↗</span></a>
        <div className="contact-links">
          <a href="https://github.com/MK-523" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/mnkarthikeyan/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://chessstalker.com/" target="_blank" rel="noreferrer">ChessStalker</a>
        </div>
      </section>

      <footer>
        <span>Mahesh Karthikeyan</span>
        <p>UCLA CS · Systems · Product · Chess</p>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
