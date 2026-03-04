// ============================================================
// Components - Loading
// ============================================================
import React from 'react';

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(255,255,255,.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const spinner = {
  width: 64,
  height: 64,
  border: "3px solid #ddd",
  borderTop: "3px solid #111",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

type LoadingProps = {
  size: number;
};


export function Loading({ size = 56 }: LoadingProps) {
  return (
    <div style={overlay}>
      <div style={spinner} />
    </div>
  );
}