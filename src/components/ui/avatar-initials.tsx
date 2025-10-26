import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
  name: string;
  className?: string;
}

export const AvatarInitials = ({ name, className }: AvatarInitialsProps) => {
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <Avatar className={cn("h-20 w-20", className)}>
      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};
