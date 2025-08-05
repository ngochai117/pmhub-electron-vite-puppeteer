import { AnimatePresence, motion } from "framer-motion";

import React, { memo } from "react";

interface Props {
  open: boolean;
  requestClose?: () => void;
  children: React.ReactNode;
  outsideClose?: boolean;
  zIndex?: number;
  bodyClass?: string;
  closeButton?: boolean;
}

const Modal: React.FC<Props> = (props) => {
  const {
    open,
    requestClose,
    children,
    outsideClose,
    zIndex = 10,
    bodyClass,
    closeButton,
  } = props || {};

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 backdrop-blur-sm bg-black/10`}
            onClick={outsideClose ? requestClose : undefined}
            style={{ zIndex }}
          />

          {/* modal */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 28,
                duration: 0.5,
              },
            }}
            exit={{
              scale: 0.2,
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            className={`
              fixed
              min-w-[50%] max-w-[80%] rounded-2xl 
              bg-(--modal-body-bg) backdrop-blur-md 
              shadow-xl
              origin-center border border-white/20 p-(--padding) 
              ${bodyClass || ""}`}
            style={{
              boxShadow:
                "0 8px 24px light-dark(rgba(0,0,0,0.2),rgba(255,255,255,0.1)), inset 0 0 0 1px light-dark(rgba(255,255,255,0.1), rgba(0,0,0,0.1))",
              zIndex: zIndex + 1,
            }}
          >
            {children}
            {!!closeButton && (
              <button
                className="absolute top-3 right-3 rounded-full w-8 h-8 flex items-center justify-center"
                style={{ padding: 0 }}
                onClick={requestClose}
              >
                <span className="spin-hover">✖</span>
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default memo(Modal);
