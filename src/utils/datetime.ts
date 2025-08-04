import moment from "moment";
import { Project, WorkLog } from "../types/user";

/**
 * @param input "Jul 23 - Aug 22, 2025"
 * @returns { start: moment.Moment, end: moment.Moment }
 */
export function parseDateRange(input: string): {
  start: moment.Moment;
  end: moment.Moment;
} {
  const parts = input.split("-");
  const nowYear = moment().year();

  const part1 = parts[0].trim(); // e.g. "Jul 23"
  const part2 = parts[1].trim(); // e.g. "Aug 22, 2025" or "Aug 22"

  // Nếu có năm ở phần sau → lấy năm đó, dùng để xử lý cả start
  const matchEnd = part2.match(/([A-Za-z]+ \d{1,2})(?:, (\d{4}))?/);
  if (!matchEnd) throw new Error("Invalid format");

  const endDateStr = matchEnd[1]; // "Aug 22"
  const endYear = matchEnd[2] ? parseInt(matchEnd[2]) : nowYear;

  const end = moment(`${endDateStr} ${endYear}`, "MMM D YYYY");

  // Giả định: nếu tháng bắt đầu lớn hơn tháng kết thúc → khác năm (VD: Dec → Jan)
  const startMonth = part1.split(" ")[0];
  const startDay = part1.split(" ")[1];
  const startMoment = moment(
    `${startMonth} ${startDay} ${endYear}`,
    "MMM D YYYY"
  );
  const start = startMoment.isAfter(end)
    ? startMoment.subtract(1, "year")
    : startMoment;

  return { start, end };
}

export function generateLogWorkByRange(
  range: { start: moment.Moment; end: moment.Moment },
  projects: Project[]
): WorkLog[] {
  const logs: WorkLog[] = [];

  const allDates: string[] = [];
  const current = range.start.clone().local();
  const end = range.end.clone().local();

  // Lấy các ngày làm việc (thứ 2 → 6)
  while (current.isSameOrBefore(end)) {
    const day = current.day();
    if (day >= 1 && day <= 5) {
      allDates.push(current.format("YYYY-MM-DD"));
    }
    current.add(1, "day");
  }

  const totalHours = allDates.length * 8;

  // Chuẩn bị map số giờ còn lại cho từng project
  const projectQueue = projects.map((p) => ({
    ...p,
    remaining: Math.round((p.rate / 100) * totalHours),
  }));

  // Phân bổ theo từng ngày
  for (const date of allDates) {
    let hoursLeft = 8;

    for (const project of projectQueue) {
      if (project.remaining === 0) continue;

      const useHours = Math.min(hoursLeft, project.remaining);

      logs.push({
        date,
        projectId: project.id,
        hours: useHours,
      });

      project.remaining -= useHours;
      hoursLeft -= useHours;

      if (hoursLeft === 0) break;
    }
  }

  return logs;
}
