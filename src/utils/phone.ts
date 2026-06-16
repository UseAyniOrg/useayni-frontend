export const formatPhone = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');

export const unformatPhone = (value: string) => value.replace(/\D/g, '');
export const validatePhone = (value: string) => unformatPhone(value).length >= 10;
