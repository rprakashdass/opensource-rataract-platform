import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import JoinUsForm from "./_components/JoinUsForm";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";

export default async function JoinPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <MaxWidthWrapper>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Join {club.name}</h1>
            <p className="text-lg text-slate-500 font-medium">
              We are a network of young leaders committed to making a difference in our community and the world. 
              Fill out the form below and our board will get in touch with you!
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
            <JoinUsForm clubId={club.id} />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
