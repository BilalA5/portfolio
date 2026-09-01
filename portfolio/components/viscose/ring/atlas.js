import * as THREE from "three";
import { IMAGE_FILES } from "./projects";


const CELL_W = 512;
const CELL_H = Math.round(CELL_W / 1.5);

const load = (src, priority) =>
  new Promise((resolve, reject) => {
    if (src.endsWith(".mp4")) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.onloadeddata = () => {
        void video.play().catch(() => undefined);
        resolve(video);
      };
      video.onerror = () => reject(new Error(`failed to load ${src}`));
      video.src = src;
      video.load();
      return;
    }
    const img = new Image();
    if (src.startsWith("http")) img.crossOrigin = "anonymous";
    
    if (priority) img.fetchPriority = priority;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });














export function buildAtlas(files = IMAGE_FILES, onProgress) {
  const cols = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / cols);

  const canvas = document.createElement("canvas");
  canvas.width = cols * CELL_W;
  canvas.height = rows * CELL_H;
  const ctx = canvas.getContext("2d");
  const videos = [];

  const texture = new THREE.CanvasTexture(canvas);
  
  texture.flipY = false;
  
  
  
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const paint = (img, i, opacity = 1, blendMode = "source-over") => {
    const x = (i % cols) * CELL_W;
    const y = Math.floor(i / cols) * CELL_H;

    
    const sourceWidth = img.videoWidth || img.width;
    const sourceHeight = img.videoHeight || img.height;
    const scale = Math.max(CELL_W / sourceWidth, CELL_H / sourceHeight);
    const dw = sourceWidth * scale;
    const dh = sourceHeight * scale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, CELL_W, CELL_H); 
    ctx.clip();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = blendMode;
    ctx.drawImage(img, x + (CELL_W - dw) / 2, y + (CELL_H - dh) / 2, dw, dh);
    ctx.restore();
  };

  let settled = 0;
  const tick = () => onProgress?.(settled / files.length);

  const fetchInto = (i, priority) => {
    const source = typeof files[i] === "string" ? { src: files[i] } : files[i];
    const poster = source.poster
        ? load(source.poster, priority)
          .then((img) => {
            paint(img, i, source.posterOpacity ?? 1);
            texture.needsUpdate = true;
            return img;
          })
          .catch((err) => {
            console.warn("[atlas]", err.message);
            return null;
          })
      : Promise.resolve(null);

    return Promise.all([poster, load(source.src, priority)])
      .then(([posterImg, img]) => {
        if (img instanceof HTMLVideoElement) {
          videos.push({
            video: img,
            index: i,
            poster: posterImg,
            posterOpacity: source.posterOpacity ?? 1,
            videoOpacity: source.videoOpacity ?? 1,
            blendMode: source.blendMode ?? "source-over",
            fadeStart: performance.now(),
            fadeDuration: 900,
          });
          if (!posterImg) paint(img, i);
        } else {
          paint(img, i);
        }
      })
      .catch((err) => console.warn("[atlas]", err.message))
      .finally(() => {
        settled++;
        tick();
      });
  };

  
  
  const first = fetchInto(0, "high").then(() => {
    texture.needsUpdate = true;
  });

  
  
  const ready = Promise.all([
    first,
    ...files.slice(1).map((_, k) => fetchInto(k + 1, "low")),
  ]).then(() => {
    texture.needsUpdate = true;
  });

  tick();
  const update = () => {
    const now = performance.now();
    for (const {
      video,
      index,
      poster,
      posterOpacity,
      videoOpacity,
      blendMode,
      fadeStart,
      fadeDuration,
    } of videos) {
      if (video.readyState >= 2) {
        const opacity = Math.min(1, (now - fadeStart) / fadeDuration) * videoOpacity;
        if (poster) paint(poster, index, posterOpacity);
        paint(video, index, opacity, blendMode);
      }
    }
    if (videos.length) texture.needsUpdate = true;
  };

  const dispose = () => {
    for (const { video } of videos) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  };

  return { texture, grid: [cols, rows], count: files.length, first, ready, update, dispose };
}
