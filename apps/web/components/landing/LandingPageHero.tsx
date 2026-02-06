'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MdWebhook } from 'react-icons/md';
import { FaTelegram } from 'react-icons/fa6';
import { BsRobot, BsLightningChargeFill } from 'react-icons/bs';
import { SiGmail, SiOpenai } from 'react-icons/si';
import { NetworkRightSolid, AutoFlash } from 'iconoir-react';
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

// Thunder bolt configuration - 6-corner lightning bolt shape (⚡)
// Layout: 1 top → 2 center (spread) → 2 below-left → 1 bottom
// This creates the classic zigzag lightning bolt pattern

// All 6 nodes arranged as a 2D thunderbolt
const thunderNodes = [
  // Top node (1)
  { id: 'webhook', icon: MdWebhook, color: '#f97316', label: 'Webhook', x: 130, y: 20 },

  // Center nodes (2) - spread horizontally  
  { id: 'aiAgent', icon: BsRobot, color: '#a855f7', label: 'AI Agent', x: 60, y: 130 },
  { id: 'openai', icon: SiOpenai, color: '#10a37f', label: 'OpenAI', x: 190, y: 130 },

  // Below center nodes (2) - shifted left
  { id: 'telegram', icon: FaTelegram, color: '#0088cc', label: 'Telegram', x: 30, y: 260 },
  { id: 'gmail', icon: SiGmail, color: '#EA4335', label: 'Gmail', x: 150, y: 260 },

  // Bottom node (1)
  { id: 'lightning', icon: BsLightningChargeFill, color: '#ec4899', label: 'Execute', x: 90, y: 380 },
];

// No decorative nodes needed - all 6 are now main nodes
const decorativeNodes: { id: string; x: number; y: number; color: string }[] = [];

// Path coordinates for the lightning bolt shape (center of each node)
// Follows a zigzag: top → left-center → right-center → left-below → right-below → bottom
const boltCorners = [
  { x: 162, y: 52 },   // Node 1 - Top
  { x: 92, y: 162 },   // Node 2 - Center left
  { x: 222, y: 162 },  // Node 3 - Center right
  { x: 62, y: 292 },   // Node 4 - Below left
  { x: 182, y: 292 },  // Node 5 - Below right  
  { x: 122, y: 412 },  // Node 6 - Bottom
];

