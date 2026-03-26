import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  CreditCard,
  DollarSign,
  Database
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { db, collection, getDocs, setDoc, doc, onSnapshot, handleFirestoreError, OperationType } from '@/firebase';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Jan', vendas: 4000, receita: 2400 },
  { name: 'Fev', vendas: 3000, receita: 1398 },
  { name: 'Mar', vendas: 2000, receita: 9800 },
  { name: 'Abr', vendas: 2780, receita: 3908 },
  { name: 'Mai', vendas: 1890, receita: 4800 },
  { name: 'Jun', vendas: 2390, receita: 3800 },
  { name: 'Jul', vendas: 3490, receita: 4300 },
];

const pieData = [
  { name: 'Eletrônicos', value: 400 },
  { name: 'Roupas', value: 300 },
  { name: 'Casa', value: 300 },
  { name: 'Beleza', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, loading }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === 'up' ? (
              <span className="text-emerald-500 flex items-center"><ArrowUpRight size={12} /> +{trendValue}%</span>
            ) : (
              <span className="text-rose-500 flex items-center"><ArrowDownRight size={12} /> -{trendValue}%</span>
            )}
            desde o mês passado
          </p>
        </>
      )}
    </CardContent>
  </Card>
);

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    revenue: 0,
    salesCount: 0,
    customerCount: 0,
    inventoryCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const totalRevenue = snapshot.docs.reduce((acc, doc) => acc + (doc.data().total || 0), 0);
      setStats(prev => ({ ...prev, revenue: totalRevenue, salesCount: snapshot.size }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sales');
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setStats(prev => ({ ...prev, customerCount: snapshot.size }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'customers');
    });

    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      setStats(prev => ({ ...prev, inventoryCount: snapshot.size }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'inventory');
    });

    return () => {
      unsubSales();
      unsubCustomers();
      unsubInventory();
    };
  }, []);

  const seedData = async () => {
    try {
      // Seed Inventory
      const inventory = [
        { id: '1', sku: 'PRD-001', name: 'Widget Premium', category: 'Eletrônicos', price: 129.99, stock: 45, status: 'Em Estoque' },
        { id: '2', sku: 'PRD-002', name: 'Engrenagem Padrão', category: 'Hardware', price: 49.50, stock: 12, status: 'Estoque Baixo' },
        { id: '3', sku: 'PRD-003', name: 'Capa Ecológica', category: 'Acessórios', price: 24.99, stock: 0, status: 'Sem Estoque' },
      ];
      for (const item of inventory) {
        await setDoc(doc(db, 'inventory', item.id), item);
      }

      // Seed Customers
      const customers = [
        { id: '1', name: 'Alex Rivera', email: 'alex@example.com', phone: '+1 (555) 123-4567', location: 'Nova York, EUA', status: 'Ativo', orders: 12 },
        { id: '2', name: 'Sarah Chen', email: 'sarah.c@tech.io', phone: '+1 (555) 987-6543', location: 'San Francisco, EUA', status: 'Ativo', orders: 8 },
      ];
      for (const customer of customers) {
        await setDoc(doc(db, 'customers', customer.id), customer);
      }

      // Seed Sales
      const sales = [
        { id: 'SO-1001', orderId: 'SO-1001', customer: 'Alex Rivera', date: new Date().toISOString(), total: 1250.00, status: 'Concluído', items: 3 },
        { id: 'SO-1002', orderId: 'SO-1002', customer: 'Sarah Chen', date: new Date().toISOString(), total: 450.50, status: 'Processando', items: 1 },
      ];
      for (const sale of sales) {
        await setDoc(doc(db, 'sales', sale.id), { ...sale, date: new Date() });
      }

      // Seed Transactions
      const transactions = [
        { id: 'TXN-001', txnId: 'TXN-001', date: new Date().toISOString(), description: 'Pedido de Venda SO-1001', category: 'Vendas', amount: 1250.00, type: 'Receita' },
        { id: 'TXN-002', txnId: 'TXN-002', date: new Date().toISOString(), description: 'Aluguel Escritório - Março', category: 'Aluguel', amount: -2500.00, type: 'Despesa' },
      ];
      for (const txn of transactions) {
        await setDoc(doc(db, 'transactions', txn.id), { ...txn, date: new Date() });
      }

      toast.success('Banco de dados populado com sucesso!');
    } catch (error) {
      console.error('Seeding failed:', error);
      toast.error('Falha ao popular o banco de dados.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, aqui está o que está acontecendo hoje.</p>
        </div>
        {isAdmin && (
          <Button onClick={seedData} variant="outline" size="sm">
            <Database className="mr-2 h-4 w-4" />
            Popular Dados de Teste
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Receita Total" 
          value={stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={DollarSign} 
          trend="up" 
          trendValue="20.1" 
          loading={loading}
        />
        <StatCard 
          title="Pedidos de Venda" 
          value={stats.salesCount} 
          icon={ShoppingCart} 
          trend="up" 
          trendValue="12.5" 
          loading={loading}
        />
        <StatCard 
          title="Clientes Ativos" 
          value={stats.customerCount} 
          icon={Users} 
          trend="up" 
          trendValue="5.4" 
          loading={loading}
        />
        <StatCard 
          title="Itens em Estoque" 
          value={stats.inventoryCount} 
          icon={Package} 
          trend="down" 
          trendValue="2.1" 
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral de Receita</CardTitle>
            <CardDescription>Desempenho de receita mensal para o ano atual.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>Distribuição de vendas entre categorias de produtos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Você fez 265 vendas este mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} alt="Avatar" />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Olivia Martin</p>
                    <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                  </div>
                  <div className="ml-auto font-medium">+R$1.999,00</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Status do Estoque</CardTitle>
            <CardDescription>Itens que requerem atenção imediata.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'MacBook Pro M3', stock: 2, status: 'Crítico' },
                { name: 'iPhone 15 Pro', stock: 15, status: 'Baixo' },
                { name: 'Sony WH-1000XM5', stock: 0, status: 'Sem Estoque' },
                { name: 'iPad Air', stock: 8, status: 'Baixo' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{item.stock} em estoque</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      item.status === 'Crítico' ? "bg-rose-100 text-rose-700" :
                      item.status === 'Baixo' ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
