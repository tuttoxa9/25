import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full relative",
              isDark && "hover:bg-slate-800 text-slate-300"
            )}
            onClick={toggleTheme}
            aria-label="Переключить тему"
          >
            <Sun className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-300",
              isDark ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"
            )} />

            <Moon className={cn(
              "absolute h-[1.2rem] w-[1.2rem] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
              isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 rotate-90"
            )} />

            <span className="sr-only">
              {isDark ? "Включить светлую тему" : "Включить тёмную тему"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          className={cn(
            isDark && "bg-slate-900 border-slate-700 text-slate-100"
          )}
        >
          <p>{isDark ? "Включить светлую тему" : "Включить тёмную тему"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
