import { useState } from 'react';

export function useSelect<T>() {
  let [value, setSelected] = useState<string | undefined>(undefined);
  const [list, setList] = useState<T[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const setValue = (value: string) => (value.trim() ? setSelected(value) : setSelected(undefined));
  const clear = () => {
    setSelected(undefined);
    setList([]);
    setSearch('');
    setOpen(false);
  };

  return {
    value,
    setValue,
    list,
    setList,
    clear,
    search,
    setSearch,
    open,
    setOpen,
  };
}
