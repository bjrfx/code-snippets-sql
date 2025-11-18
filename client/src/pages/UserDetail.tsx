import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation, useRoute } from 'wouter';
import { ChevronLeft, Save, Trash2, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { userAPI, snippetAPI, noteAPI, checklistAPI, projectAPI, smartNoteAPI } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function UserDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/admin/users/:id');
  const userId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userRole, setUserRole] = useState('free');
  const [createdAt, setCreatedAt] = useState('');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // User stats
  const [userStats, setUserStats] = useState({
    snippets: 0,
    notes: 0,
    checklists: 0,
    smartnotes: 0,
    projects: 0
  });

  // User roles configuration
  const USER_ROLES = {
    FREE: 'free',
    PAID: 'paid',
    ADMIN: 'admin'
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !userId) return;
      
      try {
        setLoading(true);
        
        // Get user from MySQL
        const fetchedUser = await userAPI.getById(userId);
        
        if (fetchedUser) {
          setUserData(fetchedUser);
          
          // Set form fields
          setEmail(fetchedUser.email || '');
          setDisplayName(fetchedUser.displayName || '');
          setUserRole(fetchedUser.role || 'free');
          
          // Format created date if available
          if (fetchedUser.createdAt) {
            const date = new Date(fetchedUser.createdAt);
            setCreatedAt(date.toLocaleString());
          } else {
            setCreatedAt('Unknown');
          }
          
          // Fetch user stats
          await fetchUserStats(userId);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'User not found.'
          });
          setLocation('/admin');
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load user data.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, userId, toast, setLocation]);
  
  // Fetch user stats (counts of snippets, notes, etc.)
  const fetchUserStats = async (userId: string) => {
    try {
      const stats = { snippets: 0, notes: 0, checklists: 0, smartnotes: 0, projects: 0 };
      
      // Fetch all items from MySQL
      const [snippets, notes, checklists, smartnotes, projects] = await Promise.all([
        snippetAPI.getAll(),
        noteAPI.getAll(),
        checklistAPI.getAll(),
        smartNoteAPI.getAll(),
        projectAPI.getAll()
      ]);
      
      // Count items for this user
      stats.snippets = snippets.filter(item => item.userId === userId).length;
      stats.notes = notes.filter(item => item.userId === userId).length;
      stats.checklists = checklists.filter(item => item.userId === userId).length;
      stats.smartnotes = smartnotes.filter(item => item.userId === userId).length;
      stats.projects = projects.filter(item => item.userId === userId).length;
      
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  
  // Save user changes
  const saveUserChanges = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      
      // Prepare update data
      const updateData: any = {
        displayName,
        email,
        role: userRole,
        isAdmin: userRole === USER_ROLES.ADMIN
      };
      
      // Update the user via API
      await userAPI.update(userId, updateData);
      
      // Update local state
      setUserData((prev: any) => ({ ...prev, ...updateData }));
      
      toast({
        title: 'Success',
        description: 'User information updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user information.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Delete user and all their data
  const deleteUser = async () => {
    if (!userId) return;
    
    try {
      setIsDeleting(true);
      
      // Fetch all user's data
      const [snippets, notes, checklists, smartnotes, projects] = await Promise.all([
        snippetAPI.getAll(),
        noteAPI.getAll(),
        checklistAPI.getAll(),
        smartNoteAPI.getAll(),
        projectAPI.getAll()
      ]);
      
      // Filter to get only this user's items
      const userSnippets = snippets.filter(item => item.userId === userId);
      const userNotes = notes.filter(item => item.userId === userId);
      const userChecklists = checklists.filter(item => item.userId === userId);
      const userSmartNotes = smartnotes.filter(item => item.userId === userId);
      const userProjects = projects.filter(item => item.userId === userId);
      
      // Delete all user's data
      await Promise.all([
        ...userSnippets.map(item => snippetAPI.delete(item.id)),
        ...userNotes.map(item => noteAPI.delete(item.id)),
        ...userChecklists.map(item => checklistAPI.delete(item.id)),
        ...userSmartNotes.map(item => smartNoteAPI.delete(item.id)),
        ...userProjects.map(item => projectAPI.delete(item.id)),
      ]);
      
      // Delete the user
      await userAPI.delete(userId);
      
      toast({
        title: 'Success',
        description: 'User and all associated data deleted successfully.'
      });
      
      // Navigate back to admin dashboard
      setLocation('/admin');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user and their data.'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/admin')}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading user data...</div>
        ) : (
          <>
            {/* User Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  View and edit user details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="User email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="User display name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">User Role</Label>
                      <Select
                        value={userRole}
                        onValueChange={setUserRole}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={USER_ROLES.FREE}>Free User</SelectItem>
                          <SelectItem value={USER_ROLES.PAID}>Paid User</SelectItem>
                          <SelectItem value={USER_ROLES.ADMIN}>Admin User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Created At</Label>
                      <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                        {createdAt}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={userId === user?.uid} // Prevent deleting yourself
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </Button>
                    
                    <Button
                      onClick={saveUserChanges}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* User Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>
                  Overview of user content and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="text-sm font-medium">Snippets</h3>
                    <p className="text-2xl font-bold">{userStats.snippets}</p>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="text-sm font-medium">Notes</h3>
                    <p className="text-2xl font-bold">{userStats.notes}</p>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="text-sm font-medium">Checklists</h3>
                    <p className="text-2xl font-bold">{userStats.checklists}</p>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="text-sm font-medium">Smart Notes</h3>
                    <p className="text-2xl font-bold">{userStats.smartnotes}</p>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="text-sm font-medium">Projects</h3>
                    <p className="text-2xl font-bold">{userStats.projects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        
        {/* Delete User Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This will permanently remove the user and all their data including snippets, notes, checklists, projects, and backups.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {userData && (
                <div className="space-y-2">
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Display Name:</strong> {userData.displayName || 'Not set'}</p>
                  <p><strong>Role:</strong> {userData.role || 'No Role'}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteUser}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}