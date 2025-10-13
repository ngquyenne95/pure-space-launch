import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Database,
  Settings,
  Users,
  Building2,
  Activity
} from 'lucide-react';
import { mockBranches, mockStaff, mockMembers } from '@/data/mockData';

const AdminDashboard = () => {
  const totalStaff = mockStaff.length;
  const activeStaff = mockStaff.filter(s => s.status === 'active').length;
  const totalBranches = mockBranches.length;
  const activeBranches = mockBranches.filter(b => b.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              System-wide administration and monitoring
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Administrator
          </Badge>
        </div>

        {/* System Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBranches}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeBranches} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaff}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeStaff} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMembers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Online</div>
              <p className="text-xs text-muted-foreground mt-1">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Branch Management</CardTitle>
                <CardDescription>Oversee all restaurant branches</CardDescription>
              </div>
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBranches.map((branch) => (
                <Card key={branch.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{branch.name}</h4>
                          <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                            {branch.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{branch.address}</p>
                        <p className="text-sm text-muted-foreground">{branch.phone}</p>
                        {branch.managerId && (
                          <p className="text-sm">
                            Manager: <span className="font-medium">
                              {mockStaff.find(s => s.id === branch.managerId)?.name || 'Not assigned'}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Administration */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>Manage user permissions and access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Administrators</p>
                    <p className="text-sm text-muted-foreground">Full system access</p>
                  </div>
                  <Badge>1</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Branch Managers</p>
                    <p className="text-sm text-muted-foreground">Branch-level management</p>
                  </div>
                  <Badge>1</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Staff</p>
                    <p className="text-sm text-muted-foreground">Daily operations</p>
                  </div>
                  <Badge>2</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Manage Roles & Permissions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Database Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  System Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  System Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
