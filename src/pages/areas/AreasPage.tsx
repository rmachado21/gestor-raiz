
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingPage, LoadingCard } from '@/components/ui/loading';

interface Area {
  id: string;
  nome: string;
  tamanho_hectares: number;
  localizacao?: string;
  solo_tipo?: string;
  observacoes?: string;
  ativa: boolean;
  created_at: string;
}

const AreasPage = () => {
  const { effectiveUserId, isImpersonating } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tamanho_hectares: '',
    localizacao: '',
    solo_tipo: '',
    observacoes: ''
  });

  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Area[];
    },
    enabled: !!effectiveUserId
  });

  const createAreaMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('areas')
        .insert([{ ...data, user_id: effectiveUserId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({ title: 'Área criada com sucesso!' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao criar área',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const updateAreaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('areas')
        .update(data)
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({ title: 'Área atualizada com sucesso!' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao atualizar área',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const deleteAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({ title: 'Área removida com sucesso!' });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao remover área',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      tamanho_hectares: '',
      localizacao: '',
      solo_tipo: '',
      observacoes: ''
    });
    setEditingArea(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      tamanho_hectares: parseFloat(formData.tamanho_hectares)
    };
    
    if (editingArea) {
      updateAreaMutation.mutate({ id: editingArea.id, data });
    } else {
      createAreaMutation.mutate(data);
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      nome: area.nome,
      tamanho_hectares: area.tamanho_hectares.toString(),
      localizacao: area.localizacao || '',
      solo_tipo: area.solo_tipo || '',
      observacoes: area.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta área?')) {
      deleteAreaMutation.mutate(id);
    }
  };

  if (!effectiveUserId) {
    return <LoadingPage message="Carregando autenticação..." />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-teal-600" />
          <div>
            <h1 className="font-bold text-gray-900 text-2xl">Gestão de Áreas</h1>
            <p className="text-gray-600">
              Gerencie os setores e áreas de plantio
              {isImpersonating && <span className="text-orange-600 ml-2">(Visualizando como usuário)</span>}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button disabled className="bg-green-600">
            <Plus className="h-4 w-4 mr-2" />
            Nova Área
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LoadingCard count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <MapPin className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">Gestão de Áreas</h1>
          <p className="text-gray-600">
            Gerencie os setores e áreas de plantio
            {isImpersonating && <span className="text-orange-600 ml-2">(Visualizando como usuário)</span>}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm} 
              className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Área
            </Button>
          </DialogTrigger>
          <DialogContent className="animate-scale-in">
            <DialogHeader>
              <DialogTitle>
                {editingArea ? 'Editar Área' : 'Nova Área'}
              </DialogTitle>
              <DialogDescription>
                {editingArea ? 'Atualize as informações da área' : 'Cadastre uma nova área de plantio'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Área</Label>
                <Input 
                  id="nome" 
                  value={formData.nome} 
                  onChange={e => setFormData({ ...formData, nome: e.target.value })} 
                  placeholder="Ex: Setor A, Horta Norte..." 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="tamanho">Tamanho (hectares)</Label>
                <Input 
                  id="tamanho" 
                  type="number" 
                  step="0.01" 
                  value={formData.tamanho_hectares} 
                  onChange={e => setFormData({ ...formData, tamanho_hectares: e.target.value })} 
                  placeholder="Ex: 2.5" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="localizacao">Localização</Label>
                <Input 
                  id="localizacao" 
                  value={formData.localizacao} 
                  onChange={e => setFormData({ ...formData, localizacao: e.target.value })} 
                  placeholder="Ex: Coordenadas GPS, ponto de referência..." 
                />
              </div>
              
              <div>
                <Label htmlFor="solo_tipo">Tipo de Solo</Label>
                <Input 
                  id="solo_tipo" 
                  value={formData.solo_tipo} 
                  onChange={e => setFormData({ ...formData, solo_tipo: e.target.value })} 
                  placeholder="Ex: Argiloso, Arenoso, Misto..." 
                />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes" 
                  value={formData.observacoes} 
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })} 
                  placeholder="Informações adicionais sobre a área..." 
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingArea ? 'Atualizar' : 'Criar'} Área
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areas?.map(area => (
          <Card key={area.id} className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-teal-600" />
                  {area.nome}
                </span>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(area)}
                    className="h-8 w-8 p-0 hover:bg-teal-50"
                  >
                    <Pencil className="h-4 w-4 text-teal-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(area.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {area.tamanho_hectares} hectares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {area.localizacao && (
                  <p><strong>Local:</strong> {area.localizacao}</p>
                )}
                {area.solo_tipo && (
                  <p><strong>Solo:</strong> {area.solo_tipo}</p>
                )}
                {area.observacoes && (
                  <p><strong>Obs:</strong> {area.observacoes}</p>
                )}
                <p className="text-gray-500">
                  Criada em {new Date(area.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!areas || areas.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma área cadastrada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando sua primeira área de plantio
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Área
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AreasPage;
