"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  BookOpen,
  Globe,
  Share2,
  Radio,
  Mic2,
  Wrench,
  UserPlus,
  Computer,
  CheckCircle2,
  HeartHandshake
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { LucideIcon } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export interface Domain {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  activities: string[];
}

export const domains: Domain[] = [
  {
    id: "community",
    icon: HeartHandshake,
    title: "Community Services",
    description: "Lead initiatives that make a direct impact in local communities through service and outreach programs.",
    activities: [
      "Organize cleanliness drives",
      "Host community health camps",
      "Distribute essential supplies"
    ]
  },
  {
    id: "international",
    icon: Globe,
    title: "International Services",
    description: "Foster global understanding through international collaboration and cultural exchange.",
    activities: [
      "Coordinate global Rotaract collaborations",
      "Promote cultural exchange",
      "Support international causes"
    ]
  },
  {
    id: "pr",
    icon: Share2,
    title: "Public Relations",
    description: "Enhance the club's visibility and reputation through strategic communication and media outreach.",
    activities: [
      "Manage public image",
      "Write press releases",
      "Handle external communications"
    ]
  },
  {
    id: "literary",
    icon: BookOpen,
    title: "Literary Services",
    description: "Encourage literary expression and intellectual engagement through various activities.",
    activities: [
      "Host debates and quizzes",
      "Organize writing competitions",
      "Conduct reading circles"
    ]
  },
  {
    id: "club",
    icon: UserPlus,
    title: "Club Services",
    description: "Facilitate smooth internal functioning and foster fellowship within the club.",
    activities: [
      "Organize member induction",
      "Host internal events",
      "Maintain club harmony"
    ]
  },
  {
    id: "management",
    icon: Users,
    title: "Management Services",
    description: "Oversee planning and implementation of club projects and ensure operational excellence.",
    activities: [
      "Supervise logistics",
      "Monitor event timelines",
      "Coordinate with service chairs"
    ]
  },
  {
    id: "professional",
    icon: Briefcase,
    title: "Professional Development",
    description: "Empower members through career-oriented workshops, seminars, and industry exposure.",
    activities: [
      "Host skill-building sessions",
      "Organize internships and networking",
      "Conduct mentorship programs"
    ]
  },
  {
    id: "arts",
    icon: Mic2,
    title: "Performing Arts",
    description: "Promote creativity through cultural performances and artistic expression.",
    activities: [
      "Organize dance and music events",
      "Coordinate talent shows",
      "Promote art-based outreach"
    ]
  },
  {
    id: "social",
    icon: Radio,
    title: "Social Media Services",
    description: "Engage audiences and promote the club's work on social platforms.",
    activities: [
      "Create and schedule posts",
      "Run awareness campaigns",
      "Analyze social engagement"
    ]
  },
  {
    id: "tech",
    icon: Wrench,
    title: "Technical Services",
    description: "Support all tech-based operations and ensure smooth event execution with digital tools.",
    activities: [
      "Maintain tech infrastructure",
      "Provide event tech support",
      "Develop internal tools"
    ]
  },
  {
    id: "media",
    icon: Computer,
    title: "Media Services",
    description: "Create and distribute engaging visual content to promote the club's initiatives and activities.",
    activities: [
      "Produce event highlights",
      "Design promotional graphics",
      "Manage club photography"
    ]
  }
];

