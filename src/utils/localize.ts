const LOCALIZE = {
  //Renderer
  save: "Lưu",
  save_and_log: "Lưu & Chạy ngay",
  close: "Đóng",
  delete_all_log: "Xoá log work",
  delete_all_confirm_desc:
    "Bạn có chắc chắn muốn xoá toàn bộ log work trên PM Hub?",
  add_project: "Thêm project",

  invalid_user: "Thông tin không chính xác",
  invalid_user_desc:
    "Vui lòng nhập đầy đủ thông tin user và tối thiểu một project",
  invalid_license: "License không hợp lệ",
  invalid_license_desc: "Vui lòng kích hoạt để sử dụng tính năng",
  excuse_error: "Thực thi thất bại",
  excuse_error_desc: "Lỗi không xác định",
  login_fail: "Đăng nhập thất bại",
  login_fail_desc: "Vui lòng kiểm tra lại username, password",

  not_found_range_time: "Không tìm thấy range time",
  not_found_project: "Không tìm thấy {{id}}. Vui lòng kiểm tra lại",

  log_error: "Log work thất bại",
  log_success: "Log work thành công",
  log_success_desc: "Hãy kiểm tra lại cho chắc chắn nhé",

  delete_log_error: "Xóa log work thất bại",
  delete_log_error_not_found_log: "Không tìm thấy log nào để xoá",
  delete_log_success: "Xóa log work thành công",
  delete_log_success_desc: "Đã xoá toàn bộ log work",

  setting_calendar: "Đặt lịch",
  setting_calendar_desc_date: "Tự động log work vào {{dateTime}} mỗi tháng",
  setting_calendar_desc: "Chọn ngày, giờ tự động log work",
  date: "Ngày",
  setting_calendar_remove: "Xoá lịch",
};

export const replaceAll = (
  target: string | undefined,
  oldStr: string,
  newStr: string
) => {
  if (typeof target !== "string") {
    return "";
  }
  const regex = new RegExp(oldStr, "g");
  return target?.replace(regex, newStr) || newStr;
};

const replaceMulti = (target: string | undefined, param: ObjectString) => {
  if (typeof target !== "string") {
    return "";
  }
  let out = target;
  for (const key in param) {
    if (key) {
      const textReplace = "{{" + key + "}}";
      out = replaceAll(out, textReplace, String(param[key]));
    }
  }
  return out;
};

export const translate = (
  key: keyof typeof LOCALIZE,
  params?: { [key: string]: any }
) => {
  if (!key) return "";
  if (typeof key === "string") {
    const text = LOCALIZE[key];
    if (typeof text === "string")
      return params ? replaceMulti(text, params) : text;
  }
  return "";
};
