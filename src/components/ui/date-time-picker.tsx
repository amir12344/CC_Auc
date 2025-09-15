"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

export function DateTimePicker({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (newDate: Date | undefined) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Time selection state
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<"AM" | "PM">("PM");

  const getHours24 = useCallback((hr: number, pd: "AM" | "PM") => {
    if (pd === "AM") {
      return hr === 12 ? 0 : hr;
    }
    return hr === 12 ? 12 : hr + 12;
  }, []);

  // Hours array (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // Minutes array (00, 15, 30, 45)
  const minutes = [0, 15, 30, 45];

  // Effect to initialize time values when date changes
  useEffect(() => {
    if (value) {
      const h = value.getHours();
      setHour(h % 12 === 0 ? 12 : h % 12);
      setMinute(Math.floor(value.getMinutes() / 15) * 15);
      setPeriod(h >= 12 ? "PM" : "AM");
    }
  }, [value]);

  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      const hours24 = getHours24(hour, period);
      newDate.setHours(hours24, minute, 0, 0);
      if (newDate.getTime() !== value.getTime()) {
        onChange(newDate);
      }
    }
  }, [value, hour, minute, period, onChange, getHours24]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve the current time when selecting a new date
      let currentHour: number;

      if (value) {
        currentHour = value.getHours();
      } else {
        currentHour = getHours24(hour, period);
      }

      const currentMinute = value ? value.getMinutes() : minute;

      selectedDate.setHours(currentHour, currentMinute, 0, 0);
      onChange(selectedDate);
    } else {
      onChange(undefined);
    }
  };

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-12 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          variant="outline"
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              <span>{format(value, "PPP p")}</span>
            ) : (
              <span>Select date and time</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl p-0 shadow-md">
        <Calendar
          disabled={(currentDate) => {
            // Disable dates in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return currentDate < today;
          }}
          // Allow users to manually pick month and year via dropdowns for better UX
          captionLayout="dropdown"
          fromYear={new Date().getFullYear()}
          toYear={new Date().getFullYear() + 5}
          // Make header less cramped and hide duplicate text caption
          className="p-4"
          classNames={{
            caption: "flex items-center justify-between px-2 pt-1 pb-2",
            caption_label: "hidden",
            caption_dropdowns: "flex gap-2",
            nav: "flex items-center gap-1",
          }}
          initialFocus
          mode="single"
          onSelect={handleSelect}
          selected={value}
        />
        <div className="border-border border-t p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Hour selection */}
              <Select
                onValueChange={(hourValue) =>
                  setHour(Number.parseInt(hourValue, 10))
                }
                value={hour.toString()}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm">:</span>

              {/* Minute selection */}
              <Select
                onValueChange={(minuteValue) =>
                  setMinute(Number.parseInt(minuteValue, 10))
                }
                value={minute.toString()}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* AM/PM selection */}
              <Select
                onValueChange={(periodValue) =>
                  setPeriod(periodValue as "AM" | "PM")
                }
                value={period}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
              variant="default"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
