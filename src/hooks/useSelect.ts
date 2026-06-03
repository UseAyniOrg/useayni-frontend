import { useState } from "react";

export function useSelect<T>(){
    let [value, setSelected] = useState<string | undefined>(undefined);
    const [list, setList] = useState<T[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const setValue = (value: string) => value.trim() ? setSelected(value) : setSelected(undefined);

    return {
        value,
        setValue,
        list,
        setList,
        search,
        setSearch,
        open,
        setOpen
    }
}