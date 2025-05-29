
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle
} from 'lucide-react';

export const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case 'critica': return 'bg-red-100 text-red-800 border-red-200';
    case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPrioridadeIcon = (prioridade: string) => {
  switch (prioridade) {
    case 'critica': return <AlertTriangle className="h-4 w-4" />;
    case 'alta': return <AlertCircle className="h-4 w-4" />;
    case 'media': return <Info className="h-4 w-4" />;
    case 'baixa': return <CheckCircle className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};
