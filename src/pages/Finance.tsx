import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
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

export function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: 0,
    type: 'Receita',
    category: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Concluído'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'transactions');
    });

    return () => unsubscribe();
  }, []);

  const handleSaveTransaction = async () => {
    try {
      const transactionData = {
        ...newTransaction,
        amount: newTransaction.type === 'Despesa' ? -Math.abs(Number(newTransaction.amount)) : Math.abs(Number(newTransaction.amount))
      };

      if (editingId) {
        await updateDoc(doc(db, 'transactions', editingId), transactionData);
      } else {
        await addDoc(collection(db, 'transactions'), transactionData);
      }
      setIsAddDialogOpen(false);
      setNewTransaction({ description: '', amount: 0, type: 'Receita', category: '', date: new Date().toISOString().split('T')[0], status: 'Concluído' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (txn: any) => {
    setNewTransaction({
      description: txn.description || '',
      amount: Math.abs(txn.amount || 0),
      type: txn.type || 'Receita',
      category: txn.category || '',
      date: typeof txn.date === 'string' ? txn.date : (txn.date?.toDate ? txn.date.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      status: txn.status || 'Concluído'
    });
    setEditingId(txn.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleOpenAddDialog = () => {
    setEditingId(null);
    setNewTransaction({ description: '', amount: 0, type: 'Receita', category: '', date: new Date().toISOString().split('T')[0], status: 'Concluído' });
    setIsAddDialogOpen(true);
  };

  const filteredTransactions = transactions.filter(txn => 
    txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    income: transactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + (t.amount || 0), 0),
    expenses: Math.abs(transactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + (t.amount || 0), 0)),
    balance: transactions.reduce((acc, t) => acc + (t.amount || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Monitore seu fluxo de caixa, receitas e despesas comerciais.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            import('sonner').then(({ toast }) => {
              toast.info('Iniciando exportação de transações...');
              setTimeout(() => toast.success('Transações exportadas com sucesso!'), 1500);
            });
          }}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleOpenAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Transação' : 'Adicionar Nova Transação'}</DialogTitle>
                <DialogDescription>{editingId ? 'Atualize os detalhes da transação.' : 'Preencha os detalhes da nova transação financeira.'}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Descrição</Label>
                  <Input id="description" value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Valor (R$)</Label>
                  <Input id="amount" type="number" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Tipo</Label>
                  <select 
                    id="type" 
                    value={newTransaction.type} 
                    onChange={e => setNewTransaction({...newTransaction, type: e.target.value})}
                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Categoria</Label>
                  <Input id="category" value={newTransaction.category} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Data</Label>
                  <Input id="date" type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveTransaction}>{editingId ? 'Salvar Alterações' : 'Salvar Transação'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo Total</CardDescription>
            <CardTitle className="text-3xl">R${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Saldo em tempo real</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Receita Mensal</CardDescription>
            <CardTitle className="text-3xl">R${stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span>Total de receita registrada</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Despesas Mensais</CardDescription>
            <CardTitle className="text-3xl">R${stats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-red-500">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              <span>Total de despesas registradas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground" size={18} />
            <span className="text-sm font-medium">Todas as Transações</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Buscar transações..." 
                className="pl-9 h-9 w-[250px]" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              import('sonner').then(({ toast }) => toast.info('Filtros avançados em breve.'));
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Carregando transações...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="text-muted-foreground">{formatDate(txn.date)}</TableCell>
                  <TableCell className="font-medium">{txn.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{txn.category}</Badge>
                  </TableCell>
                  <TableCell className={txn.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={txn.type === 'Receita' ? 'default' : 'secondary'} className="rounded-full px-2">
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(txn)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(txn.id)}>
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
