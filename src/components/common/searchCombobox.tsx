import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "../ui/combobox";

type ComboboxOption = {
  id: string;
  label: string;
  description?: string;
};

type SearchComboboxProps = {
  disabled?: boolean;
  emptyMessage: string;
  onSearchChange: (value: string) => void;
  onValueChange: (value: string | null) => void;
  options: ComboboxOption[];
  placeholder: string;
  search: string;
  value?: string;
}

export default function SearchCombobox({
  disabled,
  emptyMessage,
  onSearchChange,
  onValueChange,
  options,
  placeholder,
  search,
  value,
}: SearchComboboxProps) {
  return (
    <Combobox
      items={options}
      itemToStringLabel={item => item.label}
      isItemEqualToValue={(item, selected) => item.id === selected.id}
      value={options.find(option => option.id === value) || null}
      onInputValueChange={onSearchChange}
      onValueChange={selected => onValueChange(selected?.id || null)}
    >
      <ComboboxInput
        className="w-full"
        disabled={disabled}
        placeholder={placeholder}
        showClear
        value={search}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {option => (
            <ComboboxItem key={option.id} value={option}>
              <div>
                <span className="font-medium">{option.label}</span>
                {option.description && (
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}