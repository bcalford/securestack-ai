type TabOption<T extends string> = {
  value: T;
  label: string;
};

type TabsProps<T extends string> = {
  ariaLabel: string;
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** A visually distinct segmented control, used for mode selectors (e.g. scan input mode). */
export default function Tabs<T extends string>({ ariaLabel, options, value, onChange }: TabsProps<T>) {
  return (
    <div className="segmented-control" role="group" aria-label={ariaLabel}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={`segmented-option${value === option.value ? ' active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
