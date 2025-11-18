import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Sparkles, Calendar, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RichTextEditor } from '@/components/smartnote/RichTextEditor';
import { TagInput } from '@/components/ui/tag-input';
import { smartNoteAPI, projectAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SmartNote } from '@shared/schema';

export default function SmartNoteDetail() {
  const [, params] = useRoute('/smart-notes/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const smartNoteId = params?.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string>('uncategorized');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch smart note
  const { data: smartNote, isLoading } = useQuery<SmartNote>({
    queryKey: ['smart-note', smartNoteId],
    queryFn: () => smartNoteAPI.getById(smartNoteId!),
    enabled: !!smartNoteId,
  });

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => projectAPI.getAll(),
    enabled: !!user,
  });

  // Initialize form when smart note loads
  useEffect(() => {
    if (smartNote) {
      setTitle(smartNote.title);
      setContent(smartNote.content);
      setTags(smartNote.tags || []);
      setProjectId(smartNote.projectId || 'uncategorized');
      setHasUnsavedChanges(false);
    }
  }, [smartNote]);

  // Track changes
  useEffect(() => {
    if (smartNote) {
      const changed = 
        title !== smartNote.title ||
        content !== smartNote.content ||
        JSON.stringify(tags) !== JSON.stringify(smartNote.tags || []) ||
        projectId !== (smartNote.projectId || 'uncategorized');
      setHasUnsavedChanges(changed);
    }
  }, [title, content, tags, projectId, smartNote]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SmartNote>) => 
      smartNoteAPI.update(smartNoteId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-note', smartNoteId] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['smart-notes'] });
      toast({
        title: 'Success',
        description: 'Smart note updated successfully',
      });
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update smart note',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => smartNoteAPI.delete(smartNoteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['smart-notes'] });
      toast({
        title: 'Success',
        description: 'Smart note deleted successfully',
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete smart note',
      });
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Title is required',
      });
      return;
    }

    updateMutation.mutate({
      title: title.trim(),
      content,
      tags,
      projectId: projectId === 'uncategorized' ? undefined : projectId,
      updatedAt: Date.now(),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </MainLayout>
    );
  }

  if (!smartNote) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Smart Note not found</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || updateMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="space-y-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Smart Note Title"
                className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Separator />

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {smartNote.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(smartNote.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {smartNote.updatedAt && smartNote.updatedAt !== smartNote.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {new Date(smartNote.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags..."
              />
            </div>

            {/* Project */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {projects?.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your smart note..."
              className="min-h-[500px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Smart Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{smartNote.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
