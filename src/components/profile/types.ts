
import { z } from 'zod';
import { nameSchema, phoneSchema } from '@/lib/security';

const cnpjSchema = z.string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
  .optional()
  .or(z.literal(''));

export const profileSchema = z.object({
  nome: nameSchema,
  telefone: phoneSchema,
  empresa_nome: z.string().max(200, 'Nome da empresa muito longo').optional(),
  cnpj: cnpjSchema,
  endereco: z.string().max(300, 'Endereço muito longo').optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
