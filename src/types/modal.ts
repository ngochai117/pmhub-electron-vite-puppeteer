export interface ModalCommon {
  type: "error" | "warning" | "info" | "success";
  title: string;
  desc?: string;
  cta?: string;
}
