import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { snippetAPI, noteAPI, checklistAPI, smartNoteAPI, userAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/MainLayout';
import { SnippetCard } from '@/components/snippet/SnippetCard';
import { NoteCard } from '@/components/note/NoteCard';
import { ChecklistCard } from '@/components/checklist/ChecklistCard';
import { SmartNoteCard } from '@/components/smartnote/SmartNoteCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Code2, 
  FileText, 
  CheckSquare, 
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  X,
  User
} from 'lucide-react';
import { CreateItemDialog } from '@/components/dialogs/CreateItemDialog';
import { PremiumFeatureAlert } from '@/components/PremiumFeatureAlert';
import type { Snippet } from '@shared/schema';

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('snippets');
  const [fabOpen, setFabOpen] = useState(false);
  const [showDisplayNameDialog, setShowDisplayNameDialog] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Check if display name is set
  useEffect(() => {
    if (user && !user.displayName) {
      setShowDisplayNameDialog(true);
    }
  }, [user]);

  // Mutation to update display name
  const updateDisplayNameMutation = useMutation({
    mutationFn: (name: string) => userAPI.update(user!.id, { displayName: name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast({
        title: 'Success',
        description: 'Display name updated successfully',
      });
      setShowDisplayNameDialog(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update display name',
      });
    },
  });

  const handleSaveDisplayName = () => {
    if (!displayName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a display name',
      });
      return;
    }
    updateDisplayNameMutation.mutate(displayName.trim());
  };

  const { data: snippets, isLoading: snippetsLoading } = useQuery<any[]>({
    queryKey: ['snippets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await snippetAPI.getAll();
    },
    enabled: !!user,
  });

  const { data: notes, isLoading: notesLoading } = useQuery<any[]>({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await noteAPI.getAll();
    },
    enabled: !!user,
  });

  const { data: checklists, isLoading: checklistsLoading } = useQuery<any[]>({
    queryKey: ['checklists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await checklistAPI.getAll();
    },
    enabled: !!user,
  });

  const { data: smartNotes, isLoading: smartNotesLoading } = useQuery<any[]>({
    queryKey: ['smart-notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await smartNoteAPI.getAll();
    },
    enabled: !!user,
  });

  const items = useMemo(() => {
    if (activeTab === 'snippets') {
      return snippets || [];
    } else if (activeTab === 'notes') {
      return notes || [];
    } else if (activeTab === 'checklists') {
      return checklists || [];
    } else {
      return smartNotes || [];
    }
  }, [activeTab, snippets, notes, checklists, smartNotes]);

  const isLoading = activeTab === 'snippets' ? snippetsLoading : 
                     activeTab === 'notes' ? notesLoading : 
                     activeTab === 'checklists' ? checklistsLoading :
                     smartNotesLoading;

  const stats = useMemo(() => {
    return {
      snippets: snippets?.length || 0,
      notes: notes?.length || 0,
      checklists: checklists?.length || 0,
      smartNotes: smartNotes?.length || 0,
      total: (snippets?.length || 0) + (notes?.length || 0) + (checklists?.length || 0) + (smartNotes?.length || 0)
    };
  }, [snippets, notes, checklists, smartNotes]);

  const recentItems = useMemo(() => {
    const allItems = [
      ...(snippets || []).map(s => ({ ...s, type: 'snippet' })),
      ...(notes || []).map(n => ({ ...n, type: 'note' })),
      ...(checklists || []).map(c => ({ ...c, type: 'checklist' })),
      ...(smartNotes || []).map(sn => ({ ...sn, type: 'smartnote' }))
    ];
    
    return allItems
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 3);
  }, [snippets, notes, checklists, smartNotes]);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span>Active collection</span>
        </div>
      </CardContent>
    </Card>
  );

  const WelcomeSection = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 mb-8">
      <div className="absolute inset-0 bg-grid-white/5" />
      <div className="relative p-8 md:p-12">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <Badge variant="secondary" className="font-semibold">
                Welcome back
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Hey, {user?.displayName || 'there'}! 👋
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Ready to organize your thoughts? You have {stats.total} items in your workspace.
              {stats.total === 0 && " Let's create your first one!"}
            </p>
          </div>
          <div className="flex gap-2">
            <CreateItemDialog
              type="snippet"
              trigger={
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="h-4 w-4" />
                  Quick Create
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  const QuickStats = () => (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <StatCard
        icon={Code2}
        label="Code Snippets"
        value={stats.snippets}
        color="bg-blue-500"
      />
      <StatCard
        icon={FileText}
        label="Notes"
        value={stats.notes}
        color="bg-purple-500"
      />
      <StatCard
        icon={CheckSquare}
        label="Checklists"
        value={stats.checklists}
        color="bg-green-500"
      />
      <StatCard
        icon={Sparkles}
        label="Smart Notes"
        value={stats.smartNotes}
        color="bg-pink-500"
      />
    </div>
  );

  const RecentActivity = () => {
    if (recentItems.length === 0) return null;

    return (
      <Card className="mb-8 border-2">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.type === 'snippet' && <Code2 className="h-4 w-4 text-blue-500" />}
                  {item.type === 'note' && <FileText className="h-4 w-4 text-purple-500" />}
                  {item.type === 'checklist' && <CheckSquare className="h-4 w-4 text-green-500" />}
                  {item.type === 'smartnote' && <Sparkles className="h-4 w-4 text-pink-500" />}
                  <div>
                    <p className="font-medium text-sm">{item.title || item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-6 rounded-full bg-muted/50 mb-4">
        {type === 'snippets' && <Code2 className="h-12 w-12 text-muted-foreground" />}
        {type === 'notes' && <FileText className="h-12 w-12 text-muted-foreground" />}
        {type === 'checklists' && <CheckSquare className="h-12 w-12 text-muted-foreground" />}
        {type === 'smartnotes' && <Sparkles className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="text-xl font-semibold mb-2">No {type} yet</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Create your first {type === 'smartnotes' ? 'smart note' : type.slice(0, -1)} to get started organizing your workspace.
      </p>
      <CreateItemDialog
        type={type === 'snippets' ? 'snippet' : type === 'notes' ? 'note' : type === 'smartnotes' ? 'smartnote' : 'checklist'}
        trigger={
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create {type === 'smartnotes' ? 'Smart Note' : type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)}
          </Button>
        }
      />
    </div>
  );

  const FloatingActionButton = () => {
    return (
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50">
        {/* Radial Menu Items */}
        <div className={cn(
          "absolute bottom-20 right-0 flex flex-col gap-3",
          fabOpen ? "pointer-events-auto" : "pointer-events-none"
        )}>
          {/* Snippet Button */}
          <div className={cn(
            "transition-all duration-300 ease-out",
            fabOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-50",
            fabOpen && "animate-in slide-in-from-bottom-4 fade-in-0"
          )}
          style={{
            transitionDelay: fabOpen ? '0ms' : '100ms'
          }}>
            <CreateItemDialog
              type="snippet"
              onCreated={() => setFabOpen(false)}
              trigger={
                <Button
                  size="lg"
                  className="group relative h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-110 p-0 border-2 border-primary/20"
                  title="Create Snippet"
                >
                  <Code2 className="h-6 w-6" />
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                </Button>
              }
            />
          </div>

          {/* Note Button */}
          <div className={cn(
            "transition-all duration-300 ease-out",
            fabOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-50"
          )}
          style={{
            transitionDelay: fabOpen ? '50ms' : '50ms'
          }}>
            <CreateItemDialog
              type="note"
              onCreated={() => setFabOpen(false)}
              trigger={
                <Button
                  size="lg"
                  variant="default"
                  className="group relative h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 p-0 border-2 border-purple-500/20"
                  title="Create Note"
                >
                  <FileText className="h-6 w-6 text-white" />
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping opacity-75" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
                </Button>
              }
            />
          </div>

          {/* Checklist Button */}
          <div className={cn(
            "transition-all duration-300 ease-out",
            fabOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-50"
          )}
          style={{
            transitionDelay: fabOpen ? '100ms' : '0ms'
          }}>
            <CreateItemDialog
              type="checklist"
              onCreated={() => setFabOpen(false)}
              trigger={
                <Button
                  size="lg"
                  variant="default"
                  className="group relative h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 p-0 border-2 border-green-500/20"
                  title="Create Checklist"
                >
                  <CheckSquare className="h-6 w-6 text-white" />
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping opacity-75" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
                </Button>
              }
            />
          </div>

          {/* Smart Note Button */}
          <div className={cn(
            "transition-all duration-300 ease-out",
            fabOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-50"
          )}
          style={{
            transitionDelay: fabOpen ? '150ms' : '0ms'
          }}>
            <CreateItemDialog
              type="smartnote"
              onCreated={() => setFabOpen(false)}
              trigger={
                <Button
                  size="lg"
                  variant="default"
                  className="group relative h-14 w-14 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 p-0 border-2 border-pink-500/20"
                  title="Create Smart Note"
                >
                  <Sparkles className="h-6 w-6 text-white" />
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping opacity-75" style={{ animationDuration: '2s', animationDelay: '0.9s' }} />
                </Button>
              }
            />
          </div>
        </div>

        {/* Main FAB Button */}
        <Button
          size="lg"
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            "h-16 w-16 rounded-full shadow-2xl transition-all duration-500 ease-out relative overflow-hidden",
            fabOpen ? "bg-destructive hover:bg-destructive scale-110 shadow-destructive/50" : "bg-primary hover:bg-primary/90 scale-100 hover:scale-110 shadow-primary/50",
            "active:scale-95"
          )}
        >
          {/* Animated background ripple effect */}
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-700",
            fabOpen ? "bg-destructive/30 scale-150" : "bg-primary/30 scale-0"
          )} />
          
          {/* Icon container with rotation */}
          <div className="relative z-10">
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              fabOpen ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"
            )}>
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              fabOpen ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-0"
            )}>
              <X className="h-7 w-7" strokeWidth={2.5} />
            </div>
          </div>
        </Button>

        {/* Backdrop */}
        <div className={cn(
          "fixed inset-0 -z-10 transition-all duration-300",
          fabOpen ? "opacity-100 backdrop-blur-sm bg-background/80" : "opacity-0 backdrop-blur-none pointer-events-none"
        )}
        onClick={() => setFabOpen(false)}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[280px] rounded-xl bg-card/50 animate-pulse border-2" />
          ))}
        </div>
      );
    }

    if (!items?.length) {
      return <EmptyState type={activeTab} />;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          if (activeTab === 'snippets') {
            return (
              <SnippetCard
                key={item.id}
                snippet={item as Snippet}
                showActions={false}
              />
            );
          } else if (activeTab === 'notes') {
            return (
              <NoteCard
                key={item.id}
                note={item}
                showActions={false}
              />
            );
          } else if (activeTab === 'smartnotes') {
            return (
              <SmartNoteCard
                key={item.id}
                smartNote={item}
              />
            );
          } else {
            return (
              <ChecklistCard
                key={item.id}
                checklist={item}
                showActions={false}
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 relative pb-8">
        <PremiumFeatureAlert />
        
        <WelcomeSection />
        
        <QuickStats />
        
        <RecentActivity />
        
        <Tabs defaultValue="snippets" onValueChange={setActiveTab} className="space-y-6">
          {/* Modern Tab Navigation with Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('snippets')}
              className={cn(
                "group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                activeTab === 'snippets'
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                  : "border-border hover:border-blue-500/50 bg-card hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className={cn(
                    "p-3 rounded-xl w-fit transition-colors",
                    activeTab === 'snippets' ? "bg-blue-500" : "bg-blue-500/20"
                  )}>
                    <Code2 className={cn(
                      "h-6 w-6 transition-colors",
                      activeTab === 'snippets' ? "text-white" : "text-blue-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Code Snippets</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.snippets} snippet{stats.snippets !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {activeTab === 'snippets' && (
                  <Badge className="bg-blue-500">Active</Badge>
                )}
              </div>
              <div className={cn(
                "absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full transition-all duration-300",
                activeTab === 'snippets' ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                "group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                activeTab === 'notes'
                  ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                  : "border-border hover:border-purple-500/50 bg-card hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className={cn(
                    "p-3 rounded-xl w-fit transition-colors",
                    activeTab === 'notes' ? "bg-purple-500" : "bg-purple-500/20"
                  )}>
                    <FileText className={cn(
                      "h-6 w-6 transition-colors",
                      activeTab === 'notes' ? "text-white" : "text-purple-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.notes} note{stats.notes !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {activeTab === 'notes' && (
                  <Badge className="bg-purple-500">Active</Badge>
                )}
              </div>
              <div className={cn(
                "absolute bottom-0 left-0 h-1 bg-purple-500 rounded-full transition-all duration-300",
                activeTab === 'notes' ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </button>

            <button
              onClick={() => setActiveTab('checklists')}
              className={cn(
                "group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                activeTab === 'checklists'
                  ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                  : "border-border hover:border-green-500/50 bg-card hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className={cn(
                    "p-3 rounded-xl w-fit transition-colors",
                    activeTab === 'checklists' ? "bg-green-500" : "bg-green-500/20"
                  )}>
                    <CheckSquare className={cn(
                      "h-6 w-6 transition-colors",
                      activeTab === 'checklists' ? "text-white" : "text-green-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Checklists</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.checklists} checklist{stats.checklists !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {activeTab === 'checklists' && (
                  <Badge className="bg-green-500">Active</Badge>
                )}
              </div>
              <div className={cn(
                "absolute bottom-0 left-0 h-1 bg-green-500 rounded-full transition-all duration-300",
                activeTab === 'checklists' ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </button>

            <button
              onClick={() => setActiveTab('smartnotes')}
              className={cn(
                "group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                activeTab === 'smartnotes'
                  ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                  : "border-border hover:border-pink-500/50 bg-card hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className={cn(
                    "p-3 rounded-xl w-fit transition-colors",
                    activeTab === 'smartnotes' ? "bg-pink-500" : "bg-pink-500/20"
                  )}>
                    <Sparkles className={cn(
                      "h-6 w-6 transition-colors",
                      activeTab === 'smartnotes' ? "text-white" : "text-pink-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Smart Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.smartNotes} smart note{stats.smartNotes !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {activeTab === 'smartnotes' && (
                  <Badge className="bg-pink-500">Active</Badge>
                )}
              </div>
              <div className={cn(
                "absolute bottom-0 left-0 h-1 bg-pink-500 rounded-full transition-all duration-300",
                activeTab === 'smartnotes' ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </button>
          </div>

          <TabsContent value="snippets" className="mt-0 space-y-6">
            {renderContent()}
          </TabsContent>

          <TabsContent value="notes" className="mt-0 space-y-6">
            {renderContent()}
          </TabsContent>

          <TabsContent value="checklists" className="mt-0 space-y-6">
            {renderContent()}
          </TabsContent>

          <TabsContent value="smartnotes" className="mt-0 space-y-6">
            {renderContent()}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button with Radial Menu */}
        <FloatingActionButton />
      </div>

      {/* Display Name Setup Dialog */}
      <Dialog open={showDisplayNameDialog} onOpenChange={setShowDisplayNameDialog}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Set Your Display Name
            </DialogTitle>
            <DialogDescription>
              Please set a display name for your account. This will be shown throughout the application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveDisplayName();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveDisplayName}
              disabled={updateDisplayNameMutation.isPending || !displayName.trim()}
              className="w-full"
            >
              {updateDisplayNameMutation.isPending ? 'Saving...' : 'Save Display Name'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}