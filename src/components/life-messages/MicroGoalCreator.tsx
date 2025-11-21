'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check, Bell, BellOff } from 'lucide-react';
import { MicroGoal } from '@/lib/types/life-messages';
import { useToast } from '@/hooks/use-toast';

interface MicroGoalCreatorProps {
  goals: MicroGoal[];
  onChange: (goals: MicroGoal[]) => void;
}

/**
 * SMART goal creator with reminders
 */
export function MicroGoalCreator({ goals, onChange }: MicroGoalCreatorProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<MicroGoal>>({
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
    reminder: {
      enabled: false,
      frequency: 'weekly',
    },
  });

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: 'Notifications blocked',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    }
    return false;
  };

  const addGoal = () => {
    if (
      !newGoal.specific?.trim() ||
      !newGoal.measurable?.trim() ||
      !newGoal.achievable?.trim() ||
      !newGoal.relevant?.trim() ||
      !newGoal.timeBound?.trim()
    ) {
      toast({
        title: 'Incomplete goal',
        description: 'Please fill in all SMART fields.',
        variant: 'destructive',
      });
      return;
    }

    const goal: MicroGoal = {
      id: crypto.randomUUID(),
      specific: newGoal.specific!,
      measurable: newGoal.measurable!,
      achievable: newGoal.achievable!,
      relevant: newGoal.relevant!,
      timeBound: newGoal.timeBound!,
      reminder: newGoal.reminder,
      completed: false,
      createdAt: new Date(),
    };

    onChange([...goals, goal]);
    setNewGoal({
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
      reminder: {
        enabled: false,
        frequency: 'weekly',
      },
    });
    setIsAdding(false);

    toast({
      title: 'Goal added',
      description: 'Your micro-goal has been created.',
    });
  };

  const toggleComplete = (id: string) => {
    onChange(
      goals.map((g) =>
        g.id === id
          ? {
              ...g,
              completed: !g.completed,
              completedAt: !g.completed ? new Date() : undefined,
            }
          : g
      )
    );
  };

  const deleteGoal = (id: string) => {
    onChange(goals.filter((g) => g.id !== id));
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    if (enabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;
    }

    onChange(
      goals.map((g) =>
        g.id === id && g.reminder
          ? {
              ...g,
              reminder: { ...g.reminder, enabled },
            }
          : g
      )
    );

    toast({
      title: enabled ? 'Reminder enabled' : 'Reminder disabled',
      description: enabled
        ? 'You will receive notifications for this goal.'
        : 'Notifications have been turned off.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Existing Goals */}
      {goals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Action Goals ({goals.length})</h3>
          {goals.map((goal) => (
            <Card key={goal.id} className={goal.completed ? 'opacity-60' : ''}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`goal-${goal.id}`}
                        checked={goal.completed}
                        onCheckedChange={() => toggleComplete(goal.id)}
                        aria-label={`Mark goal as ${goal.completed ? 'incomplete' : 'complete'}`}
                      />
                      <Label
                        htmlFor={`goal-${goal.id}`}
                        className={`text-base font-medium cursor-pointer ${goal.completed ? 'line-through' : ''}`}
                      >
                        {goal.specific}
                      </Label>
                      {goal.completed && (
                        <Badge variant="secondary" className="ml-2">
                          <Check className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Measurable:</span>{' '}
                        {goal.measurable}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Achievable:</span>{' '}
                        {goal.achievable}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Relevant:</span>{' '}
                        {goal.relevant}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Time-bound:</span>{' '}
                        {goal.timeBound}
                      </div>
                    </div>

                    {goal.reminder && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleReminder(goal.id, !goal.reminder?.enabled)}
                          className="h-8"
                        >
                          {goal.reminder.enabled ? (
                            <>
                              <Bell className="h-3 w-3 mr-1" />
                              Reminders On
                            </>
                          ) : (
                            <>
                              <BellOff className="h-3 w-3 mr-1" />
                              Reminders Off
                            </>
                          )}
                        </Button>
                        {goal.reminder.enabled && (
                          <span className="text-xs text-muted-foreground">
                            {goal.reminder.frequency === 'daily' && 'Daily reminders'}
                            {goal.reminder.frequency === 'weekly' && 'Weekly reminders'}
                            {goal.reminder.frequency === 'custom' &&
                              `Every ${goal.reminder.customDays} days`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="h-8 w-8 p-0"
                    aria-label="Delete this goal"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Goal */}
      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Action Goal
        </Button>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Create SMART Goal</CardTitle>
            <CardDescription>
              Set a specific, measurable, achievable, relevant, and time-bound goal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Specific */}
            <div className="space-y-2">
              <Label htmlFor="specific">
                Specific <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="specific"
                placeholder="What exactly will you do? (e.g., Practice self-compassion by writing one positive affirmation each morning)"
                value={newGoal.specific || ''}
                onChange={(e) => setNewGoal({ ...newGoal, specific: e.target.value })}
                className="min-h-[60px]"
              />
            </div>

            {/* Measurable */}
            <div className="space-y-2">
              <Label htmlFor="measurable">
                Measurable <span className="text-destructive">*</span>
              </Label>
              <Input
                id="measurable"
                placeholder="How will you know you did it? (e.g., Check off in my journal)"
                value={newGoal.measurable || ''}
                onChange={(e) => setNewGoal({ ...newGoal, measurable: e.target.value })}
              />
            </div>

            {/* Achievable */}
            <div className="space-y-2">
              <Label htmlFor="achievable">
                Achievable <span className="text-destructive">*</span>
              </Label>
              <Input
                id="achievable"
                placeholder="What makes this realistic? (e.g., Takes only 2 minutes)"
                value={newGoal.achievable || ''}
                onChange={(e) => setNewGoal({ ...newGoal, achievable: e.target.value })}
              />
            </div>

            {/* Relevant */}
            <div className="space-y-2">
              <Label htmlFor="relevant">
                Relevant <span className="text-destructive">*</span>
              </Label>
              <Input
                id="relevant"
                placeholder="Why does this matter? (e.g., Challenges my 'not good enough' belief)"
                value={newGoal.relevant || ''}
                onChange={(e) => setNewGoal({ ...newGoal, relevant: e.target.value })}
              />
            </div>

            {/* Time-bound */}
            <div className="space-y-2">
              <Label htmlFor="timeBound">
                Time-bound <span className="text-destructive">*</span>
              </Label>
              <Input
                id="timeBound"
                placeholder="By when? (e.g., Daily for the next 7 days)"
                value={newGoal.timeBound || ''}
                onChange={(e) => setNewGoal({ ...newGoal, timeBound: e.target.value })}
              />
            </div>

            {/* Reminder Settings */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reminder-enabled"
                  checked={newGoal.reminder?.enabled || false}
                  onCheckedChange={(checked) =>
                    setNewGoal({
                      ...newGoal,
                      reminder: { ...newGoal.reminder!, enabled: checked as boolean },
                    })
                  }
                />
                <Label htmlFor="reminder-enabled" className="cursor-pointer">
                  Enable browser notifications
                </Label>
              </div>

              {newGoal.reminder?.enabled && (
                <RadioGroup
                  value={newGoal.reminder.frequency}
                  onValueChange={(value) =>
                    setNewGoal({
                      ...newGoal,
                      reminder: {
                        ...newGoal.reminder!,
                        frequency: value as 'daily' | 'weekly' | 'custom',
                      },
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="cursor-pointer">
                      Daily
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="cursor-pointer">
                      Weekly
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={addGoal} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewGoal({
                    specific: '',
                    measurable: '',
                    achievable: '',
                    relevant: '',
                    timeBound: '',
                    reminder: {
                      enabled: false,
                      frequency: 'weekly',
                    },
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No action goals yet. Create one to start taking action.</p>
        </div>
      )}
    </div>
  );
}
