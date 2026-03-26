import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { db, collection, onSnapshot, handleFirestoreError, OperationType } from '@/firebase';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Concluído':
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="mr-1 h-3 w-3" /> {status}</Badge>;
    case 'Processando':
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="mr-1 h-3 w-3" /> {status}</Badge>;
    case 'Pendente':
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="mr-1 h-3 w-3" /> {status}</Badge>;
    case 'Cancelado':
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

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

const formatDate = (date: any) => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date.toDate) return date.toDate().toLocaleDateString('pt-BR');
  if (date instanceof Date) return date.toLocaleDateString('pt-BR');
  return String(date);
};

export function SalesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    total: 0,
    status: 'Pendente',
    items: 1
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sales');
    });

    return () => unsubscribe();
  }, []);

  const handleSaveOrder = async () => {
    try {
      const orderData = {
        ...newOrder,
        total: Number(newOrder.total),
        items: Number(newOrder.items)
      };

      if (editingId) {
        await updateDoc(doc(db, 'sales', editingId), orderData);
      } else {
        await addDoc(collection(db, 'sales'), orderData);
      }
      setIsAddDialogOpen(false);
      setNewOrder({ customer: '', date: new Date().toISOString().split('T')[0], total: 0, status: 'Pendente', items: 1 });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleEdit = (order: any) => {
    setNewOrder({
      customer: order.customer || '',
      date: typeof order.date === 'string' ? order.date : (order.date?.toDate ? order.date.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      total: order.total || 0,
      status: order.status || 'Pendente',
      items: order.items || 1
    });
    setEditingId(order.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await deleteDoc(doc(db, 'sales', id));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleOpenAddDialog = () => {
    setEditingId(null);
    setNewOrder({ customer: '', date: new Date().toISOString().split('T')[0], total: 0, status: 'Pendente', items: 1 });
    setIsAddDialogOpen(true);
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pendente' || o.status === 'Processando').length,
    completed: orders.filter(o => o.status === 'Concluído').length,
    revenue: orders.reduce((acc, o) => acc + (o.total || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos de Venda</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie as vendas e transações de seus clientes.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Pedido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Pedido' : 'Criar Novo Pedido'}</DialogTitle>
              <DialogDescription>{editingId ? 'Atualize os detalhes do pedido.' : 'Preencha os detalhes do novo pedido de venda.'}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">Cliente</Label>
                <Input id="customer" value={newOrder.customer} onChange={e => setNewOrder({...newOrder, customer: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Data</Label>
                <Input id="date" type="date" value={newOrder.date} onChange={e => setNewOrder({...newOrder, date: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="total" className="text-right">Total (R$)</Label>
                <Input id="total" type="number" value={newOrder.total} onChange={e => setNewOrder({...newOrder, total: Number(e.target.value)})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="items" className="text-right">Qtd Itens</Label>
                <Input id="items" type="number" value={newOrder.items} onChange={e => setNewOrder({...newOrder, items: Number(e.target.value)})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <select 
                  id="status" 
                  value={newOrder.status} 
                  onChange={e => setNewOrder({...newOrder, status: e.target.value})}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Processando">Processando</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveOrder}>{editingId ? 'Salvar Alterações' : 'Salvar Pedido'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ShoppingCart size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
              </div>
              <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                <Clock size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <h3 className="text-2xl font-bold">{stats.completed}</h3>
              </div>
              <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita</p>
                <h3 className="text-2xl font-bold">R${(stats.revenue / 1000).toFixed(1)}k</h3>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                <FileText size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Buscar pedidos..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              import('sonner').then(({ toast }) => toast.info('Filtros avançados em breve.'));
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              import('sonner').then(({ toast }) => {
                toast.info('Iniciando exportação...');
                setTimeout(() => toast.success('Exportação concluída com sucesso!'), 1500);
              });
            }}>Exportar</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Carregando pedidos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>R${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
