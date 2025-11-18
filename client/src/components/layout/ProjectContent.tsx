import { useQuery } from '@tanstack/react-query';
import { snippetAPI, noteAPI, checklistAPI, smartNoteAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Project } from '@shared/schema';

interface ProjectContentProps {
  projectId: string;
  type: 'snippets' | 'notes' | 'checklists' | 'smartnotes';
  userId: string | undefined;
}

export function ProjectContent({ projectId, type, userId }: ProjectContentProps) {
  // Check if this is for uncategorized items (empty string or 'uncategorized')
  const isUncategorized = projectId === '' || projectId === 'uncategorized';
  
  const { data: items, isLoading, error } = useQuery<any[]>({
    queryKey: ['project-items', userId, projectId, type],
    queryFn: async () => {
      if (!userId) {
        console.log(`No userId provided for ${type} in project ${projectId}`);
        return [];
      }
      
      try {
        console.log(`Fetching ${type} for project ${projectId} and user ${userId}`);
        
        let allItems: any[] = [];
        
        // Fetch from MySQL based on type
        if (type === 'snippets') {
          allItems = await snippetAPI.getAll();
        } else if (type === 'notes') {
          allItems = await noteAPI.getAll();
        } else if (type === 'checklists') {
          allItems = await checklistAPI.getAll();
        } else if (type === 'smartnotes') {
          allItems = await smartNoteAPI.getAll();
        }
        
        // Filter by projectId
        let results: any[];
        if (isUncategorized) {
          // For uncategorized items, filter for items where projectId is null, undefined, empty string, or 'uncategorized'
          results = allItems.filter(item => 
            !item.projectId || 
            item.projectId === '' || 
            item.projectId === 'uncategorized'
          );
        } else {
          // For regular projects, filter by exact projectId match
          results = allItems.filter(item => item.projectId === projectId);
        }
        
        // Sort by updatedAt descending
        results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        console.log(`${type} results for project ${projectId}:`, results);
        return results;
      } catch (error) {
        console.error(`Error fetching ${type} for project ${projectId}:`, error);
        throw error;
      }
    },
    enabled: !!userId && (!!projectId || isUncategorized),
    staleTime: 5000, // 5 seconds to make it more responsive for uncategorized items
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2
  });

  // Log any errors
  if (error) {
    console.error(`Error in ProjectContent (${type}):`, error);
  }

  if (isLoading) {
    return (
      <div className="pl-6 py-1">
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded my-1" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded my-1" />
      </div>
    );
  }

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div className="pl-6 py-1 text-xs text-muted-foreground">
        No items found
      </div>
    );
  }

  return (
    <div className="pl-6 py-1">
      {safeItems.slice(0, 5).map((item) => (
        <Link key={item.id} href={`/${type === 'smartnotes' ? 'smart-notes' : type}/${item.id}`}>
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto py-1 px-2 text-xs"
          >
            {item.title || 'Untitled'}
          </Button>
        </Link>
      ))}
      {safeItems.length > 5 && (
        <div className="text-xs text-muted-foreground pl-2 pt-1">
          +{safeItems.length - 5} more items
        </div>
      )}
    </div>
  );
}