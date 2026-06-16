import { ReactNode } from "react";

export function AppMotionProvider({ children }: { children: ReactNode }) {
  return <div className="mv-smart-page">{children}</div>;
}
