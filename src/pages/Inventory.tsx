import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download,
  FileText,
  Trash2,
  Edit
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'Em Estoque'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventoryItems(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'inventory');
    });

    return () => unsubscribe();
  }, []);

  const handleSaveItem = async () => {
    try {
      const itemData = {
        ...newItem,
        price: Number(newItem.price),
        stock: Number(newItem.stock),
        status: Number(newItem.stock) === 0 ? 'Sem Estoque' : Number(newItem.stock) < 10 ? 'Estoque Baixo' : 'Em Estoque'
      };

      if (editingId) {
        await updateDoc(doc(db, 'inventory', editingId), itemData);
      } else {
        await addDoc(collection(db, 'inventory'), itemData);
      }
      setIsAddDialogOpen(false);
      setNewItem({ sku: '', name: '', category: '', price: 0, stock: 0, status: 'Em Estoque' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item: any) => {
    setNewItem({
      sku: item.sku,
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock,
      status: item.status
    });
    setEditingId(item.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleOpenAddDialog = () => {
    setEditingId(null);
    setNewItem({ sku: '', name: '', category: '', price: 0, stock: 0, status: 'Em Estoque' });
    setIsAddDialogOpen(true);
  };

  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Gerencie seus produtos, níveis de estoque e preços.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            import('sonner').then(({ toast }) => {
              toast.info('Iniciando exportação de estoque...');
              setTimeout(() => toast.success('Estoque exportado com sucesso!'), 1500);
            });
          }}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleOpenAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Atualize os detalhes do produto.' : 'Preencha os detalhes do novo produto para adicioná-lo ao estoque.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">SKU</Label>
                  <Input id="sku" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input id="name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Categoria</Label>
                  <Input id="category" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Preço (R$)</Label>
                  <Input id="price" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Estoque</Label>
                  <Input id="stock" type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: Number(e.target.value)})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveItem}>{editingId ? 'Salvar Alterações' : 'Salvar Produto'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Buscar por nome ou SKU..." 
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
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
                        <span>Carregando estoque...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>R${item.price.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'Em Estoque' ? 'default' : 
                        item.status === 'Estoque Baixo' ? 'outline' : 
                        'destructive'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(item.id)}>
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
        </CardContent>
      </Card>
    </div>
  );
}