// Connections following the lightning bolt zigzag path
// 0(top) → 1(center-left) → 2(center-right) → 3(below-left) → 4(below-right) → 5(bottom)
const connections = [
  { from: 0, to: 1 },  // Top to center-left
  { from: 1, to: 2 },  // Center-left to center-right (horizontal zag)
  { from: 2, to: 3 },  // Center-right to below-left (diagonal zig)
  { from: 3, to: 4 },  // Below-left to below-right (horizontal zag)
  { from: 4, to: 5 },  // Below-right to bottom
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
        <div className="w-[400px] h-[550px] rounded-full bg-gradient-to-b from-rose-500/25 via-pink-600/20 to-rose-700/15 blur-[100px]" />
      </motion.div>


      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection 0: Webhook to AI Agent */}
        <line
          x1={thunderNodes[0]!.x + 32} y1={thunderNodes[0]!.y + 32}
          x2={thunderNodes[1]!.x + 32} y2={thunderNodes[1]!.y + 32}
          stroke="#ec4899" strokeWidth="3" strokeLinecap="round" filter="url(#lineGlow)"
          style={{
            opacity: activeConnection >= 0 ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
        />

        {/* Connection 1: AI Agent to OpenAI (horizontal) */}
        <line
          x1={92} y1={162}
          x2={222} y2={162}
          stroke="#ec4899" strokeWidth="3" strokeLinecap="round" filter="url(#lineGlow)"
          style={{
            opacity: activeConnection >= 1 ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
        />

        {/* Connection 2: OpenAI to Telegram */}
        <line
          x1={thunderNodes[2]!.x + 32} y1={thunderNodes[2]!.y + 32}
          x2={thunderNodes[3]!.x + 32} y2={thunderNodes[3]!.y + 32}
          stroke="#ec4899" strokeWidth="3" strokeLinecap="round" filter="url(#lineGlow)"
          style={{
            opacity: activeConnection >= 2 ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
        />

        {/* Connection 3: Telegram to Gmail (horizontal) */}
        <line
          x1={62} y1={292}
          x2={182} y2={292}
          stroke="#ec4899" strokeWidth="3" strokeLinecap="round" filter="url(#lineGlow)"
          style={{
            opacity: activeConnection >= 3 ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
        />

        {/* Connection 4: Gmail to Execute */}
        <line
          x1={thunderNodes[4].x + 32} y1={thunderNodes[4].y + 32}
          x2={thunderNodes[5].x + 32} y2={thunderNodes[5].y + 32}
          stroke="#ec4899" strokeWidth="3" strokeLinecap="round" filter="url(#lineGlow)"
          style={{
            opacity: activeConnection >= 4 ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
        />
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

      {/* Decorative corner nodes to complete lightning bolt shape */}
      {decorativeNodes.map((node, index) => (
        <motion.div
          key={node.id}
          className="absolute"
          style={{ left: node.x, top: node.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.6 + index * 0.15,
            duration: 0.4,
            type: 'spring',
            stiffness: 200,
          }}
        >
          <motion.div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: node.color }}
            animate={{
              boxShadow: showFlash
                ? `0 0 20px ${node.color}, 0 0 40px ${node.color}80`
                : `0 0 10px ${node.color}50`,
            }}
            transition={{ duration: 0.3 }}
          />
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
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/25 via-transparent to-transparent" />
        </motion.div>
      )}
    </div>
  );
};

// Feature card for the features section - enhanced with magenta glow
const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    className="relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-rose-500/40 transition-all duration-500 group overflow-hidden"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
  >
    {/* Subtle glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-b from-rose-500/0 to-rose-500/0 group-hover:from-rose-500/8 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/25 to-pink-600/15 border border-rose-500/25 flex items-center justify-center mb-4 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all duration-500">
        <Icon className="w-6 h-6 text-rose-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-rose-100 transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export const LandingPageHero = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Subtle background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-rose-900/30 via-pink-900/20 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-rose-950/20 to-transparent blur-[100px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        className="relative z-50 flex items-center justify-between px-6 lg:px-20 py-5 max-w-8xl mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.6)]">
            <NetworkRightSolid className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          </div>
          <span className="text-xl font-semibold text-white">FlowBolt</span>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link
              href="/home/workflows"
              className="px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/v1/auth/signout', { method: 'GET' });
                  if (res.ok) {
                    window.location.href = '/';
                  }
                } catch (err) {
                  console.error('Sign out failed:', err);
                }
              }}
              className="px-5 py-2.5 rounded-lg border border-rose-500/30 text-pink-700 font-medium text-sm hover:bg-rose-500/10 hover:border-rose-500/50 transition-all"
            >
              Sign Out
            </button>
          </div>
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
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[85vh] px-6 lg:px-12 max-w-7xl mx-auto gap-20 lg:gap-24">
        {/* Left side - Text content */}
        <motion.div
          className="flex-1 text-center lg:text-left max-w-3xl lg:pl-4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >


          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white">Automate your workflows</span>
            <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(244,63,94,0.7)]">at lightning speed</span>
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
          className="flex-1 flex items-center justify-center lg:justify-end lg:pr-8"
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
            icon={AutoFlash}
            title="3. Run Automatically"
            description="Deploy your workflow and watch it run 24/7. Monitor executions in real-time from your dashboard."
            delay={0.3}
          />
        </div>
      </section >

      {/* Integrations Section */}
      < section className="relative z-10 py-48 px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5 mb-20" >
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
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-rose-500/50 transition-all hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 rounded-lg bg-white/5" style={{ boxShadow: `0 0 15px ${item.color}30` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <span className="text-sm text-gray-300 font-medium">{item.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section >

      {/* Footer */}
      < footer className="relative z-10 py-8 px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5" >
        <div className="flex flex-col sm:flex-row items-center justify-center">

          <p className="text-xs text-gray-600">© 2024 FlowBolt. All rights reserved.</p>
        </div>
      </footer >
    </div >
  );
};
