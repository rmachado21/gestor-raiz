// Função para determinar a máscara do CPF/CNPJ dinamicamente
export const getCpfCnpjMask = (value: string) => {
  // Remove todos os caracteres não numéricos para contar apenas dígitos
  const cleanValue = value.replace(/\D/g, '');
  
  // Lógica de determinação da máscara:
  // - CPF: 11 dígitos (000.000.000-00)
  // - CNPJ: 14 dígitos (00.000.000/0000-00)
  // 
  // A transição ocorre quando o usuário digita o 12º dígito,
  // momento em que a interface muda automaticamente para o formato CNPJ
  if (cleanValue.length > 11) {
    return '99.999.999/9999-99'; // Máscara de CNPJ (14 dígitos)
  } else {
    return '999.999.999-99'; // Máscara de CPF (11 dígitos)
  }
};

// Máscara única para telefone fixo e celular
export const getTelefoneMask = () => {  
    return '(99) 99999-9999'; // Celular
};

// Função para máscara de CEP
export const getCepMask = () => {
  return '99999-999';
};

// Função para aplicar máscara dinamicamente
export const applyMask = (value: string, maskFunction: (value: string) => string) => {
  if (!value) return '';
  const mask = maskFunction(value);
  let maskedValue = '';
  let valueIndex = 0;
  const cleanValue = value.replace(/\D/g, '');
  
  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else {
      maskedValue += mask[i];
    }
  }
  
  return maskedValue;
};
