"use client";

import React from "react";

const stripMotionProps = ({
  initial,
  animate,
  exit,
  transition,
  variants,
  whileHover,
  whileTap,
  whileInView,
  viewport,
  layout,
  ...props
}) => props;

const makeMotion = (tag) =>
  React.forwardRef(function MotionLite(props, ref) {
    return React.createElement(tag, { ...stripMotionProps(props), ref });
  });

export const motion = new Proxy({}, { get: (_, tag) => makeMotion(tag) });
export function AnimatePresence({ children }) {
  return <>{children}</>;
}
