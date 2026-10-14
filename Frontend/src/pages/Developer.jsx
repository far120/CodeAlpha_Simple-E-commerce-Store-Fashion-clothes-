import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaCode, 
  FaServer, 
  FaDatabase, 
  FaExternalLinkAlt, 
  FaShieldAlt, 
  FaPalette, 
  FaRocket, 
  FaCheckCircle, 
  FaArrowRight, 
  FaGlobe,
  FaCopy
} from "react-icons/fa";
import { FiArrowLeft, FiStar, FiShoppingBag, FiTerminal, FiLayers } from "react-icons/fi";
import { useToast } from "../context/ToastContext";

export default function DeveloperPage() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // Social Links for Mostafa ELFAR
  const socialLinks = {
    github: "https://github.com/far120",
    linkedin: "https://www.linkedin.com/in/mostafa-mahmoud-elfar-6a67732b5/", 
    email: "mostafa.m.elfar@gmail.com",
    portfolio: "https://front-portfolio-mostafa-elfar.vercel.app/"
  };

  function handleCopyEmail() {
    navigator.clipboard.writeText(socialLinks.email);
    setCopied(true);
    toast.showSuccess("Email address copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  }

  const techSkills = [
    {
      category: "Frontend Engineering",
      icon: <FaCode className="text-amber-500 text-xl" />,
      skills: ["React 19", "JavaScript (ES6+)", "Vite", "Tailwind CSS v4", "HTML5 & Modern CSS3", "Responsive UI/UX"]
    },
    {
      category: "Backend Architecture",
      icon: <FaServer className="text-amber-500 text-xl" />,
      skills: ["Node.js", "Express.js", "RESTful APIs", "JWT Authentication", "RBAC Security", "Middleware Architecture"]
    },
    {
      category: "Database & Storage",
      icon: <FaDatabase className="text-amber-500 text-xl" />,
      skills: ["MongoDB", "Mongoose ODM", "Data Modeling", "Multer Asset Storage", "Seeding & Migration"]
    },
    {
      category: "Dev Tools & Operations",
      icon: <FiTerminal className="text-amber-500 text-xl" />,
      skills: ["Git & GitHub", "Winston & Morgan Logging", "Helmet Security", "Rate Limiting", "NPM & Environment Config"]
    }
  ];

  const projectFeatures = [
    {
      title: "Luxury E-Commerce Catalog",
      desc: "Interactive garment browsing with live search, price filtering, category mapping, and persistent shopping bag inventory synchronization.",
      icon: <FiShoppingBag className="text-amber-500 text-lg" />
    },
    {
      title: "Role-Based Access Control (RBAC)",
      desc: "Multi-tier security engine supporting User, Admin, and Manager permission levels with protected API routes and audit logging.",
      icon: <FaShieldAlt className="text-amber-500 text-lg" />
    },
    {
      title: "Dark & Light (White) Theme Engine",
      desc: "Custom Tailwind v4 theme switching mechanism supporting system preferences, persistent storage, and smooth DOM color transitions.",
      icon: <FaPalette className="text-amber-500 text-lg" />
    },
    {
      title: "Comprehensive Admin Dashboards",
      desc: "Full CRUD management portals for products, categories, brands, orders, user accounts, and system activity logs.",
      icon: <FiLayers className="text-amber-500 text-lg" />
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Top Banner & Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <FiArrowLeft className="text-sm" /> Return to Homepage
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
          
          {/* Decorative Background Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Developer Avatar & Badge */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-slate-800 p-1.5 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400 font-serif font-bold text-4xl sm:text-5xl border border-amber-500/40">
                    <span>ME</span>
                    <span className="text-[10px] font-sans font-semibold tracking-widest text-slate-400 uppercase mt-1">
                      Architect
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-1">
                  <FaRocket className="text-xs" />
                  <span>Lead Dev</span>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Creator & Full-Stack Architect
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
                  Mostafa ELFAR
                </h1>
                <p className="text-xs text-slate-400 font-light">
                  Software Engineer & Web Application Specialist
                </p>
              </div>
            </div>

            {/* Developer Bio & Quick Social Actions */}
            <div className="lg:col-span-8 space-y-6 text-slate-300">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <span>✨ Creator of Fashion Market E-Commerce</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                  Crafting Scalable, High-Performance Web Applications & Luxury User Experiences
                </h2>
                <p className="text-sm sm:text-base font-light text-slate-300 leading-relaxed">
                  Hi! I'm <strong className="text-white font-semibold">Mostafa ELFAR</strong>, a passionate Full-Stack Software Engineer dedicated to designing and engineering robust web platforms. I specialize in building complete end-to-end architectures — combining clean Node.js / Express micro-services with modern React 19 interfaces.
                </p>
              </div>

              {/* Social Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md hover:scale-105 active:scale-95 border border-slate-700"
                >
                  <FaGithub className="text-lg text-amber-400" />
                  <span>GitHub Profile</span>
                  <FaExternalLinkAlt className="text-[10px] text-slate-400" />
                </a>

                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <FaLinkedin className="text-lg" />
                  <span>LinkedIn Profile</span>
                  <FaExternalLinkAlt className="text-[10px] text-blue-200" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <FaEnvelope className="text-base" />
                  <span>{copied ? "Email Copied!" : "Contact Email"}</span>
                  <FaCopy className="text-xs" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Technical Skillset & Stack
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Technologies and frameworks utilized by Mostafa ELFAR to build modern software solutions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techSkills.map((stack) => (
            <div
              key={stack.category}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  {stack.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                  {stack.category}
                </h3>
                <ul className="space-y-2">
                  {stack.skills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <FaCheckCircle className="text-amber-500 text-[11px] shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Architecture Showcase: Fashion Market */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-xl space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Featured Engineering Project
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                Fashion Market E-Commerce Platform
              </h2>
            </div>
            <Link
              to="/menu"
              className="px-6 py-3 rounded-full bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:shadow-lg transition-all w-fit"
            >
              <span>Explore Live Platform</span>
              <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-stone-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10">
                    {feature.icon}
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light pl-11">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Connect & Social CTA Card */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-8 sm:p-12 text-center space-y-6 shadow-2xl border border-amber-500/30">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">
            Connect & Collaborate with Mostafa ELFAR
          </h2>
          <p className="text-sm text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Interested in building high-impact software, exploring full-stack engineering collaborations, or discussing web architecture? Connect directly via GitHub or LinkedIn.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <FaGithub className="text-lg" />
              <span>GitHub Directory</span>
            </a>

            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <FaLinkedin className="text-lg" />
              <span>LinkedIn Profile</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
