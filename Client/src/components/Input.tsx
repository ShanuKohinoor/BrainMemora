
interface InputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  value:string;
  onChange: (value: string) => void;
  rightLabel?: string;
}

export function Input({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  rightLabel,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-base font-medium text-[#2D4030]"
        >
          {label}
        </label>

        {rightLabel && (
          <a
            href="#forgot-password"
            className="text-sm text-[#E84A36]"
          >
            {rightLabel}
          </a>
        )}
      </div>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-2xl bg-[#FDF3EC] px-4 py-3 text-[#2D4030] shadow-[inset_4px_4px_8px_#e3d8d1,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-[#A3B19B]"
      />
    </div>
  );
}