export default function AboutUs() {
  const [activeDomain, setActiveDomain] = useState<Domain>(domains[0]);

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-32 pb-16">
      <MaxWidthWrapper className="py-2 space-y-10 lg:py-6 lg:space-y-14">
        <motion.div variants={fadeIn}>
          <div className="max-w-2xl space-y-4 mb-8">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Who We Are
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
              About Us
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At our Rotaract Club, we strive to create a better world through volunteerism, community service, and professional development.
            </p>
          </div>
        </motion.div>

        {/* Mission — image on top on mobile, side by side on lg */}
        <motion.div
          variants={fadeIn}
          className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center"
        >
          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
              alt="Rotaract Club volunteers"
              width={400}
              height={400}
              className="h-auto w-full max-w-md rounded-lg object-cover"
              priority
            />
          </motion.div>
          <Card className="border-none bg-background/50 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight sm:text-3xl">
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm sm:text-base">
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-background pt-32 pb-16">
      <MaxWidthWrapper className="py-2 space-y-20 lg:py-6">
        
        {/* HERO SECTION */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn} 
          className="text-center max-w-3xl mx-auto space-y-6 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-200/50 rounded-full blur-3xl -z-10" />
          <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
            ✨ Who We Are
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
            Service Above <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Self.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            At our Rotaract Club, we strive to create a better world through volunteerism, community service, and professional development.
          </p>
        </motion.div>

        {/* MISSION & PARENT CLUB */}
        <div className="grid gap-12 lg:gap-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="grid gap-8 lg:grid-cols-2 lg:items-center"
          >
            <div className="relative group overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                alt="Rotaract Club volunteers"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white text-2xl font-bold">Making an Impact</h3>
                <p className="text-white/80">Together we achieve more.</p>
              </div>
            </div>
            <div className="space-y-6 lg:pl-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At our Rotaract Club, we function as a service-oriented
                organization that strives to create a better world through
                volunteerism, community service, and professional development.
                We are a part of the global network of Rotaract clubs sponsored
                by Rotary International, which gives us access to a wealth of
                resources and opportunities for growth.
              </p>
            </div>
          </motion.div>

        {/* Parent Club — reverse order on mobile so text comes first */}
        <motion.div
          variants={fadeIn}
          className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center"
        >
          <Card className="border-none bg-background/50 shadow-none order-1 lg:order-none">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight sm:text-3xl">
                Parent Club
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm sm:text-base">
                Our Rotaract Club is proudly sponsored by our parent Rotary Club.
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="grid gap-8 lg:grid-cols-2 lg:items-center"
          >
            <div className="space-y-6 lg:pr-10 order-2 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Parent Club</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our Rotaract Club is proudly sponsored by our parent Rotary Club. 
                Through this partnership, they nurture and support the young
                leaders of our Rotaract Club, empowering us to create a
                positive impact in our community and beyond. Together, we work
                hand in hand to foster a spirit of service, fellowship, and
                social responsibility, making a meaningful difference in the
                lives of those we touch.
              </p>
            </CardContent>
          </Card>
          <motion.div
            className="flex justify-center order-2 lg:order-none"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"
              alt="Rotary Partnership Logo"
              width={400}
              height={400}
              className="h-auto w-full max-w-md rounded-lg object-cover"
            />
            </div>
            <div className="relative group overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"
                alt="Rotary Partnership Logo"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white text-2xl font-bold">Guided by Experience</h3>
                <p className="text-white/80">Sponsored by Rotary International.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Domains grid */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Our Domains</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
        {/* INTERACTIVE DOMAINS SECTION */}
        <section className="space-y-10 pt-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-gray-900">Our 11 Domains</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We work across 12 distinctive domains to attain our common goal of
              Service above Self, exploring the power of teamwork and providing
              humanitarian aid.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {domains.map((domain, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center space-x-3 sm:space-x-4 pb-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <domain.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <CardTitle className="text-base sm:text-xl">{domain.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground text-sm">{domain.description}</p>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-muted-foreground">
                    {domain.activities.map((activity, i) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                  <Link href={`/about/domains/${domain.title.toLowerCase().replace(/\s+/g, "-")}`} prefetch>
                    <Button variant="link" className="p-0 h-auto text-primary hover:underline text-sm">
                      Learn More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}

          <div className="flex flex-col lg:flex-row gap-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-3xl p-4 lg:p-8 overflow-hidden relative">
            {/* Left: Tab List */}
            <div className="flex-shrink-0 lg:w-80 flex gap-2 lg:flex-col overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
              {domains.map((domain) => {
                const isActive = activeDomain.id === domain.id;
                const Icon = domain.icon;
                return (
                  <button
                    key={domain.id}
                    onClick={() => setActiveDomain(domain)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 whitespace-nowrap lg:whitespace-normal ${
                      isActive 
                      ? "bg-purple-50 text-purple-700 shadow-sm border border-purple-100" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                    <span className="text-sm">{domain.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Content Pane */}
            <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 lg:p-10 border border-gray-100 relative min-h-[350px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDomain.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="inline-flex p-3 rounded-2xl bg-purple-100 text-purple-700">
                    <activeDomain.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{activeDomain.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {activeDomain.description}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Key Activities</h4>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {activeDomain.activities.map((activity, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

      </MaxWidthWrapper>
    </div>
  );
}
