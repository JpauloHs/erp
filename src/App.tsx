import * as React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/Dashboard';
import { InventoryPage } from './pages/Inventory';
import { CRMPage } from './pages/CRM';
import { SalesPage } from './pages/Sales';
import { FinancePage } from './pages/Finance';
import { SettingsPage } from './pages/Settings';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, FirebaseUser, db, doc, getDoc, setDoc, signInWithPopup, googleProvider } from './firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if user document exists, if not create it
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const isDefaultAdmin = user.email === 'jaoalmeida02@gmail.com';
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            role: isDefaultAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
          setIsAdmin(isDefaultAdmin);
        } else {
          setIsAdmin(userDoc.data().role === 'admin');
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Auth failed:', error);
      if (error.code === 'auth/email-already-in-use') {
        setLoginError('Este email já está em uso.');
      } else if (error.code === 'auth/weak-password') {
        setLoginError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setLoginError('Credenciais inválidas. Tente novamente.');
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLoginError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Auth failed:', error);
      setLoginError('Falha ao fazer login com o Google.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'crm':
        return <CRMPage />;
      case 'sales':
        return <SalesPage />;
      case 'finance':
        return <FinancePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center bg-card p-8 rounded-xl shadow-sm border">
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground text-2xl font-bold">N</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Acesso Restrito</h1>
            <p className="text-muted-foreground">
              {isRegistering ? 'Crie uma conta para acessar o sistema.' : 'Faça login para acessar o sistema.'}
            </p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            className="w-full h-12 text-base font-normal"
            onClick={handleGoogleAuth}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continuar com o Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou continue com email</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@nexuserp.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-destructive text-center">{loginError}</p>
            )}
            <Button type="submit" size="lg" className="w-full h-12 text-lg mt-4">
              <LogIn className="mr-2 h-5 w-5" />
              {isRegistering ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-sm">
            <button 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="text-primary hover:underline"
            >
              {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Crie uma'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      <TooltipProvider>
        <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </AppShell>
        <Toaster position="top-right" />
      </TooltipProvider>
    </AuthContext.Provider>
  );
}
