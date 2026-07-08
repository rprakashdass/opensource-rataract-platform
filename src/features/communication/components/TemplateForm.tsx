"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailTemplateType } from "@prisma/client";
import { saveTemplate } from "../actions/saveTemplate";
import { toast } from "sonner";

interface TemplateFormProps {
  type: EmailTemplateType;
  initialSubject: string;
  initialBody: string;
  initialEnabled: boolean;
  label: string;
}

export function TemplateForm({ type, initialSubject, initialBody, initialEnabled, label }: TemplateFormProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await saveTemplate({ type, subjectTemplate: subject, bodyTemplate: body, enabled });
    setSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Template saved successfully");
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">{label}</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor={`enable-${type}`} className="text-sm text-gray-600">Enabled</Label>
          <input type="checkbox" id={`enable-${type}`} checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Subject</Label>
        <Input 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="e.g. New Event: {{eventName}}"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Body (HTML allowed)</Label>
        <Textarea 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <p className="text-xs text-gray-500">
          Variables: <code className="bg-gray-100 px-1 rounded">{"{{clubName}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{memberName}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{eventName}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{eventDate}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{venue}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{link}}"}</code>
        </p>
        <Button onClick={handleSave} disabled={saving} variant="secondary">
          {saving ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </div>
  );
}
