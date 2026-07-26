"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintButton() {
  return (
    <Button 
      onClick={() => window.print()}
      className="bg-brand hover:bg-brand-deep text-white shadow-sm"
    >
      <Printer className="w-4 h-4 mr-2" />
      Print / Save PDF
    </Button>
  );
}
