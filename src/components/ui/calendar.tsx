"use client";

import * as React from "react";
import { DayPicker, DropdownProps } from "react-day-picker";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // Center the calendar grid to avoid a large empty gutter on one side
        months:
          "flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 mx-auto",
        caption: "flex justify-between w-full pt-1 relative items-center",
        // Show month and year in header (was hidden) so users can see current context
        caption_label: "text-sm font-medium",
        dropdown_month: "flex",
        dropdown_year: "flex",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "border-collapse space-y-1 mx-auto",
        head_row: "flex justify-center",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex justify-center mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        caption_dropdowns: "flex gap-1",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ value, onChange, children, ...props }: DropdownProps) => {
          const options = React.Children.toArray(
            children
          ) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find(
            (child) => String(child.props.value) === String(value)
          );
          const handleChange = (value: string) => {
            const parsedValue = props.name === "years" ? Number(value) : value;
            const changeEvent = {
              target: { value: parsedValue },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value != null ? String(value) : undefined}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="pr-1.5 focus:ring-0">
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                <ScrollArea className="h-80">
                  {options.map((option, id: number) => (
                    <SelectItem
                      key={id}
                      value={option.props.value?.toString() ?? ""}
                    >
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
