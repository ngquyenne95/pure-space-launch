import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail, Phone, UserCog } from 'lucide-react';
import { useStaffStore, StaffMember } from '@/store/staffStore';
import { OwnerStaffDialog } from './OwnerStaffDialog';
import { toast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OwnerStaffManagementProps {
  branchId: string;
}

export const OwnerStaffManagement = ({ branchId }: OwnerStaffManagementProps) => {
  const navigate = useNavigate();
  const allStaff = useStaffStore((state) => state.staff);
  const managers = allStaff.filter(s => s.role === 'manager' && s.branchId === branchId);
  const deleteStaff = useStaffStore((state) => state.deleteStaff);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>();
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [showBranchSelect, setShowBranchSelect] = useState(false);
  const [selectedBranchForManager, setSelectedBranchForManager] = useState('');

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedStaff(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteStaff(id);
    setStaffToDelete(null);
    toast({
      title: 'Manager Deleted',
      description: 'The manager has been removed.',
    });
  };

  const handleAccessManagerDashboard = () => {
    setShowBranchSelect(true);
  };

  const handleBranchSelection = () => {
    if (!selectedBranchForManager) {
      toast({
        variant: 'destructive',
        title: 'Select a branch',
        description: 'Please select a branch to continue.',
      });
      return;
    }

    // Get the selected branch details
    const selectedBranch = allBranches.find((b: any) => b.id === selectedBranchForManager);
    
    if (!selectedBranch) {
      toast({
        variant: 'destructive',
        title: 'Branch not found',
        description: 'The selected branch could not be found.',
      });
      return;
    }

    // Store manager context
    sessionStorage.setItem('owner_viewing_as_manager', 'true');
    sessionStorage.setItem('manager_branch_id', selectedBranchForManager);
    sessionStorage.setItem('manager_branch_name', selectedBranch.name);
    
    // Create a temporary manager user context
    const user = JSON.parse(localStorage.getItem('mock_auth_user') || '{}');
    const originalUser = { ...user };
    sessionStorage.setItem('original_user', JSON.stringify(originalUser));
    
    user.branchId = selectedBranchForManager;
    user.role = 'branch_manager';
    localStorage.setItem('mock_auth_user', JSON.stringify(user));
    
    setShowBranchSelect(false);
    
    // Use window.location to force a full page reload with the new user context
    window.location.href = '/dashboard/manager';
  };

  // Get all branches for selection
  const allBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
  const currentBranch = allBranches.find((b: any) => b.id === branchId);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">
            Managing staff for: {currentBranch?.name}
          </p>
        </div>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Access Manager Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage your branch operations from the manager's perspective. 
                  You can create waiter and receptionist accounts there.
                </p>
                <Button onClick={handleAccessManagerDashboard} variant="default">
                  <UserCog className="mr-2 h-4 w-4" />
                  Open Manager Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manager Accounts</CardTitle>
                <CardDescription>Create and manage branch manager accounts</CardDescription>
              </div>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Manager
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {managers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No managers yet. Add your first manager!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {managers.map((member) => (
                  <Card key={member.id} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg">{member.name}</h4>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                            <Badge variant="outline">Manager</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </div>
                            )}
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <span className="font-medium">Username:</span> {member.username}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setStaffToDelete(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OwnerStaffDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        branchId={branchId}
        staff={selectedStaff}
      />

      <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this manager? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => staffToDelete && handleDelete(staffToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showBranchSelect} onOpenChange={setShowBranchSelect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Branch</DialogTitle>
            <DialogDescription>
              Choose which branch to manage as a manager
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <Select value={selectedBranchForManager} onValueChange={setSelectedBranchForManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {allBranches.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowBranchSelect(false)}>
                Cancel
              </Button>
              <Button onClick={handleBranchSelection}>
                Continue to Manager Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
