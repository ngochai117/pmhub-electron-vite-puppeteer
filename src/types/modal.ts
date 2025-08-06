import { ReactNode } from "react";

export interface InfoModalOptions {
  type: "error" | "warning" | "info" | "success";
  title: ReactNode;
  desc?: ReactNode;
  cta?: { title?: string; onClick?: () => void };
}
