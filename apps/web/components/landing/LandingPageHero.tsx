'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MdWebhook } from 'react-icons/md';
import { FaTelegram } from 'react-icons/fa6';
import { BsRobot, BsLightningChargeFill } from 'react-icons/bs';
import { SiGmail, SiOpenai } from 'react-icons/si';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/ReduxStore/store';
import Link from 'next/link';

// Modern node card component
const NodeCard = ({ icon: Icon, color, label, delay }: { icon: any, color: string, label: string, delay: number }) => (
  <motion.div
    className="relative group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
  >
    <div
      className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:scale-105"
      style={{ boxShadow: `0 0 40px ${color}15` }}
    >
      <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" style={{ color }} />
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.02] pointer-events-none" />
    </div>
    <motion.span
      className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {label}
    </motion.span>
  </motion.div>
);

// Animated connection line
const ConnectionLine = ({ delay }: { delay: number }) => (
  <motion.div
    className="w-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
  />
);

// Thunder bolt configuration - nodes positioned to form a ⚡ lightning bolt shape
// The shape: starts top-right, goes down-left to middle, then back right, then down-left to bottom
const thunderNodes = [
  { id: 'webhook', icon: MdWebhook, color: '#f97316', label: 'Webhook', x: 200, y: 0 },      // Top right
  { id: 'aiAgent', icon: BsRobot, color: '#a855f7', label: 'AI Agent', x: 80, y: 100 },      // Upper left
  { id: 'telegram', icon: FaTelegram, color: '#0088cc', label: 'Telegram', x: 160, y: 180 }, // Middle right
  { id: 'gmail', icon: SiGmail, color: '#EA4335', label: 'Gmail', x: 40, y: 280 },           // Lower left
  { id: 'openai', icon: SiOpenai, color: '#10a37f', label: 'OpenAI', x: 120, y: 380 },       // Bottom
];

const connections = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
];

// Main thunder bolt visualization with animated connections
const WorkflowVisualization = () => {
  const [activeConnection, setActiveConnection] = useState(-1);
  const [showFlash, setShowFlash] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    // Animate connections sequentially - slower timing
    const timers = connections.map((_, index) =>
      setTimeout(() => setActiveConnection(index), 1000 + index * 600)
    );

    // Flash effect after all connections
    const flashTimer = setTimeout(() => {
      setShowFlash(true);
      setPulseActive(true);
    }, 4000);
    const flashEndTimer = setTimeout(() => setShowFlash(false), 4500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(flashTimer);
      clearTimeout(flashEndTimer);
    };
  }, []);

  const getConnectionPath = (fromIndex: number, toIndex: number) => {
    const from = thunderNodes[fromIndex];
    const to = thunderNodes[toIndex];
    if (!from || !to) return '';
    const startX = from.x + 32;
    const startY = from.y + 32;
    const endX = to.x + 32;
    const endY = to.y + 32;
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  return (
    <div className="relative w-[320px] h-[480px]">
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: pulseActive ? [0.5, 0.8, 0.5] : 0.3 }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-[400px] h-[550px] rounded-full bg-gradient-to-b from-violet-500/15 via-purple-500/10 to-indigo-600/10 blur-[100px]" />
      </motion.div>

      {/* Lightning bolt background shape */}
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showFlash ? 0.4 : 0.1 }}
        transition={{ duration: 0.3 }}
      >
        <path
          d="M 232 32 L 112 132 L 192 212 L 72 312 L 152 412"
          stroke="url(#boltGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#boltGlow)"
        />
        <defs>
          <linearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="boltGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </motion.svg>

      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {connections.map((conn, index) => (
          <motion.path
            key={index}
            d={getConnectionPath(conn.from, conn.to)}
            stroke="url(#connectionGradient)"
            strokeWidth="3"
            fill="none"
            filter="url(#lineGlow)"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: activeConnection >= index ? 1 : 0,
              opacity: activeConnection >= index ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Nodes */}
      {thunderNodes.map((node, index) => (
        <motion.div
          key={node.id}
          className="absolute group cursor-pointer"
          style={{ left: node.x, top: node.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            delay: index * 0.12,
            duration: 0.5,
            type: 'spring',
            stiffness: 180,
          }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-[#0c0c0c] border border-white/10 flex items-center justify-center relative overflow-hidden"
            animate={{
              boxShadow: showFlash
                ? `0 0 40px ${node.color}, 0 0 80px ${node.color}50`
                : `0 0 20px ${node.color}30`,
              borderColor: showFlash ? `${node.color}60` : 'rgba(255,255,255,0.1)',
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.08, borderColor: `${node.color}80` }}
          >
            <node.icon className="w-7 h-7 relative z-10" style={{ color: node.color }} />
            {/* Inner glow */}
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: `radial-gradient(circle at center, ${node.color}40, transparent)` }}
            />
          </motion.div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            {node.label}
          </span>
        </motion.div>
      ))}

      {/* Flash overlay effect */}
      {showFlash && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 via-transparent to-transparent" />
        </motion.div>
      )}
    </div>
  );
};

