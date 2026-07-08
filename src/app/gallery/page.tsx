import { getPublicGallery } from "@/features/public/queries/getPublicGallery";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Camera, Folder, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PublicHero } from "@/components/ui/public/PublicHero";
import { PublicSection } from "@/components/ui/public/PublicSection";

export default async function GalleryPage() {
  const data = await getPublicGallery();

  if (data.error) {
    return <div className="p-20 text-center text-slate-500">Failed to load gallery data.</div>;
  }

  const albums = data.albums || [];

  return (
    <main className="min-h-screen bg-background pb-16">
      <PublicHero 
        badge="Our Memories"
        title="Photo Gallery"
        description="Explore photo albums from our community service projects and fellowship events."
      />
      <PublicSection background="white">
        <div className="py-16 flex-1">
        {albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album: any) => {
              const coverImage = album.media?.[0]?.url;
              return (
                <div key={album.id} className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
                    {coverImage ? (
                      <img 
                        src={coverImage} 
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <Folder className="w-16 h-16 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="p-5 relative">
                    <div className="absolute -top-5 right-5 bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-100 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {album._count.media} Photos
                    </div>
                    
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-pink-600 transition-colors mb-2">
                      {album.title}
                    </h3>
                    
                    {album.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {album.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-auto">
                      {album.project && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                          {album.project.title}
                        </Badge>
                      )}
                      {album.event && !album.project && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                          {album.event.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto mt-12">
            <Camera className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Albums Yet</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Photo albums will automatically appear here once created.
            </p>
          </div>
        )}
        </div>
      </PublicSection>
    </main>
  );
}
