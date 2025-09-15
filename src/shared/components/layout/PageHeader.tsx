import { cn } from "@/src/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  className,
  children,
}: PageHeaderProps) => {
  return (
    <div className={cn("bg-muted/40 border-b", className)}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-lg">{description}</p>
            )}
          </div>
          {children && (
            <div className="flex items-center space-x-2">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
};
