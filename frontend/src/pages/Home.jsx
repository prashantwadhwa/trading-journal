import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  BarChart3,
  Brain,
  Flame,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  BookOpen,
  LineChart,
  Target,
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import StrokeText from "@/components/StrokeText";
import BorderGlow from "@/components/BorderGlow";

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track your win rate, total P&L, risk-to-reward ratio, and equity curve in one place.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Brain,
    title: "Emotion Tracking",
    description:
      "Understand how your emotions affect your trading decisions and performance.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Flame,
    title: "Revenge Trade Alerts",
    description:
      "Identify potentially impulsive trades after losses and spot unhealthy patterns.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: Sparkles,
    title: "AI Weekly Reviews",
    description:
      "Turn your trading history into weekly summaries, lessons, and insights.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
];

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Log every trade",
    description:
      "Record your entries, exits, position sizes, setups, and the reasoning behind each trade.",
  },
  {
    number: "02",
    icon: LineChart,
    title: "Discover your patterns",
    description:
      "Review your performance metrics to understand what's working and where you can improve.",
  },
  {
    number: "03",
    icon: Target,
    title: "Build better habits",
    description:
      "Use your reviews and emotional insights to make more consistent, intentional decisions.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function DashboardPreview() {
  const values = [
    120, 112, 118, 96, 104, 83, 90, 70, 77, 55, 62, 42, 49, 25, 32, 12,
  ];

  const points = values
    .map((y, i) => `${(i / (values.length - 1)) * 600},${y}`)
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.3 }}
      className="relative mx-auto max-w-5xl scroll-mt-24"
      id="analytics"
    >
      <div className="absolute -inset-5 rounded-3xl bg-emerald-500/10 blur-3xl" />

      <div className="relative rounded-2xl border border-white/10 bg-[#0e1522] p-5 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-sm text-slate-400">Welcome back, trader</p>
            <h2 className="mt-1 text-xl font-semibold">Your performance</h2>
          </div>
          <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400">
            Last 30 days
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total P&L", "₹24,850", "text-emerald-400"],
            ["Win Rate", "64.2%", "text-white"],
            ["Avg. R:R", "1:2.4", "text-white"],
            ["Total Trades", "86", "text-white"],
          ].map(([label, value, color], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`mt-3 text-xl font-semibold sm:text-2xl ${color}`}>
                {value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-7 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Equity Curve</h3>
              <p className="mt-1 text-xs text-slate-500">
                Illustrative cumulative performance
              </p>
            </div>
            <TrendingUp className="text-emerald-400" />
          </div>

          <div className="mt-5 h-40">
            <svg
              viewBox="0 0 600 150"
              preserveAspectRatio="none"
              className="h-full w-full"
              role="img"
              aria-label="Illustrative upward equity curve"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity=".25" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[30, 65, 100, 135].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#ffffff"
                  strokeOpacity=".08"
                  strokeDasharray="4 5"
                />
              ))}

              <motion.polygon
                points={`0,150 ${points} 600,150`}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
              />

              <motion.polyline
                points={points}
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-400/15 bg-orange-400/[0.04] p-4">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-400" />
            <div>
              <p className="text-sm font-medium">Trading discipline</p>
              <p className="mt-1 text-xs text-slate-500">
                Review your decisions after a loss.
              </p>
            </div>
          </div>
          <span className="text-xs text-orange-300">Stay consistent</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const signupUrl = "/signup";

  return (
    <div className="min-h-screen overflow-hidden bg-[#080c14]! font-sans text-white!">
      <main className="bg-[#080c14]!">
        <section
          id="home"
          className="hero-section relative px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:pb-32"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/[0.09] blur-[130px]" />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
            className="relative mx-auto mb-16 max-w-4xl text-center"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2 text-xs text-emerald-300 sm:text-sm">
                <Sparkles size={15} />A better way to review your trades
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-8 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Stop guessing.
              <br />
              <StrokeText
                text="Start improving."
                strokeColor="#10b981"
                strokeStyle="solid"
                strokeWidth={1.4}
                dashLength={10}
                drawDuration={1.6}
                fillDelay={0.2}
                stagger={0.05}
                ease="power2.out"
                trigger="mount"
                fillMode="wipe"
                wipeFrom="left"
                // fontSize={48}
                // fontWeight={800}
                letterSpacing={-2}
                marching={false}
                hoverRedraw
                shadow={false}
                fillColor="#10b981"
                shadowColor="#10b981"
                fontFamily="inherit"
                reverse={false}
                className="text-3xl sm:text-4xl lg:text-5xl"
              />
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg"
            >
              Track every trade, uncover the patterns behind your performance,
              and build a more disciplined trading process with your personal
              trading journal.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <a
                href={signupUrl}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-7 py-4 font-semibold text-slate-950 transition hover:-translate-y-1 hover:bg-emerald-300"
              >
                Start journaling
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-7 py-4 text-slate-200 transition hover:bg-white/[0.04]"
              >
                Explore features <ArrowUpRight size={18} />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-wrap justify-center gap-5 text-xs text-slate-500"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Performance tracking
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Trading insights
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Weekly reviews
              </span>
            </motion.div>
          </motion.div>

          <DashboardPreview />
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Powerful features
              </p>
              <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
                Every trade has a lesson.
              </h2>
              <p className="mt-5 leading-7 text-slate-400">
                More than a spreadsheet. Everything you need to understand your
                performance and reflect on your decisions.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    key={feature.title}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-emerald-400/25 hover:bg-white/[0.04]"
                  >
                    <div
                      className={`inline-flex rounded-xl bg-white/[0.05] p-3 ${feature.color}`}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {feature.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Simple workflow
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
                Three steps to trade more thoughtfully.
              </h2>

              <p className="mt-5 leading-7 text-slate-400">
                Build a repeatable review routine that helps you learn from your
                decisions and stay focused on your process.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.article
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.12,
                    }}
                    className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02]"
                  >
                    <BorderGlow
                      edgeSensitivity={21}
                      glowColor="40 80 80"
                      backgroundColor="#070b13"
                      glowRadius={56}
                      glowIntensity={2.5}
                      coneSpread={22}
                       colors={['#c084fc', '#f472b6', '#38bdf8']}
                      className="p-7 rounded-2xl! bg-white/[0.02]! hover:bg-[#070b13]! transition duration-300 ease-in-out"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold tracking-widest text-emerald-400">
                          {step.number}
                        </span>
                        <Icon size={23} className="text-emerald-400" />
                      </div>

                      <h3 className="mt-7 text-xl font-semibold">
                        {step.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {step.description}
                      </p>
                    </BorderGlow>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bottom-cta-section px-5! pb-24! sm:px-8! lg:pb-32!">
          <SpotlightCard
            className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-emerald-400/15 bg-[#0e1522] px-6 py-16 text-center sm:px-12 sm:py-20"
            theme="dark"
            spotlightColor="#10b981"
            intensity={0.15}
            spotlightSize={240}
            softness={0.7}
            shape="circle"
            borderGlow={0.9}
            proximity={80}
            smoothing={0.3}
            grain={0}
            ambient
            flare
          >
            <div aria-hidden="true" className="" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                <TrendingUp size={26} />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
                Make every trade a learning opportunity.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
                Start building a clearer picture of your trading habits,
                performance, and progress.
              </p>

              <a
                href="/register"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Get started today
                <ArrowRight size={18} />
              </a>
            </div>
          </SpotlightCard>
        </section>
      </main>
      {/* Footer */}
      <footer className="border-t border-white/[0.07] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <a href="#home" className="flex items-center gap-2">
            <TrendingUp size={21} className="text-emerald-400" />
            <span className="font-bold">
              Trade<span className="text-emerald-400">Flow</span>
            </span>
          </a>

          <p className="text-center text-xs leading-6 text-slate-500">
            © {new Date().getFullYear()} TradeFlow. All rights reserved.
          </p>

          <a
            href="#home"
            className="text-sm text-slate-400 transition hover:text-emerald-400"
          >
            Back to top ↑
          </a>
        </div>

        <p className="mx-auto mt-5 max-w-7xl text-center text-xs leading-5 text-slate-600">
          Trading involves risk. Past performance does not guarantee future
          results. Dashboard figures are illustrative examples.
        </p>
      </footer>
    </div>
  );
}
