import React, { memo, useCallback, useEffect, useState } from "react";
import LiquidGlass from "./liquid-glass/LiquidGlass";
import { ELECTRON_EVENTS } from "../constants";
import { translate } from "../utils/localize";
import Modal from "./Modal";
import moment from "moment";
import { getNumber } from "../utils/data";
import { ScheduleReply } from "../schedulers/types";

const Scheduler: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<ScheduleReply>();
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    window.ipcRenderer.invoke(ELECTRON_EVENTS.SCHEDULER_STATUS).then((res) => {
      setSchedulerStatus(res);
      const nextRunAt = res?.nextRun?.nextRunAtISO;

      if (nextRunAt) {
        const nextRunAtMoment = moment(nextRunAt);
        setDay(nextRunAtMoment?.get("date"));
        setTime(nextRunAtMoment?.format("HH:mm"));
      }
    });
  }, []);

  const settingCalendar = useCallback(() => {
    if (!day || !time) return;
    window.ipcRenderer
      .invoke(ELECTRON_EVENTS.SCHEDULER_MONTHLY, {
        day,
        hour: time.split(":")[0],
        minute: time.split(":")[1],
      })
      .then(setSchedulerStatus)
      .catch((err) => {
        console.log("HAI ::: removeCalendar err", err);
      });
  }, [day, time]);

  useEffect(() => {
    settingCalendar();
  }, [settingCalendar]);

  const removeCalendar = () => {
    window.ipcRenderer
      .invoke(ELECTRON_EVENTS.SCHEDULER_REMOVE)
      .then((res) => {
        setDay(0);
        setTime("");
        setSchedulerStatus(res);
      })
      .catch((err) => {
        console.log("HAI ::: settingCalendar err", err);
      });
  };

  const showModal = () => {
    setOpenModal(true);
  };

  const nextRunAt = schedulerStatus?.nextRun?.nextRunAtISO;
  const nextRunAtMoment = nextRunAt ? moment(nextRunAt) : null;
  const dateTime = nextRunAtMoment
    ? nextRunAtMoment.format("[lúc] HH:mm, [ngày] D")
    : "";

  return (
    <>
      <LiquidGlass className={`clickable`}>
        <button onClick={showModal} className="wrap-icon">
          <i className="fa-solid fa-calendar-days icon-left wiggle-hover"></i>
          {translate("setting_calendar")}
        </button>
      </LiquidGlass>

      <Modal
        open={openModal}
        requestClose={() => setOpenModal(false)}
        bodyClass="top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] backdrop-blur-md!"
        zIndex={20}
        closeButton
        outsideClose
      >
        <h2 className="text-lg font-semibold">
          {translate("setting_calendar")}
        </h2>

        <p className="mt-2 text-sm white-space: pre-line;">
          {nextRunAtMoment
            ? translate("setting_calendar_desc_date", { dateTime })
            : translate("setting_calendar_desc")}
        </p>

        <div className="flex justify-between items-center gap-4 mt-4">
          <select
            name="day"
            value={day}
            onChange={(e) => setDay(getNumber(e.target.value))}
          >
            <option value={0} disabled>
              {translate("date").toLowerCase()}
            </option>

            {new Array(31).fill({}).map((_, i) => (
              <option value={i + 1} key={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <input
            type="time"
            step="60"
            className="w-full p-2 border rounded"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button
            className="rounded-full w-10 h-10 flex items-center justify-center"
            onClick={removeCalendar}
          >
            <i className="fa-solid fa-trash icon-left icon-wiggle wiggle-hover"></i>
          </button>
        </div>
      </Modal>
    </>
  );
};

export default memo(Scheduler);
