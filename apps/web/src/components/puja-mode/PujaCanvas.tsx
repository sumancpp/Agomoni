import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  type: 'shiuli' | 'ember' | 'incense';
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
}

export const PujaCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const maxParticles = 40;

    const createParticle = (initialY?: number): Particle => {
      const rand = Math.random();
      let type: 'shiuli' | 'ember' | 'incense' = 'ember';
      if (rand < 0.45) type = 'shiuli';
      else if (rand < 0.82) type = 'ember';
      else type = 'incense';

      if (type === 'shiuli') {
        // Shiuli flower/petal falling downwards and swaying gently in autumn breeze
        return {
          x: Math.random() * width,
          y: initialY !== undefined ? initialY : -25,
          type: 'shiuli',
          size: Math.random() * 5 + 5,
          speedY: Math.random() * 0.55 + 0.35,
          speedX: (Math.random() - 0.5) * 0.45,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.025,
          alpha: Math.random() * 0.35 + 0.45,
          maxAlpha: 0.85,
          decay: 0.0004,
        };
      } else if (type === 'ember') {
        // Golden Diya ember floating upwards
        return {
          x: Math.random() * width,
          y: initialY !== undefined ? initialY : height + 15,
          type: 'ember',
          size: Math.random() * 2.5 + 1.2,
          speedY: -(Math.random() * 0.65 + 0.35),
          speedX: (Math.random() - 0.5) * 0.35,
          rotation: 0,
          rotationSpeed: 0,
          alpha: Math.random() * 0.4 + 0.4,
          maxAlpha: 0.9,
          decay: Math.random() * 0.0018 + 0.0008,
        };
      } else {
        // Dhunuchi incense smoke wisp
        return {
          x: Math.random() * width,
          y: initialY !== undefined ? initialY : height * 0.7 + Math.random() * (height * 0.3),
          type: 'incense',
          size: Math.random() * 12 + 10,
          speedY: -(Math.random() * 0.35 + 0.2),
          speedX: (Math.random() - 0.45) * 0.3,
          rotation: Math.random() * Math.PI,
          rotationSpeed: 0.004,
          alpha: 0.06 + Math.random() * 0.08,
          maxAlpha: 0.18,
          decay: 0.0005,
        };
      }
    };

    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(Math.random() * height));
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.type === 'shiuli') {
          // Subtle horizontal sine wave sway like real falling flower
          p.x += Math.sin(p.y * 0.018) * 0.4;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;

          // Render authentic Bengali Shiuli Flower (5 white rounded petals with coral-orange center stem)
          const petalCount = 5;
          const petalRadius = p.size * 0.65;

          // 5 White Petals
          ctx.fillStyle = '#FFF8EC';
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(231, 199, 102, 0.3)';
          for (let petal = 0; petal < petalCount; petal++) {
            const angle = (petal * Math.PI * 2) / petalCount;
            ctx.beginPath();
            ctx.ellipse(
              Math.cos(angle) * petalRadius,
              Math.sin(angle) * petalRadius,
              petalRadius * 0.85,
              petalRadius * 0.45,
              angle,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          // Signature Coral-Orange Center Calyx/Tube (শিউলি বোঁটা)
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = '#E86014';
          ctx.shadowBlur = 3;
          ctx.shadowColor = '#D1261F';
          ctx.fill();

          ctx.restore();

          // Reset when below viewport
          if (p.y > height + 25) {
            particles[i] = createParticle();
          }
        } else if (p.type === 'ember') {
          // Diya golden warm ember
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#E7C766';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#D4AF37';
          ctx.fill();

          // Bright white-hot center core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#FFF8EC';
          ctx.fill();
          ctx.restore();

          if (p.y < -15 || p.alpha <= 0) {
            particles[i] = createParticle();
          }
        } else {
          // Dhunuchi incense smoke puff
          p.size += 0.05;
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 230, 200, 0.45)';
          ctx.shadowBlur = 14;
          ctx.shadowColor = 'rgba(245, 230, 200, 0.2)';
          ctx.fill();
          ctx.restore();

          if (p.y < -25 || p.alpha <= 0) {
            particles[i] = createParticle();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="puja-particles-canvas" />;
};

export default PujaCanvas;
