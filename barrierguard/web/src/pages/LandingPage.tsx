import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Shield,
  Network,
  MapPin,
  Play,
  ArrowRight,
  ChevronDown,
  X,
  FileSearch,
  BarChart3,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wrench,
  Menu
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { OilLogo } from '../components/OilLogo';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeDemoStep, setActiveDemoStep] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* =========================================================================
          1. FLOATING NAVIGATION BAR
      ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-2.5 text-slate-900'
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200/50 py-3 text-slate-900 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Official Oil India Limited Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-95 transition">
            <OilLogo variant="dark" className="h-9" />
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <button
              onClick={() => scrollToSection('hero')}
              className="relative py-1 text-slate-900 hover:text-red-600 transition"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600 rounded-full" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="py-1 text-slate-600 hover:text-red-600 transition"
            >
              Features
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition hover:scale-[1.02]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3">
            <div className="flex flex-col gap-2 font-semibold text-sm text-slate-700">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-left py-1 text-red-600 font-bold"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-1 text-slate-700 hover:text-red-600"
              >
                Features
              </button>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 text-center py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 text-center py-2 rounded-full bg-blue-600 text-white text-xs font-bold"
                  >
                    Get Started →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 1: HERO SECTION (~90–100vh)
          Background: Two OIL Workers beside the Pumpjack (/hero_oil_workers.jpg)
      ========================================================================= */}
      <section
        id="hero"
        className="relative min-h-screen pt-24 sm:pt-28 pb-8 flex flex-col justify-between overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(11, 20, 42, 0.94) 0%, rgba(15, 23, 42, 0.82) 42%, rgba(15, 23, 42, 0.40) 70%, rgba(15, 23, 42, 0.22) 100%),
            radial-gradient(ellipse at center, transparent 40%, rgba(10, 15, 30, 0.55) 100%),
            url('/hero_oil_workers.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle Floating Right Element (over pumpjack / sky area) */}
        <div className="hidden lg:block absolute right-10 xl:right-20 top-36 select-none pointer-events-none -rotate-6 z-10">
          <div
            className="text-white/90 text-2xl xl:text-3xl leading-tight drop-shadow-md"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            <p className="tracking-wide">Energy</p>
            <p className="tracking-wide">People</p>
            <p className="tracking-wide">Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-[2px] bg-red-500 shadow-sm" />
              <p className="text-red-400 font-bold tracking-wide">Safer Together</p>
            </div>
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto z-10">
          <div className="max-w-2xl text-left space-y-4">
            {/* Small Eyebrow */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-[2.5px] bg-red-600 rounded-full" />
              <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-200 uppercase">
                SAFER PEOPLE. STRONGER TOMORROW.
              </span>
            </div>

            {/* Main Heading: Barrier in White, Guard in Red */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
              Barrier<span className="text-red-600">Guard</span>
            </h1>

            {/* Sub-Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              AI-led SIF Precursor Intelligence <br className="hidden sm:inline" />
              for a Safer OIL
            </h2>

            {/* Paragraph */}
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-xl pt-1">
              Turning everyday safety observations into early warnings — so HSE teams can identify serious injury and fatality potential before incidents escalate.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-700/30 transition-all hover:scale-[1.02]"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsDemoOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/40 backdrop-blur-sm text-sm font-semibold transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 text-white fill-white" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Bottom Section: Translucent Glass Statistics Bar & Scroll Indicator */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pt-6">
          {/* Glass Statistics Bar */}
          <div className="backdrop-blur-md bg-slate-900/50 border border-white/20 rounded-2xl p-4 sm:p-5 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-white/15">
              {/* Stat 1: Total Reports */}
              <div className="flex items-center gap-3.5 px-2 md:px-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                    752
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    Total Reports
                  </div>
                </div>
              </div>

              {/* Stat 2: SIF-Potential */}
              <div className="flex items-center gap-3.5 px-2 md:px-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
                    <span>197</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      26.2%
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    SIF-Potential
                  </div>
                </div>
              </div>

              {/* Stat 3: High-Risk Patterns */}
              <div className="flex items-center gap-3.5 px-2 md:px-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                    12
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    High-Risk Patterns
                  </div>
                </div>
              </div>

              {/* Stat 4: Priority Sites */}
              <div className="flex items-center gap-3.5 px-2 md:px-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                    5
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    Priority Sites
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center pt-5 pb-1">
            <button
              onClick={() => scrollToSection('features')}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition group focus:outline-none"
              aria-label="Scroll to features"
            >
              <div className="w-5 h-8 rounded-full border-2 border-white/60 flex items-start justify-center p-1 group-hover:border-white transition">
                <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/70 animate-pulse -mt-0.5" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                SCROLL TO SEE FEATURES
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FEATURES (~70–90vh)
          Clean White / Light Slate Background
      ========================================================================= */}
      <section id="features" className="bg-white text-slate-900 py-16 sm:py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-left space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[2.5px] bg-red-600 rounded-full" />
              <span className="text-xs font-bold tracking-widest text-slate-800 uppercase">
                KEY FEATURES
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              From Observations to <span className="text-red-600">Preventive Action</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base max-w-2xl pt-1">
              AI-powered insights to detect, prioritise and address SIF precursors across OIL operations.
            </p>
          </div>

          {/* 4 Minimal, Elegant Feature Cards in 1 Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {/* Feature 1: AI Analysis */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <FileSearch className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mt-4">
                  AI Analysis
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Extracts hazards, activities and barrier failures from free-text reports.
                </p>
              </div>
            </div>

            {/* Feature 2: SIF Classification */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mt-4">
                  SIF Classification
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Identifies reports with serious injury or fatality potential.
                </p>
              </div>
            </div>

            {/* Feature 3: Pattern Detection */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mt-4">
                  Pattern Detection
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Finds recurring precursor patterns across sites and activities.
                </p>
              </div>
            </div>

            {/* Feature 4: Proactive Alerts */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mt-4">
                  Proactive Alerts
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Flags emerging risks and drives timely HSE intervention.
                </p>
              </div>
            </div>
          </div>

          {/* Centered CTA */}
          <div className="mt-12 text-center">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 text-xs sm:text-sm font-bold transition-all shadow-sm hover:scale-[1.02]"
            >
              <span>Explore All Features</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bottom Right Tagline */}
          <div className="mt-16 pt-6 border-t border-slate-100 flex items-center justify-end gap-2.5 text-[11px] font-bold tracking-widest text-slate-400 uppercase select-none">
            <span>CONQUERING NEWER HORIZONS</span>
            <div className="w-6 h-[2px] bg-red-600" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIGHTWEIGHT "WATCH DEMO" MODAL
      ========================================================================= */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    SIF Precursor Analysis Workflow Demo
                  </h3>
                  <p className="text-xs text-slate-400">
                    How BarrierGuard processes free-text OIL reports into actionable alerts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-4 gap-2 my-5 text-center">
              {[
                { step: 1, label: '1. Ingest Report' },
                { step: 2, label: '2. NLP Extraction' },
                { step: 3, label: '3. SIF Scoring' },
                { step: 4, label: '4. Alert Dispatch' }
              ].map(({ step, label }) => (
                <button
                  key={step}
                  onClick={() => setActiveDemoStep(step)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg transition border ${
                    activeDemoStep === step
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 min-h-[170px] flex flex-col justify-between">
              {activeDemoStep === 1 && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>REPORT ID: OIL-REP-2026-0448</span>
                    <span>SITE: Duliajan Rig-04</span>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 font-sans italic leading-relaxed">
                    "During casing makeup on Rig-04, the hydraulic power tong snub line showed 3 severed wire strands under tension. Work suspended immediately before catastrophic snap."
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Submitted via Mobile App by Derrickman</span>
                  </div>
                </div>
              )}

              {activeDemoStep === 2 && (
                <div className="space-y-2.5 text-xs">
                  <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">
                    Extracted Operational Attributes
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Failed Barrier</div>
                      <div className="font-semibold text-red-400 mt-0.5 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Equipment Integrity / Snub Line</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Hazard Mechanism</div>
                      <div className="font-semibold text-amber-400 mt-0.5 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Stored Mechanical Tension</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoStep === 3 && (
                <div className="space-y-2.5 text-xs">
                  <div className="text-[11px] text-red-400 font-bold uppercase tracking-wider">
                    SIF Precursor Evaluation
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-red-500/20 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">SIF Potential: HIGH RISK</div>
                      <div className="text-[11px] text-slate-400">Score: 0.88 | Life-Saving Rule: Line of Fire</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-red-600 text-white font-black text-xs">
                      CRITICAL
                    </span>
                  </div>
                </div>
              )}

              {activeDemoStep === 4 && (
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Automated Intervention Action</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <p className="font-semibold text-white">Fleet Alert Generated:</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      "Mandatory magnetic particle inspection on all hydraulic tong snub lines across Duliajan asset within 24 hours."
                    </p>
                  </div>
                </div>
              )}

              {/* Step Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2">
                <button
                  disabled={activeDemoStep === 1}
                  onClick={() => setActiveDemoStep((prev) => Math.max(1, prev - 1))}
                  className="text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                >
                  ← Previous Step
                </button>
                <div className="text-[11px] text-slate-500">Step {activeDemoStep} of 4</div>
                <button
                  disabled={activeDemoStep === 4}
                  onClick={() => setActiveDemoStep((prev) => Math.min(4, prev + 1))}
                  className="text-xs text-blue-400 font-semibold hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next Step →
                </button>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDemoOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Close Demo
              </button>
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
              >
                <span>Launch Full Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
