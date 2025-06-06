
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  ativo: boolean;
  observacoes: string | null;
}

interface ClienteFormProps {
  cliente?: Cliente | null;
  onClose: () => void;
}

const ClienteForm = ({ cliente, onClose }: ClienteFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    endereco: cliente?.endereco || '',
    cidade: cliente?.cidade || '',
    observacoes: cliente?.observacoes || '',
    ativo: cliente?.ativo ?? true
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const clienteData = {
        ...data,
        user_id: user.id,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        cidade: data.cidade || null,
        observacoes: data.observacoes || null
      };

      if (cliente) {
        const { error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', cliente.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([clienteData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: cliente ? 'Cliente atualizado' : 'Cliente criado',
        description: `Cliente ${cliente ? 'atualizado' : 'criado'} com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o cliente.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Cidade"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Endereço completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações sobre o cliente..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleChange('ativo', checked)}
            />
            <Label htmlFor="ativo">Cliente ativo</Label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClienteForm;
