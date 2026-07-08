import Image from "next/image";

interface GalleryItem {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  if (items.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.slice(0, 8).map((item, index) => {
        // Make the first item larger for visual interest
        const isFeatured = index === 0;
        return (
          <div 
            key={item.id} 
            className={`rounded-2xl overflow-hidden bg-slate-100 relative group cursor-pointer ${isFeatured ? 'col-span-2 row-span-2' : 'aspect-square'}`}
          >
            <Image 
              src={item.url} 
              alt={item.altText || "Gallery image"} 
              fill
              sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium line-clamp-2">{item.caption}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
