import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StoryCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  status: string;
  imageUrl: string;
}

export function StoryCard({ slug, title, description, category, status, imageUrl }: StoryCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm border-none shadow-sm">{category}</Badge>
          {status === "ACTIVE" && <Badge className="bg-emerald-500 text-white border-none shadow-sm">Ongoing</Badge>}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">{description}</p>
        <div className="flex items-center text-amber-600 font-bold text-sm mt-auto">
          Read Story <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
