import { useQuery } from '@tanstack/react-query';
import { snippetAPI, noteAPI, checklistAPI, smartNoteAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface FolderContentProps {
  type: 'snippets' | 'notes' | 'checklists' | 'smartnotes';
  userId: string | undefined;
}

export function FolderContent({ type, userId }: FolderContentProps) {
  const { data: items, isLoading, error } = useQuery<any[]>({
    queryKey: ['folder-items', userId, type],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        console.log(`Fetching ${type} for user:`, userId);
        
        let results: any[] = [];
        
        // Fetch from MySQL based on type
        if (type === 'snippets') {
          results = await snippetAPI.getAll();
        } else if (type === 'notes') {
          results = await noteAPI.getAll();
        } else if (type === 'checklists') {
          results = await checklistAPI.getAll();
        } else if (type === 'smartnotes') {
          results = await smartNoteAPI.getAll();
        }
        
        // Sort by updatedAt descending
        results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        console.log(`${type} processed results:`, results);
        return results;
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    retry: 2
  });

  // Log any errors
  if (error) {
    console.error(`Error in FolderContent (${type}):`, error);
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
  
  // Debug log with more context
  console.log(`FolderContent ${type} items:`, safeItems, 'userId:', userId);

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