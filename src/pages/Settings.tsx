import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Database,
  Save,
  Moon,
  Sun
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/App';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user } = useAuth();

  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleSaveOrg = () => {
    toast.success('Configurações da organização atualizadas!');
  };

  const handleExportData = () => {
    toast.info('Iniciando exportação de dados...');
    setTimeout(() => {
      toast.success('Exportação concluída com sucesso!');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    toast.error('Conta excluída (simulação).');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta e as preferências do sistema.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize seus dados pessoais e perfil público.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Nome</Label>
                  <Input id="first-name" defaultValue={user?.displayName?.split(' ')[0] || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Sobrenome</Label>
                  <Input id="last-name" defaultValue={user?.displayName?.split(' ').slice(1).join(' ') || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de E-mail</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Input id="bio" placeholder="Conte-nos sobre você..." />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button size="sm" onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações da Organização</CardTitle>
              <CardDescription>Configure os detalhes da sua empresa para faturas e relatórios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nome da Organização</Label>
                <Input id="org-name" defaultValue="Nexus Solutions Inc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">Endereço</Label>
                <Input id="org-address" defaultValue="123 Business Ave, Suite 100, San Francisco, CA" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" size="sm" onClick={handleSaveOrg}>Atualizar Organização</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações por E-mail</CardTitle>
              <CardDescription>Escolha quais atualizações você deseja receber por e-mail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Vendas</Label>
                  <p className="text-sm text-muted-foreground">Receba e-mails para cada novo pedido de venda.</p>
                </div>
                <Button variant="outline" size="sm">Ativado</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Estoque</Label>
                  <p className="text-sm text-muted-foreground">Seja notificado quando os níveis de estoque estiverem baixos.</p>
                </div>
                <Button variant="outline" size="sm">Ativado</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">Um resumo do desempenho do seu negócio toda segunda-feira.</p>
                </div>
                <Button variant="outline" size="sm">Desativado</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie sua senha e configurações de segurança.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button size="sm" onClick={() => toast.success('Senha atualizada com sucesso!')}>
                <Shield className="mr-2 h-4 w-4" />
                Atualizar Senha
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
              <CardDescription>Adicione uma camada extra de segurança à sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status do 2FA</Label>
                  <p className="text-sm text-muted-foreground">Atualmente desativado.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info('Configuração de 2FA em breve.')}>Configurar 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>Você está atualmente no plano Pro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Plano Pro (Anual)</p>
                    <p className="text-sm text-muted-foreground">R$ 199,00 / mês, cobrado anualmente</p>
                  </div>
                </div>
                <Badge>Ativo</Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => toast.info('Gerenciamento de assinaturas em breve.')}>Cancelar Assinatura</Button>
              <Button size="sm" onClick={() => toast.info('Opções de upgrade em breve.')}>Fazer Upgrade</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis para sua conta e dados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exportar Todos os Dados</Label>
                  <p className="text-sm text-muted-foreground">Baixe um backup completo dos seus dados do ERP em formato JSON.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Database className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Excluir Conta</Label>
                  <p className="text-sm text-muted-foreground">Remova permanentemente sua conta e todos os dados associados.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Excluir Conta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
