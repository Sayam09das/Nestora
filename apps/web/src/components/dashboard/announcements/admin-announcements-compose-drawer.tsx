'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  COMPOSE_CATEGORIES,
  COMPOSE_SCOPES,
  type NoticeCategory,
  type NoticeScope,
} from '@/components/dashboard/announcements/admin-announcements-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function AdminAnnouncementsComposeDrawer({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('General');
  const [scope, setScope] = useState<NoticeScope>('University-wide');
  const [requiresAck, setRequiresAck] = useState(false);
  const [publishAt, setPublishAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setBody('');
      setCategory('General');
      setScope('University-wide');
      setRequiresAck(false);
      setPublishAt('');
      setExpiresAt('');
    }
  }, [open]);

  const publish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and description are required (FR-086).');
      return;
    }
    toast.success(`Notice "${title}" queued for publish (sample UI).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Compose announcement</SheetTitle>
          <SheetDescription>University-wide or hostel-scoped. Attachments would upload via API.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={cn('rounded-xl', focusRing)} placeholder="Notice headline" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Description</span>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className={cn('rounded-xl', focusRing)}
              placeholder="Rich text body…"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
              >
                {COMPOSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">Scope</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as NoticeScope)}
                className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
              >
                {COMPOSE_SCOPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <PublishScheduleFields publishAt={publishAt} setPublishAt={setPublishAt} expiresAt={expiresAt} setExpiresAt={setExpiresAt} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requiresAck}
              onChange={(e) => setRequiresAck(e.target.checked)}
              className={cn('size-4 rounded border', focusRing)}
            />
            Requires acknowledgement (FR-088)
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:justify-between">
          <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} onClick={() => onOpenChange(false)}>
            Save draft
          </Button>
          <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={publish}>
            Publish notice
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PublishScheduleFields({
  publishAt,
  setPublishAt,
  expiresAt,
  setExpiresAt,
}: {
  publishAt: string;
  setPublishAt: (v: string) => void;
  expiresAt: string;
  setExpiresAt: (v: string) => void;
}) {
  const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block space-y-1">
        <span className="text-xs font-medium">Publish at</span>
        <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={cn('rounded-xl', focusRing)} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium">Expires (optional)</span>
        <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={cn('rounded-xl', focusRing)} />
      </label>
    </div>
  );
}
