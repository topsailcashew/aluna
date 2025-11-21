'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageCard } from './MessageCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LifeMessage } from '@/lib/types/life-messages';
import { cn } from '@/lib/utils';

interface MessageGridProps {
  messages: LifeMessage[];
  onMessagesChange: (messages: LifeMessage[]) => void;
  maxMessages?: number;
  selectedMessageId?: string | null;
  onMessageSelect?: (messageId: string) => void;
}

/**
 * Sortable message card wrapper
 */
function SortableMessageCard({
  message,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
}: {
  message: LifeMessage;
  onUpdate: (updates: Partial<LifeMessage>) => void;
  onDelete: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: message.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="min-w-[280px] sm:min-w-[320px]">
      <MessageCard
        message={message}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onSelect={onSelect}
        isSelected={isSelected}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

/**
 * Grid of message cards with drag-and-drop reordering
 */
export function MessageGrid({
  messages,
  onMessagesChange,
  maxMessages = 5,
  selectedMessageId,
  onMessageSelect,
}: MessageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = messages.findIndex((m) => m.id === active.id);
      const newIndex = messages.findIndex((m) => m.id === over.id);

      const reordered = arrayMove(messages, oldIndex, newIndex);
      // Update order property
      const updated = reordered.map((msg, idx) => ({ ...msg, order: idx }));
      onMessagesChange(updated);
    }
  };

  const handleAddMessage = () => {
    const newMessage: LifeMessage = {
      id: crypto.randomUUID(),
      source: '',
      message: '',
      moodTag: '😌 Neutral',
      confidence: 50,
      order: messages.length,
      createdAt: new Date(),
    };

    onMessagesChange([...messages, newMessage]);
  };

  const handleUpdateMessage = (id: string, updates: Partial<LifeMessage>) => {
    const updated = messages.map((msg) =>
      msg.id === id ? { ...msg, ...updates } : msg
    );
    onMessagesChange(updated);
  };

  const handleDeleteMessage = (id: string) => {
    const filtered = messages.filter((msg) => msg.id !== id);
    // Reorder remaining messages
    const reordered = filtered.map((msg, idx) => ({ ...msg, order: idx }));
    onMessagesChange(reordered);
  };

  const canAddMore = messages.length < maxMessages;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Messages</h2>
          <p className="text-sm text-muted-foreground">
            Add up to {maxMessages} messages. Drag to reorder.
          </p>
        </div>
        <Button
          onClick={handleAddMessage}
          disabled={!canAddMore}
          size="sm"
          aria-label="Add a new message"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Message
        </Button>
      </div>

      {/* Message Cards */}
      {messages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No messages yet. Add your first message to begin.</p>
          <Button onClick={handleAddMessage} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add First Message
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={messages.map((m) => m.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div
              className={cn(
                'flex gap-4 overflow-x-auto pb-4',
                'snap-x snap-mandatory scroll-smooth',
                '[&::-webkit-scrollbar]:h-2',
                '[&::-webkit-scrollbar-track]:bg-muted',
                '[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30',
                '[&::-webkit-scrollbar-thumb]:rounded-full'
              )}
              role="list"
              aria-label="Life messages"
            >
              {messages
                .sort((a, b) => a.order - b.order)
                .map((message) => (
                  <div key={message.id} className="snap-start" role="listitem">
                    <SortableMessageCard
                      message={message}
                      onUpdate={(updates) => handleUpdateMessage(message.id, updates)}
                      onDelete={() => handleDeleteMessage(message.id)}
                      onSelect={onMessageSelect ? () => onMessageSelect(message.id) : undefined}
                      isSelected={selectedMessageId === message.id}
                    />
                  </div>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Message Counter */}
      <p className="text-sm text-muted-foreground text-center">
        {messages.length} / {maxMessages} messages
      </p>
    </div>
  );
}
