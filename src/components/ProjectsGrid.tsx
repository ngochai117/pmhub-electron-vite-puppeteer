import React, { memo } from "react";
import LiquidGlass from "./liquid-glass/LiquidGlass";
import { Project } from "../types/user";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  projects?: Project[];
  addProjectRow: () => void;
  removeProjectRow: (index: number) => void;
}

const ProjectsGrid: React.FC<Props> = (props) => {
  const { projects, addProjectRow, removeProjectRow } = props || {};

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
            key={`project-${project.id || index}`}
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
              <input placeholder="Project ID" value={project.id} />
              <input
                placeholder="Rate Log (%)"
                value={project.rate}
                type="number"
                min={0}
                max={100}
              />

              <button
                className="absolute translate-x-[30%] -translate-y-[30%] top-0 right-0 rounded-full w-10 h-10 flex items-center justify-center spin-hover"
                style={{ padding: 0 }}
                onClick={() => removeProjectRow(index)}
                disabled={projects?.length === 1}
              >
                <span>✖</span>
              </button>
            </LiquidGlass>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );

  return (
    <AnimatePresence>
      <div className="flex flex-col gap-(--gap)">
        {renderProjects()}
        <LiquidGlass className="clickable">
          <button
            type="button"
            className="flex spin-hover wrap-icon"
            onClick={addProjectRow}
          >
            <i className="fa-solid fa-plus icon-left"></i>
            Thêm project
          </button>
        </LiquidGlass>
      </div>
    </AnimatePresence>
  );
};

export default memo(ProjectsGrid);
