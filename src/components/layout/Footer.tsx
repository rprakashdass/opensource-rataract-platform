import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Linkedin,
} from "lucide-react";
import MaxWidthWrapper from "../wrappers/MaxWidthWrapper";

const footerLinks = {
  about: [
    { name: "Rotaract", href: "https://www.rotary.org/en" },
    { name: "Rotary", href: "https://www.rotary.org/en" },
    { name: "Club History", href: "/our-archive" },
    { name: "Our Events", href: "/events" },
  ],
  team: [
    { name: "Team Page", href: "/team" },
    { name: "Board Council", href: "/team/#boardCouncil" },
    { name: "Board of Directors", href: "/team/#boardOfDirectors" },
    { name: "Past Tenures", href: "/our-archive" },
  ],
  documents: [
    { name: "Newsletters", href: "/newsletter" },
  ],
};

export default function Footer() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";
  const orgSubName = process.env.NEXT_PUBLIC_ORG_SUB_NAME || "District & Club Platform";
  const orgDescription = process.env.NEXT_PUBLIC_ORG_DESCRIPTION || "We function as a service-oriented organization that strives to create a better world through volunteerism, community service, and professional development.";
  const orgInstagram = process.env.NEXT_PUBLIC_ORG_INSTAGRAM || "https://instagram.com/rotaract";
  const orgLinkedin = process.env.NEXT_PUBLIC_ORG_LINKEDIN || "https://linkedin.com/company/rotaract";

  const socialLinks = [
    { icon: Instagram, href: orgInstagram, name: "Instagram" },
    { icon: Linkedin, href: orgLinkedin, name: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-primary/10 bg-white dark:bg-black">
      <MaxWidthWrapper>
        <div className="w-full py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-6 items-start">
            {/* Brand block */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="inline-flex items-center gap-3">
                <Image
                  src="/favicon.ico"
                  alt="Rotaract Club Logo"
                  width={64}
                  height={64}
                  className="hover:rotate-12 transition-transform duration-300"
                />
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-950 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">{appName}</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                    {orgSubName}
                  </p>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {orgDescription}
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={index}
                      href={social.href}
                      className="text-muted-foreground hover:text-primary hover:border-primary transition-all p-2.5 rounded-full border border-primary/10 hover:scale-115"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Links Block */}
            <div className="lg:col-span-4 grid gap-8 sm:grid-cols-3">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">About</h3>
                <ul className="space-y-3">
                  {footerLinks.about.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Team</h3>
                <ul className="space-y-3">
                  {footerLinks.team.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Documents</h3>
                <ul className="space-y-3">
                  {footerLinks.documents.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
