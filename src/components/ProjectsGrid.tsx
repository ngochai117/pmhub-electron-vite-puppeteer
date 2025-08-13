import React, { memo, useMemo } from "react";
import LiquidGlass from "./liquid-glass/LiquidGlass";
import { Project } from "../types/user";
import { motion, AnimatePresence } from "motion/react";
import { getNumber } from "../utils/data";
import { translate } from "../utils/localize";
import Scheduler from "./Scheduler";

interface Props {
  projects?: Project[];
  updateProjects: (projects: Project[]) => void;
}

const getUniqueId = () => Date.now().toString();

const ProjectsGrid: React.FC<Props> = (props) => {
  const { projects: projectsProp, updateProjects } = props || {};

  const projects = useMemo(() => {
    return projectsProp && projectsProp?.length > 0
      ? projectsProp
      : [{ uniqueId: getUniqueId() }];
  }, [projectsProp]);

  const addProjectRow = () => {
    updateProjects([...(projects || []), { uniqueId: getUniqueId() }]);
  };

  const removeProjectRow = (index: number) => {
    updateProjects([...(projects || [])].filter((_, i) => i !== index));
  };

  const onChangeId = (index: number, value: string) => {
    projects[index].id = value;
    updateProjects([...projects]);
  };

  const onChangeRate = (index: number, value: string) => {
    projects[index].rate = value === "" ? undefined : getNumber(value);
    updateProjects([...projects]);
  };

  const renderProjects = () => (
    <motion.ul
      className="grid gap-(--gap-inside)"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      }}
    >
      <AnimatePresence>
        {projects?.map((project, index) => (
          <motion.li
            key={`project-${project?.uniqueId || index}`}
            initial={{
              x: -50,
              scale: 0.8,
              opacity: 0,
              transformOrigin: "top left",
            }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            exit={{
              x: 0,
              scale: 0.4,
              opacity: 0,
              transformOrigin: "top right",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <LiquidGlass className="p-4 flex flex-col gap-(--gap-inside)">
              <input
                placeholder="Project ID"
                value={project.id}
                onChange={(e) => onChangeId(index, e.target.value)}
              />
              <input
                placeholder="Rate Log (%)"
                value={project.rate}
                type="number"
                min={0}
                max={100}
                onChange={(e) => onChangeRate(index, e.target.value)}
              />

              <button
                className="absolute translate-x-[30%] -translate-y-[30%] top-0 right-0 rounded-full w-10 h-10 flex items-center justify-center"
                style={{ padding: 0 }}
                onClick={() => removeProjectRow(index)}
                disabled={projects?.length === 1}
              >
                <span className="spin-hover">✖</span>
              </button>
            </LiquidGlass>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );

  return (
    <div className="flex flex-col gap-(--gap)">
      {renderProjects()}
      <div className="flex justify-between gap-4">
        <LiquidGlass className="clickable">
          <button
            type="button"
            className="flex wrap-icon"
            onClick={addProjectRow}
          >
            <i className="fa-solid fa-plus icon-left spin-hover"></i>
            {translate("add_project")}
          </button>
        </LiquidGlass>
        <Scheduler />
      </div>
    </div>
  );
};

export default memo(ProjectsGrid);
