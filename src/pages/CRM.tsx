import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { db, collection, onSnapshot, handleFirestoreError, OperationType } from '@/firebase';

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export function CRMPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    avatar: '',
    status: 'Ativo'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'customers');
    });

    return () => unsubscribe();
  }, []);

  const handleSaveCustomer = async () => {
    try {
      const customerData = {
        ...newCustomer,
        avatar: newCustomer.avatar || `https://i.pravatar.cc/150?u=${newCustomer.email}`
      };

      if (editingId) {
        await updateDoc(doc(db, 'customers', editingId), customerData);
      } else {
        await addDoc(collection(db, 'customers'), customerData);
      }
      setIsAddDialogOpen(false);
      setNewCustomer({ name: '', email: '', phone: '', company: '', avatar: '', status: 'Ativo' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleEdit = (customer: any) => {
    setNewCustomer({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      avatar: customer.avatar || '',
      status: customer.status || 'Ativo'
    });
    setEditingId(customer.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
      import('sonner').then(({ toast }) => toast.success('Cliente excluído com sucesso!'));
    } catch (error) {
      console.error('Error deleting customer:', error);
      import('sonner').then(({ toast }) => toast.error('Erro ao excluir cliente.'));
    }
  };

  const handleOpenAddDialog = () => {
    setEditingId(null);
    setNewCustomer({ name: '', email: '', phone: '', company: '', avatar: '', status: 'Ativo' });
    setIsAddDialogOpen(true);
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seu banco de dados de clientes e relacionamentos.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenAddDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
              <DialogDescription>{editingId ? 'Atualize os detalhes do cliente.' : 'Preencha os detalhes do novo cliente.'}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatar" className="text-right">URL da Foto</Label>
                <Input id="avatar" placeholder="https://exemplo.com/foto.jpg" value={newCustomer.avatar} onChange={e => setNewCustomer({...newCustomer, avatar: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input id="name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telefone</Label>
                <Input id="phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">Empresa</Label>
                <Input id="company" value={newCustomer.company} onChange={e => setNewCustomer({...newCustomer, company: e.target.value})} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveCustomer}>{editingId ? 'Salvar Alterações' : 'Salvar Cliente'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Buscar clientes..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => {
          import('sonner').then(({ toast }) => toast.info('Filtros avançados em breve.'));
        }}>Filtros</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={customer.avatar || `https://i.pravatar.cc/150?u=${customer.id}`} />
                    <AvatarFallback>{customer.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{customer.name}</CardTitle>
                    <Badge variant={customer.status === 'Ativo' ? 'default' : 'secondary'} className="mt-1 text-[10px] h-4">
                      {customer.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(customer)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(customer)}>
                      <User className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(customer.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} />
                  <span>{customer.location || 'Não informado'}</span>
                </div>
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{customer.orders || 0} pedidos no total</span>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={() => handleEdit(customer)}>Ver Perfil</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
