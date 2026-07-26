import { DashboardSkeleton } from "@/components/ui/motion/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <DashboardSkeleton />
    </div>
  );
}
