"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LOCATION_OPTIONS,
  ACTIVITY_OPTIONS,
  TRIGGER_OPTIONS,
  PEOPLE_OPTIONS,
  getCurrentTimeOfDay,
  getTimeOfDayEmoji,
} from "@/lib/constants/context-options";
import type { ContextTags } from "@/lib/types";
import { X, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextTagsSelectorProps {
  value: ContextTags;
  onChange: (tags: ContextTags) => void;
  className?: string;
}

/**
 * Context Tags Selector - Step 4 of Check-in Form
 * Allows users to add contextual information about their check-in:
 * - Location (single selection)
 * - Activities (multi-select)
 * - Triggers (multi-select)
 * - People (single selection)
 * - Time of day (auto-detected, can override)
 */
export function ContextTagsSelector({
  value,
  onChange,
  className,
}: ContextTagsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [customTrigger, setCustomTrigger] = useState("");

  // Initialize with current time of day if not set
  const timeOfDay = value.timeOfDay || getCurrentTimeOfDay();

  const updateContext = (updates: Partial<ContextTags>) => {
    onChange({ ...value, ...updates });
  };

  // Activity handlers
  const toggleActivity = (activityId: string) => {
    const current = value.activity || [];
    const updated = current.includes(activityId)
      ? current.filter((id) => id !== activityId)
      : [...current, activityId];
    updateContext({ activity: updated });
  };

  const addCustomActivity = () => {
    if (customActivity.trim()) {
      const current = value.activity || [];
      updateContext({ activity: [...current, customActivity.trim()] });
      setCustomActivity("");
    }
  };

  // Trigger handlers
  const toggleTrigger = (triggerId: string) => {
    const current = value.triggers || [];
    const updated = current.includes(triggerId)
      ? current.filter((id) => id !== triggerId)
      : [...current, triggerId];
    updateContext({ triggers: updated });
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim()) {
      const current = value.triggers || [];
      updateContext({ triggers: [...current, customTrigger.trim()] });
      setCustomTrigger("");
    }
  };

  // Filter options by search
  const filteredActivities = searchQuery
    ? ACTIVITY_OPTIONS.filter((a) =>
        a.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ACTIVITY_OPTIONS;

  const filteredTriggers = searchQuery
    ? TRIGGER_OPTIONS.filter((t) =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TRIGGER_OPTIONS;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">What&apos;s the context?</h2>
        <p className="text-muted-foreground">
          Help us understand what&apos;s happening around you (all optional)
        </p>
      </div>

      <Tabs defaultValue="location" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="location">
            Location
            {value.location && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity
            {value.activity && value.activity.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {value.activity.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="triggers">
            Triggers
            {value.triggers && value.triggers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {value.triggers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="people">
            People
            {value.people && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Where are you?</CardTitle>
              <CardDescription>Select your current location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LOCATION_OPTIONS.map((location) => (
                  <Button
                    key={location.id}
                    type="button"
                    variant={
                      value.location === location.id ? "default" : "outline"
                    }
                    className="justify-start h-auto py-3"
                    onClick={() => updateContext({ location: location.id })}
                  >
                    <span className="text-xl mr-2">{location.emoji}</span>
                    <span className="text-sm">{location.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>{getTimeOfDayEmoji(new Date().getHours())}</span>
                Time of Day
              </CardTitle>
              <CardDescription>
                Auto-detected: <strong>{timeOfDay.replace("_", " ")}</strong>
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                What are you doing?
              </CardTitle>
              <CardDescription>
                Select all activities that apply
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filteredActivities.map((activity) => {
                  const isSelected = value.activity?.includes(activity.id);
                  return (
                    <Badge
                      key={activity.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-accent text-sm py-1.5 px-3"
                      onClick={() => toggleActivity(activity.id)}
                    >
                      <span className="mr-1">{activity.emoji}</span>
                      {activity.label}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="custom-activity" className="text-sm">
                  Add custom activity
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="custom-activity"
                    placeholder="e.g., gardening, painting..."
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomActivity();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={addCustomActivity}
                    disabled={!customActivity.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                What triggered this?
              </CardTitle>
              <CardDescription>
                Identify what led to these feelings (if anything)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search triggers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-4">
                {/* Negative Triggers */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Challenging
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filteredTriggers
                      .filter((t) => t.valence === "negative")
                      .map((trigger) => {
                        const isSelected = value.triggers?.includes(trigger.id);
                        return (
                          <Badge
                            key={trigger.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer hover:bg-accent text-sm py-1.5 px-3"
                            onClick={() => toggleTrigger(trigger.id)}
                          >
                            <span className="mr-1">{trigger.emoji}</span>
                            {trigger.label}
                            {isSelected && <X className="ml-1 h-3 w-3" />}
                          </Badge>
                        );
                      })}
                  </div>
                </div>

                {/* Positive Triggers */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Uplifting
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filteredTriggers
                      .filter((t) => t.valence === "positive")
                      .map((trigger) => {
                        const isSelected = value.triggers?.includes(trigger.id);
                        return (
                          <Badge
                            key={trigger.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer hover:bg-accent text-sm py-1.5 px-3"
                            onClick={() => toggleTrigger(trigger.id)}
                          >
                            <span className="mr-1">{trigger.emoji}</span>
                            {trigger.label}
                            {isSelected && <X className="ml-1 h-3 w-3" />}
                          </Badge>
                        );
                      })}
                  </div>
                </div>

                {/* Neutral Triggers */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Neutral
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filteredTriggers
                      .filter((t) => t.valence === "neutral")
                      .map((trigger) => {
                        const isSelected = value.triggers?.includes(trigger.id);
                        return (
                          <Badge
                            key={trigger.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer hover:bg-accent text-sm py-1.5 px-3"
                            onClick={() => toggleTrigger(trigger.id)}
                          >
                            <span className="mr-1">{trigger.emoji}</span>
                            {trigger.label}
                            {isSelected && <X className="ml-1 h-3 w-3" />}
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="custom-trigger" className="text-sm">
                  Add custom trigger
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="custom-trigger"
                    placeholder="e.g., upcoming interview..."
                    value={customTrigger}
                    onChange={(e) => setCustomTrigger(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTrigger();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={addCustomTrigger}
                    disabled={!customTrigger.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who are you with?</CardTitle>
              <CardDescription>Select your social context</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PEOPLE_OPTIONS.map((people) => (
                  <Button
                    key={people.id}
                    type="button"
                    variant={value.people === people.id ? "default" : "outline"}
                    className="justify-start h-auto py-3"
                    onClick={() => updateContext({ people: people.id })}
                  >
                    <span className="text-xl mr-2">{people.emoji}</span>
                    <span className="text-sm">{people.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary of selected tags */}
      {(value.location ||
        value.activity?.length ||
        value.triggers?.length ||
        value.people) && (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-sm">Context Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {value.location && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Location:</span>
                <Badge variant="secondary">
                  {LOCATION_OPTIONS.find((l) => l.id === value.location)
                    ?.label || value.location}
                </Badge>
              </div>
            )}
            {value.activity && value.activity.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Activities:
                </span>
                {value.activity.map((id) => (
                  <Badge key={id} variant="secondary">
                    {ACTIVITY_OPTIONS.find((a) => a.id === id)?.label || id}
                  </Badge>
                ))}
              </div>
            )}
            {value.triggers && value.triggers.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Triggers:</span>
                {value.triggers.map((id) => (
                  <Badge key={id} variant="secondary">
                    {TRIGGER_OPTIONS.find((t) => t.id === id)?.label || id}
                  </Badge>
                ))}
              </div>
            )}
            {value.people && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">With:</span>
                <Badge variant="secondary">
                  {PEOPLE_OPTIONS.find((p) => p.id === value.people)?.label ||
                    value.people}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
