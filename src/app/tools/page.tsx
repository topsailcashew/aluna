import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, ArrowRight } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="container mx-auto flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Wellness Tools</h2>
          <p className="text-muted-foreground mt-1">
            Explore tools to support your emotional and mental well-being
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <CardTitle>Life Messages</CardTitle>
                <CardDescription>
                  Explore the messages you received growing up
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Identify and reframe the core beliefs shaped by early life experiences.
              This guided exercise helps you understand patterns and create new, empowering narratives.
            </p>
            <Button asChild className="w-full">
              <Link href="/life-messages">
                Start Exercise
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <CardTitle>Emotional Regulation</CardTitle>
                <CardDescription>
                  Tools to help you manage difficult emotions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Learn techniques to identify, understand, and regulate your emotional responses.
              Build skills for navigating challenging feelings with greater ease.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
