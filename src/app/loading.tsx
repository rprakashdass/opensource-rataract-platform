import { Skeleton } from "@/components/ui/skeleton";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

export default function Loading() {
  return (
    <div className="min-h-screen bg-paper flex flex-col pt-24 pb-32">
      <MaxWidthWrapper className="flex-1 w-full space-y-12">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-16 w-3/4 max-w-2xl" />
          <Skeleton className="h-4 w-2/3 max-w-xl" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="aspect-square rounded-2xl hidden md:block" />
          <Skeleton className="aspect-square rounded-2xl hidden lg:block" />
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
