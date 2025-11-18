import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { projectAPI, snippetAPI, noteAPI, checklistAPI, smartNoteAPI } from '@/lib/api';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileCode, FileText, CheckSquare, Calendar, Sparkles } from 'lucide-react';
import type { Project } from '@shared/projectSchema';

export default function ProjectDetail() {
  const { user } = useAuth();
  const [match, params] = useRoute('/projects/:id');
  const projectId = params?.id;

  // Fetch project details
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      return await projectAPI.getById(projectId);
    },
    enabled: !!projectId,
  });

  // Fetch snippets for this project
  const { data: snippets, isLoading: isLoadingSnippets } = useQuery({
    queryKey: ['project-snippets', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const allSnippets = await snippetAPI.getAll();
      return allSnippets.filter(s => s.projectId === projectId);
    },
    enabled: !!projectId,
  });

  // Fetch notes for this project
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['project-notes', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const allNotes = await noteAPI.getAll();
      return allNotes.filter(n => n.projectId === projectId);
    },
    enabled: !!projectId,
  });

  // Fetch checklists for this project
  const { data: checklists, isLoading: isLoadingChecklists } = useQuery({
    queryKey: ['project-checklists', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const allChecklists = await checklistAPI.getAll();
      return allChecklists.filter(c => c.projectId === projectId);
    },
    enabled: !!projectId,
  });

  // Fetch smart notes for this project
  const { data: smartNotes, isLoading: isLoadingSmartNotes } = useQuery({
    queryKey: ['project-smartnotes', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const allSmartNotes = await smartNoteAPI.getAll();
      return allSmartNotes.filter(s => s.projectId === projectId);
    },
    enabled: !!projectId,
  });

  if (isLoadingProject) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Link href="/projects">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Snippets</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{snippets?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notes?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checklists</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checklists?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Smart Notes</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{smartNotes?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="snippets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="snippets">
              Snippets ({snippets?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({notes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="checklists">
              Checklists ({checklists?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="smartnotes">
              Smart Notes ({smartNotes?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="snippets" className="space-y-4 mt-4">
            {isLoadingSnippets ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : snippets && snippets.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {snippets.map((snippet) => (
                  <Link key={snippet.id} href={`/snippets/${snippet.id}`}>
                    <Card className="cursor-pointer hover:bg-accent transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{snippet.title}</CardTitle>
                        {snippet.description && (
                          <CardDescription>{snippet.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{snippet.language || 'text'}</Badge>
                          {snippet.updatedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(snippet.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No snippets in this project yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            {isLoadingNotes ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {notes.map((note) => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <Card className="cursor-pointer hover:bg-accent transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {note.updatedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No notes in this project yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="checklists" className="space-y-4 mt-4">
            {isLoadingChecklists ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : checklists && checklists.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {checklists.map((checklist) => (
                  <Link key={checklist.id} href={`/checklists/${checklist.id}`}>
                    <Card className="cursor-pointer hover:bg-accent transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{checklist.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {checklist.items && (
                            <span>
                              {checklist.items.filter((item: any) => item.completed).length} / {checklist.items.length} completed
                            </span>
                          )}
                          {checklist.updatedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(checklist.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No checklists in this project yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="smartnotes" className="space-y-4 mt-4">
            {isLoadingSmartNotes ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : smartNotes && smartNotes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {smartNotes.map((smartNote) => (
                  <Link key={smartNote.id} href={`/smart-notes/${smartNote.id}`}>
                    <Card className="cursor-pointer hover:bg-accent transition-colors">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-pink-500" />
                          <CardTitle className="text-lg">{smartNote.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {smartNote.tags && Array.isArray(smartNote.tags) && smartNote.tags.length > 0 && (
                            <div className="flex gap-1">
                              {smartNote.tags.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                              {smartNote.tags.length > 2 && (
                                <Badge variant="secondary">+{smartNote.tags.length - 2}</Badge>
                              )}
                            </div>
                          )}
                          {smartNote.updatedAt && (
                            <span className="flex items-center gap-1 ml-auto">
                              <Calendar className="h-3 w-3" />
                              {new Date(smartNote.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No smart notes in this project yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
