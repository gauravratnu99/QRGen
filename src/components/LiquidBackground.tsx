import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Subtle minimalist ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.07),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.06),transparent_50%)]" />
      
      {/* Delicate micro-dot grid for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)]" />
    </div>
  );
};


