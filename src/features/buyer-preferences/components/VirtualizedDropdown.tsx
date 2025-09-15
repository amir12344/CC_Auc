"use client";

import React, { useMemo, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedDropdownProps<T> {
  items: T[];
  height?: number; // px
  itemHeight?: number; // px estimate
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onEndReached?: () => void;
}

export function VirtualizedDropdown<T>({
  items,
  height = 300,
  itemHeight = 36,
  overscan = 8,
  renderItem,
  onEndReached,
}: VirtualizedDropdownProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const count = items.length;

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useMemo(() => {
    if (!onEndReached || virtualItems.length === 0) return;
    const last = virtualItems[virtualItems.length - 1];
    if (last.index >= count - 1) {
      onEndReached();
    }
  }, [virtualItems, count, onEndReached]);

  return (
    <div
      ref={parentRef}
      style={{
        height,
        overflow: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const index = virtualRow.index;
          const item = items[index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedDropdown;
