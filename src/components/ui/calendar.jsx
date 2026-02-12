import * as React from "react";

export function Calendar({ children }) {
  return (
    <div className="rounded-md border p-4">
      {children || "Calendar placeholder"}
    </div>
  );
}
