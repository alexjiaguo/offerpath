"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle node network
    const particleCount = Math.min(Math.floor((width * height) / 24000), 65);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Update position
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce at boundaries
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(17, 17, 17, ${p1.alpha * 0.4})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 140) * 0.16;
            ctx.strokeStyle = `rgba(17, 17, 17, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reduce]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* ── Soft Ambient Glow Blobs for Glassy Refraction ── */}
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-[#FED7AA]/70 via-[#FDBA74]/30 to-transparent blur-[130px] rounded-full animate-pulse [animation-duration:8s]" />
      <div className="absolute top-1/4 -right-32 w-[750px] h-[750px] bg-gradient-to-bl from-[#BAE6FD]/75 via-[#E0F2FE]/40 to-transparent blur-[140px] rounded-full animate-pulse [animation-duration:10s]" />
      <div className="absolute top-2/3 -left-20 w-[650px] h-[650px] bg-gradient-to-tr from-[#BBF7D0]/50 via-[#E0E7FF]/40 to-transparent blur-[120px] rounded-full animate-pulse [animation-duration:9s]" />
      <div className="absolute -bottom-40 right-1/4 w-[800px] h-[600px] bg-gradient-to-t from-[#FED7AA]/60 via-[#FEE2E2]/30 to-transparent blur-[140px] rounded-full" />

      {/* ── Dynamic Particle Canvas ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />
    </div>
  );
}
