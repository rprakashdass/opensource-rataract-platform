import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  clubName: string;
  missionStatement: string | null;
  tenureYear: string | null;
  ctaText?: string | null;
}

export function Hero({ clubName, missionStatement, tenureYear, ctaText }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAFAFA]">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-rose-100 via-transparent to-transparent" />
      
      <MaxWidthWrapper className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 mb-6 px-4 py-1.5 text-sm rounded-full border-none shadow-sm">
                Rotary Year {tenureYear}
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                {missionStatement || "Empowering young leaders to create positive change."}
              </h1>
              <p className="text-lg text-slate-500 mt-6 font-medium">
                We are {clubName}. A community of passionate students and young professionals dedicated to service, fellowship, and personal growth.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link href="/join">
                <Button className="w-full sm:w-auto rounded-full px-8 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5">
                  <Heart className="w-5 h-5 mr-2" /> {ctaText || "Become a Member"}
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg border-2 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  See Our Impact
                </Button>
              </Link>
            </div>
          </div>

          {/* Photo Collage */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full hidden md:block">
            <div className="absolute top-[10%] left-0 w-2/3 h-[50%] rounded-3xl overflow-hidden shadow-2xl z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=800" alt="Volunteers" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-cover" />
            </div>
            <div className="absolute bottom-[5%] right-0 w-[60%] h-[55%] rounded-3xl overflow-hidden shadow-2xl z-20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800" alt="Community Service" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute top-[5%] right-[10%] w-[30%] h-[35%] rounded-2xl overflow-hidden shadow-xl z-0 transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <Image src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800" alt="Club Meeting" fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover" />
            </div>
          </div>

        </div>
      </MaxWidthWrapper>
    </section>
  );
}
