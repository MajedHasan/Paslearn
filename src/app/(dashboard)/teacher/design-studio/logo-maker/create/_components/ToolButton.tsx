// create/components/ToolButton.tsx
import { Button } from "@/components/ui/button";

interface ToolButtonProps {
  icon: React.ElementType;
  active?: boolean;
  onClick: () => void;
  label: string;
}

export default function ToolButton({ icon: Icon, active, onClick, label }: ToolButtonProps) {
  return (
    <Button variant={active ? "secondary" : "ghost"} size="icon" className="h-10 w-10" onClick={onClick} title={label}>
      <Icon className="h-5 w-5" />
    </Button>
  );
}