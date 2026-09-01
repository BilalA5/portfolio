import * as THREE from "three";
import gsap from "gsap";



export const TAG_W = 104;
export const TAG_H = 40;













export function createTag(params, uniforms) {
  const box = { sx: 0.5, sy: 0 };
  const arrow = new Image();
  let arrowReady = false;
  let tex = null;

  const build = () => {
    
    const dpr = Math.min(window.devicePixelRatio, 2) * 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(TAG_W * dpr);
    canvas.height = Math.ceil(TAG_H * dpr);

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.font = `${params.tagWeight} ${params.tagSize}px "${params.textFont}", ui-sans-serif, system-ui, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";

    const w = ctx.measureText(params.tagText).width;
    const run = params.tagArrow + params.tagGap + w;
    const x0 = (TAG_W - run) * 0.5;

    ctx.fillText(
      params.tagText,
      x0 + params.tagArrow + params.tagGap,
      TAG_H * 0.5,
    );
    if (arrowReady) {
      const y = (TAG_H - params.tagArrow) * 0.5;
      ctx.drawImage(arrow, x0, y, params.tagArrow, params.tagArrow);
    }

    tex?.dispose();
    tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    uniforms.uTagTex.value = tex;
  };

  const show = (on) => {
    gsap.killTweensOf(box);
    if (on) {
      
      
      gsap.to(box, { sx: 1, duration: 0.62, ease: "elastic.out(1, 0.5)" });
      gsap.to(box, { sy: 1, duration: 0.74, ease: "elastic.out(1, 0.42)" });
    } else {
      
      gsap.to(box, { sx: 0.5, sy: 0, duration: 0.28, ease: "power3.in" });
    }
  };

  const load = (onReady) => {
    arrow.onload = () => {
      arrowReady = true;
      onReady?.();
    };
    arrow.src = "/arrow-top-right-svgrepo-com.svg";
  };

  const dispose = () => {
    gsap.killTweensOf(box);
    tex?.dispose();
  };

  return { box, build, show, load, dispose };
}