// Feature card for the features section
const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04]"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-white/70" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export const LandingPageHero = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Subtle background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-violet-900/15 via-purple-900/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-900/10 to-transparent blur-[100px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        className="relative z-50 flex items-center justify-between px-6 lg:px-8 py-5 max-w-6xl mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <BsLightningChargeFill className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">FlowBolt</span>
        </div>

        {isLoggedIn ? (
          <Link
            href="/home/workflows"
            className="px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/start-auth"
            className="px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        )}
      </motion.nav>

      {/* Hero Section - Side by side layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[85vh] px-6 lg:px-8 max-w-6xl mx-auto gap-12 lg:gap-8">
        {/* Left side - Text content */}
        <motion.div
          className="flex-1 text-center lg:text-left max-w-xl"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">Now with AI-powered automation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white">Automate your workflows</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">at lightning speed</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-base lg:text-lg text-gray-400 mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Connect your apps, automate repetitive tasks, and let AI handle the rest.
            Build powerful workflows without writing code.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href={isLoggedIn ? "/home/workflows" : "/start-auth"}
              className="px-8 py-3.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start Building — It\'s Free'}
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-lg border border-white/10 text-white/70 font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
            >
              See How It Works
            </a>
          </motion.div>
        </motion.div>

        {/* Right side - Thunder animation */}
        <motion.div
          className="flex-1 flex items-center justify-center lg:justify-end"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <WorkflowVisualization />
        </motion.div>
      </div>


      {/* How It Works Section */}
      < section id="how-it-works" className="relative z-10 py-32 px-6 lg:px-8 max-w-6xl mx-auto" >
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-gray-500 max-w-md mx-auto">Build automations in minutes, not hours. No coding required.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={MdWebhook}
            title="1. Choose a Trigger"
            description="Start with a webhook, schedule, or any of our 100+ app integrations to kick off your workflow."
            delay={0.1}
          />
          <FeatureCard
            icon={BsRobot}
            title="2. Add Actions"
            description="Connect AI agents, send messages, update databases — chain together as many steps as you need."
            delay={0.2}
          />
          <FeatureCard
            icon={BsLightningChargeFill}
            title="3. Run Automatically"
            description="Deploy your workflow and watch it run 24/7. Monitor executions in real-time from your dashboard."
            delay={0.3}
          />
        </div>
      </section >

      {/* Integrations Section */}
      < section className="relative z-10 py-32 px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5" >
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Popular Integrations</h2>
          <p className="text-gray-500 max-w-md mx-auto">Connect with the tools you already use.</p>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {[
            { icon: FaTelegram, color: '#0088cc', name: 'Telegram' },
            { icon: SiGmail, color: '#EA4335', name: 'Gmail' },
            { icon: SiOpenai, color: '#10a37f', name: 'OpenAI' },
            { icon: MdWebhook, color: '#f97316', name: 'Webhooks' },
            { icon: BsRobot, color: '#a855f7', name: 'AI Agent' },
          ].map((item, index) => (
            <motion.div
              key={item.name}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
              <span className="text-sm text-gray-400">{item.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section >

      {/* CTA Section */}
      < section className="relative z-10 py-32 px-6 lg:px-8 max-w-6xl mx-auto" >
        <motion.div
          className="text-center p-12 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to automate?</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">Get started for free. No credit card required.</p>
          <Link
            href={isLoggedIn ? "/home/workflows" : "/start-auth"}
            className="inline-block px-8 py-3.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Start Building Free'}
          </Link>
        </motion.div>
      </section >

      {/* Footer */}
      < footer className="relative z-10 py-8 px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5" >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BsLightningChargeFill className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-gray-500">FlowBolt</span>
          </div>
          <p className="text-xs text-gray-600">© 2024 FlowBolt. All rights reserved.</p>
        </div>
      </footer >
    </div >
  );
};
