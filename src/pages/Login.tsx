import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { UtensilsCrossed, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      
      // Smart routing based on user role
      if (user.role === 'owner') {
        const storedBranches = localStorage.getItem('mock_branches');
        if (storedBranches) {
          const allBranches = JSON.parse(storedBranches);
          const userBranches = allBranches.filter((b: any) => b.ownerId === user.id);
          
          if (userBranches.length === 0) {
            navigate('/register/package');
          } else {
            // Get unique brands
            const uniqueBrands = Array.from(
              new Map(userBranches.map((b: any) => [b.brandName || 'Default Brand', b])).values()
            );
            
            if (uniqueBrands.length === 1) {
              // Only one brand
              const firstBrand = uniqueBrands[0] as any;
              const brandBranches = userBranches.filter(
                (b: any) => (b.brandName || 'Default Brand') === (firstBrand.brandName || 'Default Brand')
              );
              
              if (brandBranches.length === 1) {
                // Only one branch, select automatically
                localStorage.setItem('selected_brand', firstBrand.brandName || 'Default Brand');
                localStorage.setItem('selected_branch', brandBranches[0].id);
                navigate('/dashboard/owner');
              } else {
                // Multiple branches in brand, show branch selection
                localStorage.setItem('selected_brand', firstBrand.brandName || 'Default Brand');
                navigate('/branch-selection');
              }
            } else {
              // Multiple brands, show brand selection first
              navigate('/brand-selection');
            }
          }
        } else {
          navigate('/register/package');
        }
      } else if (user.role === 'branch_manager') {
        navigate('/dashboard/manager');
      } else if (user.role === 'waiter') {
        navigate('/dashboard/waiter');
      } else if (user.role === 'receptionist') {
        navigate('/dashboard/receptionist');
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handling is done in the auth store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-base">Sign in to your HillDevilOS account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-6 text-center space-y-2">
            <span className="text-sm text-muted-foreground">Are you Staff or Manager?</span>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/restaurant-login')}
            >
              Restaurant Staff Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
