import React from "react";

interface ListingsPageHeaderProps {
  title: string;
  count?: number;
  right?: React.ReactNode;
  className?: string;
}

export const ListingsPageHeader = ({
  title,
  count,
  right,
  className,
}: ListingsPageHeaderProps) => {
  return (
    <div
      className={`mb-8 flex items-center justify-between ${className ?? ""}`}
    >
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {typeof count === "number" && (
          <p className="mt-1 text-sm text-gray-600">{count} listings</p>
        )}
      </div>
      {right ? <div className="flex items-center">{right}</div> : null}
    </div>
  );
};
