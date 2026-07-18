"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripHorizontal, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { updateMemories } from "@/features/gallery/actions/updateMemories";
import { updateMediaTitle } from "@/features/media/actions/updateMediaTitle";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MediaItem {
  id: string;
  url: string;
  title: string | null;
  showOnHomepage: boolean;
  sortOrder: number;
}

interface MemoriesClientProps {
  initialMedia: MediaItem[];
  initialLayout: string;
  initialLimit: number;
}

const SortableItem = ({
  item,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  item: MediaItem;
  onToggle: (id: string, state: boolean) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(item.title || "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleTitleSave = async () => {
    const trimmed = titleValue.trim();
    setIsEditingTitle(false);
    if (trimmed === (item.title || "")) return;
    setIsSavingTitle(true);
    const res = await updateMediaTitle(item.id, trimmed);
    setIsSavingTitle(false);
    if (res.error) {
      toast.error(res.error);
      setTitleValue(item.title || "");
    } else {
      toast.success("Title updated");
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="aspect-[4/3] w-full relative bg-slate-100">
        <Image src={item.url} alt="Memory" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className="absolute top-2 left-2 flex gap-1">
          <button
            type="button"
            className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white sm:hidden"
            onClick={() => onMoveUp(item.id)}
            disabled={isFirst}
          >
            <ArrowUp className="w-4 h-4 text-slate-700" />
          </button>
          <button
            type="button"
            className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white sm:hidden"
            onClick={() => onMoveDown(item.id)}
            disabled={isLast}
          >
            <ArrowDown className="w-4 h-4 text-slate-700" />
          </button>
        </div>
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={() => onToggle(item.id, !item.showOnHomepage)}
            className={`p-2 rounded-full shadow-sm backdrop-blur-md transition ${item.showOnHomepage ? "bg-brand/90 text-white" : "bg-white/90 text-slate-500 hover:text-slate-700"}`}
          >
            {item.showOnHomepage ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition sm:block hidden">
          <div {...attributes} {...listeners} className="p-2 bg-white/90 rounded-full shadow-sm cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-900">
            <GripHorizontal className="w-5 h-5" />
          </div>
        </div>
      </div>
      {isEditingTitle ? (
        <Input
          autoFocus
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setTitleValue(item.title || "");
              setIsEditingTitle(false);
            }
          }}
          className="h-7 text-xs m-2 w-[calc(100%-1rem)]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditingTitle(true)}
          disabled={isSavingTitle}
          className="group/title flex items-center gap-1 w-full text-left px-2.5 py-1.5"
        >
          <span className="text-xs text-slate-600 truncate font-medium">
            {isSavingTitle ? "Saving…" : item.title || "Untitled"}
          </span>
          {!isSavingTitle && (
            <Pencil className="w-3 h-3 text-slate-300 group-hover/title:text-slate-500 shrink-0" />
          )}
        </button>
      )}
    </div>
  );
};

export default function MemoriesClient({ initialMedia, initialLayout, initialLimit }: MemoriesClientProps) {
  const [items, setItems] = useState(initialMedia);
  useEffect(() => setItems(initialMedia), [initialMedia]);
  const [layout, setLayout] = useState(initialLayout);
  useEffect(() => setLayout(initialLayout), [initialLayout]);
  const [limit, setLimit] = useState(initialLimit);
  useEffect(() => setLimit(initialLimit), [initialLimit]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      const promise = updateMemories({ orderedIds: newItems.map((i) => i.id) });
      toast.promise(promise, {
        loading: "Saving order...",
        success: "Order saved!",
        error: "Failed to save order",
      });
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const index = items.findIndex((i) => i.id === id);
    if (direction === "up" && index > 0) {
      const newItems = arrayMove(items, index, index - 1);
      setItems(newItems);
      await updateMemories({ orderedIds: newItems.map((i) => i.id) });
    } else if (direction === "down" && index < items.length - 1) {
      const newItems = arrayMove(items, index, index + 1);
      setItems(newItems);
      await updateMemories({ orderedIds: newItems.map((i) => i.id) });
    }
  };

  const handleToggle = async (id: string, state: boolean) => {
    setItems((items) => items.map((i) => (i.id === id ? { ...i, showOnHomepage: state } : i)));
    const res = await updateMemories({ toggledMediaId: id, toggledState: state });
    if (res.error) {
      // Roll back — the optimistic flip didn't actually persist.
      setItems((items) => items.map((i) => (i.id === id ? { ...i, showOnHomepage: !state } : i)));
      toast.error(res.error);
    } else {
      toast.success("Updated homepage visibility!");
    }
  };

  const handleLayoutChange = async (newLayout: string) => {
    setLayout(newLayout);
    const promise = updateMemories({ layout: newLayout });
    toast.promise(promise, {
      loading: "Saving layout...",
      success: "Layout saved!",
      error: "Failed to save layout",
    });
  };

  const handleLimitChange = async (newLimit: number) => {
    const clamped = Math.min(20, Math.max(1, newLimit));
    setLimit(clamped);
    const promise = updateMemories({ limit: clamped });
    toast.promise(promise, {
      loading: "Saving...",
      success: "Homepage photo count saved!",
      error: "Failed to save photo count",
    });
  };

  const homepageCount = items.filter((i) => i.showOnHomepage).length;
  const overLimit = homepageCount > limit;

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Homepage Layout</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "masonry", label: "Masonry", desc: "Dynamic staggered grid" },
            { id: "grid", label: "Uniform Grid", desc: "Equal square tiles" },
            { id: "filmstrip", label: "Filmstrip", desc: "Horizontal scrolling" },
          ].map((l) => (
            <label key={l.id} className={`cursor-pointer flex flex-col border rounded-lg p-4 transition-colors ${layout === l.id ? "border-brand bg-brand/5" : "border-slate-200 hover:border-brand/50"}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="layout" value={l.id} checked={layout === l.id} onChange={() => handleLayoutChange(l.id)} className="text-brand focus:ring-brand" />
                <span className="font-medium text-slate-900">{l.label}</span>
              </div>
              <p className="text-sm text-slate-500 mt-2 ml-7">{l.desc}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-1">Homepage photo count</h3>
        <p className="text-sm text-slate-500 mb-4">
          The homepage section shows at most this many photos, taken in order from the ones you've
          marked "on homepage" below.
        </p>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            max={20}
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value) || 1)}
            className="w-24"
          />
          <span className="text-sm text-slate-500">photos max</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Manage Memories</h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${overLimit ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
            {homepageCount} of {items.length} on homepage
            {overLimit && ` — only the first ${limit} will show`}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
            No memories uploaded yet. Upload images to the Memories album first.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item, idx) => (
                  <SortableItem 
                    key={item.id} 
                    item={item} 
                    onToggle={handleToggle} 
                    onMoveUp={(id) => moveItem(id, "up")}
                    onMoveDown={(id) => moveItem(id, "down")}
                    isFirst={idx === 0}
                    isLast={idx === items.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
