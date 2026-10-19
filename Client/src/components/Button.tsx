interface ButtonProps {
  label: string;
  type?: "button" | "submit" | "reset";
  onClick?:()=>void
}

export function Button({
  label,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full rounded-xl bg-[#F27A58] py-3.5 font-semibold text-white shadow-[0_4px_12px_rgba(50,35,25,0.08)] transition hover:bg-[#E96947] hover:shadow-md"
    >
      {label}
    </button>
  );
}


