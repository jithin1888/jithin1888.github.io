"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

type GateParticle = {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  size: number;
  delay: number;
  spin: number;
  tone: number;
};

type CursorMote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  seed: number;
};

type CursorSpark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
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
  ["USNCO Finalist", "Chemistry"],
];

const accents = [
  [240, 106, 36],
  [216, 162, 92],
  [234, 215, 173],
  [104, 174, 222],
  [152, 184, 198],
];

function ForgeGate({
  onUnlock,
  onComplete,
}: {
  onUnlock: () => void;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const unlockRef = useRef(onUnlock);
  const completeRef = useRef(onComplete);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    unlockRef.current = onUnlock;
    completeRef.current = onComplete;
  }, [onComplete, onUnlock]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const unlockAt = reducedMotion ? 520 : 2780;
    const fadeDuration = reducedMotion ? 180 : 820;
    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);
    let particles: GateParticle[] = [];
    let frame = 0;
    let finishTimer = 0;
    let hasUnlocked = false;
    let start = performance.now();

    document.documentElement.classList.add("forge-locked");
    document.body.classList.add("forge-locked");
    window.scrollTo({ top: 0, left: 0 });

    const clamp = (value: number, minimum = 0, maximum = 1) =>
      Math.min(maximum, Math.max(minimum, value));

    const build = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.55);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mask = document.createElement("canvas");
      mask.width = Math.ceil(width);
      mask.height = Math.ceil(height);
      const maskContext = mask.getContext("2d", { willReadFrequently: true });
      if (!maskContext) return;

      const swordHeight = Math.min(height * 0.76, width * 1.42, 780);
      const centerX = width / 2;
      const top = height / 2 - swordHeight / 2;
      const bladeEnd = top + swordHeight * 0.67;
      const bladeWidth = Math.max(28, Math.min(68, swordHeight * 0.082));
      const guardY = bladeEnd + bladeWidth * 0.15;
      const handleBottom = top + swordHeight * 0.94;

      maskContext.fillStyle = "#fff";
      maskContext.beginPath();
      maskContext.moveTo(centerX, top);
      maskContext.lineTo(centerX + bladeWidth * 0.5, top + bladeWidth * 1.08);
      maskContext.lineTo(centerX + bladeWidth * 0.34, bladeEnd);
      maskContext.lineTo(centerX, bladeEnd + bladeWidth * 0.34);
      maskContext.lineTo(centerX - bladeWidth * 0.34, bladeEnd);
      maskContext.lineTo(centerX - bladeWidth * 0.5, top + bladeWidth * 1.08);
      maskContext.closePath();
      maskContext.fill();

      maskContext.beginPath();
      maskContext.moveTo(centerX - bladeWidth * 1.72, guardY - bladeWidth * 0.16);
      maskContext.lineTo(centerX - bladeWidth * 0.42, guardY + bladeWidth * 0.24);
      maskContext.lineTo(centerX, guardY + bladeWidth * 0.04);
      maskContext.lineTo(centerX + bladeWidth * 0.42, guardY + bladeWidth * 0.24);
      maskContext.lineTo(centerX + bladeWidth * 1.72, guardY - bladeWidth * 0.16);
      maskContext.lineTo(centerX + bladeWidth * 1.55, guardY + bladeWidth * 0.35);
      maskContext.lineTo(centerX, guardY + bladeWidth * 0.52);
      maskContext.lineTo(centerX - bladeWidth * 1.55, guardY + bladeWidth * 0.35);
      maskContext.closePath();
      maskContext.fill();

      maskContext.fillRect(centerX - bladeWidth * 0.17, guardY + bladeWidth * 0.38, bladeWidth * 0.34, handleBottom - guardY);
      maskContext.beginPath();
      maskContext.moveTo(centerX, handleBottom - bladeWidth * 0.05);
      maskContext.lineTo(centerX + bladeWidth * 0.36, handleBottom + bladeWidth * 0.34);
      maskContext.lineTo(centerX, handleBottom + bladeWidth * 0.72);
      maskContext.lineTo(centerX - bladeWidth * 0.36, handleBottom + bladeWidth * 0.34);
      maskContext.closePath();
      maskContext.fill();

      const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
      const step = width < 560 ? 7 : 6;
      let seed = 0x5232026;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const next: GateParticle[] = [];
      let index = 0;

      for (let y = Math.max(0, Math.floor(top)); y < Math.min(height, handleBottom + bladeWidth); y += step) {
        for (let x = Math.max(0, Math.floor(centerX - bladeWidth * 1.8)); x < Math.min(width, centerX + bladeWidth * 1.8); x += step) {
          const offset = (Math.floor(y) * mask.width + Math.floor(x)) * 4;
          if (pixels[offset + 3] < 120 || random() < 0.1) continue;

          const sourceMode = index % 5;
          let sx = random() * width;
          let sy = random() * height;
          if (sourceMode === 0) {
            sy = (Math.floor(random() * 9) + 0.5) * (height / 9) + (random() - 0.5) * 18;
          } else if (sourceMode === 1) {
            sx = x < centerX ? -24 - random() * width * 0.12 : width + 24 + random() * width * 0.12;
          } else if (sourceMode === 2) {
            sy = random() > 0.5 ? -30 - random() * 90 : height + 30 + random() * 90;
          } else if (sourceMode === 3) {
            const side = random() > 0.5 ? 0.08 : 0.72;
            sx = width * (side + random() * 0.2);
            sy = height * (0.12 + random() * 0.76);
          }

          next.push({
            sx,
            sy,
            tx: x,
            ty: y,
            size: 0.8 + random() * (width < 560 ? 1.5 : 2.1),
            delay: random(),
            spin: random() * 2 - 1,
            tone: y > guardY - bladeWidth * 0.2 ? 1 : random(),
          });
          index += 1;
        }
      }

      particles = next;
      start = performance.now();
    };

    const render = (time: number) => {
      const elapsed = time - start;
      context.clearRect(0, 0, width, height);

      const assembly = reducedMotion ? 1 : clamp((elapsed - 180) / 2180);
      const displayedProgress = Math.round(assembly * 100);
      if (progressRef.current) progressRef.current.textContent = String(displayedProgress).padStart(3, "0");

      for (const particle of particles) {
        const local = reducedMotion ? 1 : clamp((assembly - particle.delay * 0.2) / 0.8);
        const eased = 1 - Math.pow(1 - local, 4);
        const orbit = Math.sin(local * Math.PI) * (1 - local) * (70 + Math.abs(particle.spin) * 150);
        const x = particle.sx + (particle.tx - particle.sx) * eased + Math.cos(particle.delay * 18 + local * 7) * orbit * particle.spin;
        const y = particle.sy + (particle.ty - particle.sy) * eased + Math.sin(particle.delay * 15 + local * 6) * orbit;
        const ignition = clamp(elapsed / 360) * (0.26 + local * 0.74);
        const isHilt = particle.tone === 1;
        const heat = Math.max(0, 1 - Math.abs(assembly - 0.72) * 5.2) * (0.4 + particle.delay * 0.6);
        const red = Math.round((isHilt ? 190 : 210) + heat * 42);
        const green = Math.round((isHilt ? 126 : 205) - heat * 82);
        const blue = Math.round((isHilt ? 58 : 183) - heat * 125);
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${ignition})`;
        context.fillRect(x, y, particle.size, particle.size);
      }

      if (assembly > 0.91) {
        const lock = clamp((assembly - 0.91) / 0.09);
        context.save();
        context.globalCompositeOperation = "screen";
        context.fillStyle = `rgba(240, 231, 210, ${lock * 0.13})`;
        context.fillRect(width / 2 - 1, height * 0.12, 2, height * 0.76);
        context.restore();
      }

      if (!hasUnlocked && elapsed >= unlockAt) {
        hasUnlocked = true;
        setUnlocking(true);
        unlockRef.current();
        finishTimer = window.setTimeout(() => completeRef.current(), fadeDuration);
      }

      frame = requestAnimationFrame(render);
    };

    const onResize = () => build();
    build();
    frame = requestAnimationFrame(render);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(finishTimer);
      window.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("forge-locked");
      document.body.classList.remove("forge-locked");
    };
  }, []);

  return (
    <div className={unlocking ? "forge-gate is-unlocking" : "forge-gate"} role="status" aria-live="polite" aria-label="Forging the interface">
      <canvas ref={canvasRef} className="forge-gate-canvas" aria-hidden="true" />
      <div className="forge-gate-reticle" aria-hidden="true"><span /><span /></div>
      <div className="forge-gate-copy">
        <p>FORGING THE INTERFACE</p>
        <div><span ref={progressRef}>000</span><i>%</i></div>
        <small>Pixels are becoming the blade</small>
      </div>
      <div className="forge-gate-index" aria-hidden="true">MK / SYSTEMS / 2026</div>
    </div>
  );
}

const cursorSwordFormation: Array<[number, number]> = [
  [-34, 0], [-29, -1], [-29, 1], [-24, -2], [-24, 2], [-19, -2.5], [-19, 2.5],
  [-14, -3], [-14, 3], [-9, -3], [-9, 3], [-4, -3.5], [-4, 3.5], [1, -3], [1, 3],
  [5, -12], [5, -8], [5, 8], [5, 12], [8, -5], [8, 5], [9, 0], [14, -1.5], [14, 1.5],
  [19, -1.5], [19, 1.5], [24, 0], [28, -2], [28, 2], [32, 0],
];

function PixelCursorField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reducedMotion || !finePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);
    let frame = 0;
    let hot = false;
    const pointer = { x: 0, y: 0, angle: -Math.PI / 2, speed: 0, lastMove: 0, active: false };
    const motes: CursorMote[] = cursorSwordFormation.map((_, index) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 1 + (index % 4) * 0.35,
      seed: (index * 0.61803398875) % 1,
    }));
    const sparks: CursorSpark[] = [];

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const addSpark = (x: number, y: number, vx: number, vy: number, life = 1) => {
      sparks.push({ x, y, vx, vy, life, size: 0.8 + Math.random() * 2.2 });
      if (sparks.length > 220) sparks.splice(0, sparks.length - 220);
    };

    const onPointerMove = (event: PointerEvent) => {
      const nextX = event.clientX;
      const nextY = event.clientY;
      const target = event.target as Element | null;
      hot = Boolean(target?.closest?.("a, button"));

      if (!pointer.active) {
        pointer.x = nextX;
        pointer.y = nextY;
        pointer.active = true;
        for (const mote of motes) {
          mote.x = nextX;
          mote.y = nextY;
        }
      } else {
        const dx = nextX - pointer.x;
        const dy = nextY - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0.5) pointer.angle = Math.atan2(dy, dx);
        pointer.speed = Math.min(42, distance);

        const sparkCount = Math.min(8, Math.floor(distance / 9));
        for (let index = 0; index < sparkCount; index += 1) {
          const amount = sparkCount <= 1 ? 0 : index / (sparkCount - 1);
          const x = pointer.x + dx * amount;
          const y = pointer.y + dy * amount;
          addSpark(
            x + (Math.random() - 0.5) * 5,
            y + (Math.random() - 0.5) * 5,
            -dx * 0.025 + (Math.random() - 0.5) * 1.3,
            -dy * 0.025 + (Math.random() - 0.5) * 1.3,
            0.7 + Math.random() * 0.3,
          );
        }
        pointer.x = nextX;
        pointer.y = nextY;
      }
      pointer.lastMove = performance.now();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!pointer.active) return;
      for (let index = 0; index < 34; index += 1) {
        const angle = (index / 34) * Math.PI * 2 + Math.random() * 0.16;
        const velocity = 1.4 + Math.random() * 4.8;
        addSpark(event.clientX, event.clientY, Math.cos(angle) * velocity, Math.sin(angle) * velocity);
      }
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);
      if (pointer.active) {
        const idle = time - pointer.lastMove > 430;
        const cos = Math.cos(pointer.angle);
        const sin = Math.sin(pointer.angle);

        motes.forEach((mote, index) => {
          let targetX: number;
          let targetY: number;
          if (idle) {
            const [forward, across] = cursorSwordFormation[index];
            targetX = pointer.x + forward * cos - across * sin;
            targetY = pointer.y + forward * sin + across * cos;
          } else if (index === 0) {
            targetX = pointer.x;
            targetY = pointer.y;
          } else {
            const leader = motes[index - 1];
            const spacing = 2.4 + index * 0.025;
            targetX = leader.x - cos * spacing;
            targetY = leader.y - sin * spacing;
          }

          const spring = idle ? 0.19 : Math.max(0.085, 0.26 - index * 0.0045);
          const damping = idle ? 0.66 : 0.72;
          mote.vx = (mote.vx + (targetX - mote.x) * spring) * damping;
          mote.vy = (mote.vy + (targetY - mote.y) * spring) * damping;
          mote.x += mote.vx;
          mote.y += mote.vy;

          const shimmer = 0.62 + Math.sin(time * 0.006 + mote.seed * 12) * 0.2;
          const alpha = idle ? 0.88 : Math.max(0.15, shimmer * (1 - index / (motes.length * 1.15)));
          const color = hot
            ? `rgba(255, 120, 42, ${alpha})`
            : index % 5 === 0
              ? `rgba(216, 162, 92, ${alpha})`
              : `rgba(240, 231, 210, ${alpha})`;
          context.fillStyle = color;
          const size = idle && (index === 0 || index > 26) ? mote.size + 0.8 : mote.size;
          context.fillRect(Math.round(mote.x), Math.round(mote.y), size, size);
        });
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.975;
        spark.vy = spark.vy * 0.975 + 0.012;
        spark.life -= 0.022;
        if (spark.life <= 0) {
          sparks.splice(index, 1);
          continue;
        }
        context.fillStyle = `rgba(240, 106, 36, ${spark.life * 0.82})`;
        context.fillRect(Math.round(spark.x), Math.round(spark.y), spark.size, spark.size);
      }

      frame = requestAnimationFrame(render);
    };

    resize();
    frame = requestAnimationFrame(render);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-forge" aria-hidden="true" />;
}

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
  const [introStage, setIntroStage] = useState<"forging" | "unlocking" | "complete">("forging");

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
    <>
      {introStage !== "complete" && (
        <ForgeGate
          onUnlock={() => setIntroStage("unlocking")}
          onComplete={() => setIntroStage("complete")}
        />
      )}
      {introStage === "complete" && <PixelCursorField />}
      <main
        className={introStage === "forging" ? "site-shell is-forging" : "site-shell is-ready"}
        aria-busy={introStage !== "complete"}
        inert={introStage === "forging" ? true : undefined}
      >
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
          {introStage !== "forging" && <PixelSword intro />}
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
            {introStage !== "forging" && <PixelSword activeChapter={activeChapter} />}
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
    </>
  );
}
