"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentUpload } from "@/components/ui/document-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { initializeClub } from "./actions";

export default function SetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [clubName, setClubName] = useState("");
  const [district, setDistrict] = useState("");
  const [tenureYear, setTenureYear] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("clubName", clubName);
      formData.append("district", district);
      formData.append("tenureYear", tenureYear);
      if (logoUrl) formData.append("logoUrl", logoUrl);

      formData.append("adminName", adminName);
      formData.append("adminEmail", adminEmail);
      formData.append("adminPassword", adminPassword);

      const result = await initializeClub(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Rotaract Platform Setup
          </h1>
          <p className="text-slate-600">Welcome! Let's get your club configured.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>First-Run Configuration</CardTitle>
            <CardDescription>
              This setup is required because no club exists in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Club Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Club Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Club Name *</Label>
                    <Input 
                      id="clubName"
                      required
                      placeholder="e.g. Rotaract Club of Tech City"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Rotary District *</Label>
                    <Input 
                      id="district"
                      required
                      placeholder="e.g. 3141"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenureYear">Rotary Year *</Label>
                  <Input 
                    id="tenureYear"
                    required
                    placeholder="e.g. 2024-25"
                    value={tenureYear}
                    onChange={(e) => setTenureYear(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Club Logo (Optional)</Label>
                  <DocumentUpload
                    value={logoUrl}
                    onChange={setLogoUrl}
                    type="CLUB_ASSET"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Initial Admin */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Super Admin Account</h3>
                <p className="text-sm text-slate-500 mb-4">
                  This user will have full access to configure the platform.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name *</Label>
                  <Input 
                    id="adminName"
                    required
                    placeholder="John Doe"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email / Login ID *</Label>
                    <Input 
                      id="adminEmail"
                      type="email"
                      required
                      placeholder="admin@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password *</Label>
                    <Input 
                      id="adminPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Initializing Platform..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
