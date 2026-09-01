"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import * as THREE from "three";
import gsap from "gsap";
import AnimatedHighlightText, {
  HeartIcon,
  Highlight,
  MousePointerClickIcon,
} from "@/components/ruixen/animated-highlight-text";

import {
  vertexShader,
  fragmentShader,
  MAX_PLANES,
  MAX_LINKS,
} from "./shaders/planeShaders";
import { buildAtlas } from "./ring/atlas";
import { createMeta } from "./ring/meta";
import { createSplitText } from "./ring/splitText";
import { defaultParams } from "./ring/params";
import { IMAGE_FILES, PROJECTS } from "./ring/projects";
import {
  TAU,
  HALF_PI,
  DEG,
  chase,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  signedOffset,
  smoothstep,
} from "./ring/utils";


const FAN_START = 0.06;

function ProjectCaption({ project }) {
  if (project?.name === "Glammer") {
    return (
      <>
        {project.description} ·{" "}
        <Highlight
          icon={<MousePointerClickIcon />}
          image={project.image}
          imageAlt="Glammer cover"
        >
          100 users
        </Highlight>
      </>
    );
  }

  if (project?.name === "Frosted MicroUI Kit") {
    return (
      <>
        {project.description} ·{" "}
        <Highlight
          icon={<MousePointerClickIcon />}
          image={project.image}
          imageAlt="Frosted MicroUI Kit cover"
        >
          416 uses
        </Highlight>{" "}·{" "}
        <Highlight
          icon={<HeartIcon />}
          color="#ef4444"
          image={project.image}
          imageAlt="Frosted MicroUI Kit cover"
        >
          4 likes
        </Highlight>
      </>
    );
  }

  return [project?.description, project?.stats].filter(Boolean).join(" · ");
}

const blankTexture = () => {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
};

export default function Carousel({ dark = true, playIntro = false, onReachEnd }) {
  const containerRef = useRef(null);
  const onReachEndRef = useRef(onReachEnd);
  useEffect(() => {
    onReachEndRef.current = onReachEnd;
  }, [onReachEnd]);
  const listRef = useRef(null);
  const itemsRef = useRef([]);
  const loaderRef = useRef(null);
  const liveRef = useRef(null);
  const cutRef = useRef(null);
  const viewButtonRef = useRef(null);
  const symbolRefs = useRef([]);
  const pickProjectRef = useRef(null);
  const [shownProject, setShownProject] = useState(null);
  const [projectSettled, setProjectSettled] = useState(false);
  const projectSettledRef = useRef(false);



  const metaRef = useRef({
    left: { box: null, goo: null, layers: [], plain: null },
    right: { box: null, goo: null, layers: [], plain: null },
  });

  useEffect(() => {
    const container = containerRef.current;
    const listEl = listRef.current;
    const loaderEl = loaderRef.current;


    let disposed = false;
    const setProjectReady = (ready) => {
      if (projectSettledRef.current === ready) return;
      projectSettledRef.current = ready;
      setProjectSettled(ready);
    };

    const params = defaultParams();
    params.textColor = dark ? "#ededed" : "#0a0a0a";





    const state = { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 };


    const info = { restingGap: 0, window: "", scale: 1, band: "wide" };






    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.error("[ring] could not create a WebGL context:", err);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uSize: { value: new THREE.Vector2(150, 100) },
      uRadius: { value: params.radius },
      uCount: { value: params.count },
      uPos: {
        value: Array.from({ length: MAX_PLANES }, () => new THREE.Vector2()),
      },
      uRot: { value: new Float32Array(MAX_PLANES) },


      uScale: {
        value: Array.from(
          { length: MAX_PLANES },
          () => new THREE.Vector4(0, 0, 1, 0),
        ),
      },
      uLinkCount: { value: 0 },
      uLinkA: {
        value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()),
      },
      uLinkB: {
        value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()),
      },

      uLinkPar: {
        value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector4()),
      },
      uK: { value: params.goo },
      uWobble: { value: params.wobble },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(dark ? "#ededed" : "#0a0a0a") },
      uAtlas: { value: blankTexture() },
      uGrid: { value: new THREE.Vector2(1, 1) },
      uBlend: { value: params.blend },
      uTextured: { value: 0 },
      uBandTop: { value: 0 },
      uBandBottom: { value: 0 },
      uGlass: { value: new THREE.Vector4() },
      uFringe: { value: 0 },
      uSheen: { value: 0 },
      uMouse: { value: new THREE.Vector4() },
      uMelt: { value: new THREE.Vector4() },
    };

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    );

    mesh.renderOrder = 10;
    scene.add(mesh);

    const textGroup = new THREE.Group();
    scene.add(textGroup);

    const splitText = createSplitText(textGroup, params);
    const meta = createMeta(
      {
        groups: metaRef.current,
        list: listEl,
        loader: loaderEl,
        cut: cutRef.current,
        live: liveRef.current,
      },
      params,
    );





    let firstIn = false;
    let loadProg = 0;



    let launchReady = false;
    const readyWaiters = [];
    const whenReady = (fn) => (launchReady ? fn() : readyWaiters.push(fn));

    const mediaFiles = IMAGE_FILES.map((file, index) => {
      const project = PROJECTS[index];
      return project?.videoDark
        ? {
            src: dark ? project.videoDark : project.videoLight,
            poster: file,
            posterOpacity: 0.18,
            videoOpacity: 1,




            blendMode: dark ? "screen" : "multiply",
          }
        : file;
    });
    const atlas = buildAtlas(mediaFiles, (p) => {
      if (!disposed) loadProg = p;
    });

    uniforms.uAtlas.value.dispose();
    atlas.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    uniforms.uAtlas.value = atlas.texture;
    uniforms.uGrid.value.set(atlas.grid[0], atlas.grid[1]);


    const imageCount = atlas.count;

    atlas.first.then(() => {
      if (!disposed) firstIn = true;
    });
    atlas.ready.then(() => {
      if (!disposed) loadProg = 1;
    });


    let viewW = 1;
    let viewH = 1;


    const bounds = { left: 0, top: 0 };




    let fit = 1;
    let planeK = 1;
    let radiusK = 1;
    let textK = 1;


    let narrowNow = false;
    let tightNow = false;

    const refit = () => {
      const byW = viewW / Math.max(1, params.refWidth);
      const byH = viewH / Math.max(1, params.refHeight);
      const s =
        byW * (1 - params.fitHeight) + Math.min(byW, byH) * params.fitHeight;
      fit = Math.min(params.maxScale, Math.max(params.minScale, s));

      const narrow = viewW <= params.narrowAt;
      const tight = viewW <= params.tightAt;
      narrowNow = narrow;
      tightNow = tight;
      planeK = narrow ? params.narrowPlane : 1;


      radiusK =
        (narrow ? params.narrowRadius : 1) * (tight ? params.tightRadius : 1);
      textK = narrow ? params.narrowText : 1;

      info.window = `${Math.round(viewW)} x ${Math.round(viewH)}`;
      info.scale = Math.round(fit * 1000) / 1000;
      info.band = tight ? "tight" : narrow ? "narrow" : "wide";




      const k = fit * textK * (tight ? params.tightSplit : 1);
      textGroup.scale.set(k, k, 1);
    };

    const styleMeta = () =>
      meta.style({ textK, tight: tightNow, viewW: viewW });

    const resize = () => {
      viewW = container.clientWidth;
      viewH = container.clientHeight;
      refit();
      renderer.setSize(viewW, viewH);
      camera.left = -viewW / 2;
      camera.right = viewW / 2;
      camera.top = viewH / 2;
      camera.bottom = -viewH / 2;
      camera.updateProjectionMatrix();
      mesh.scale.set(viewW, viewH, 1);
      uniforms.uResolution.value.set(viewW, viewH);

      const rect = renderer.domElement.getBoundingClientRect();
      bounds.left = rect.left;
      bounds.top = rect.top;
    };



    const onResize = () => {
      resize();
      styleMeta();
    };

    resize();
    window.addEventListener("resize", onResize);


    const ringCentre = { x: 0, y: 0 };


    let frontAngle = 0;
    let interactive = false;
    let spinVel = 0;
    let dragging = false;
    let dragPrevAngle = 0;
    let dragPrevTime = 0;




    let settling = false;
    let snapTo = 0;
    let snapCap = 0;



    let picking = false;
    let wheelTarget = null;
    let wheelResetTimer = 0;
    let wheelCooldownTimer = 0;
    let wheelCooling = false;
    let wheelGestureLocked = false;
    let wheelAnimating = false;
    let wheelTweenId = 0;
    let wheelDistance = 0;
    let wheelDirection = 0;
    let wheelLastTime = 0;

    let pointerTravel = 0;
    let pressX = 0;
    let pressY = 0;
    let pressed = false;

    const pointerAngle = (e) => {
      const dx = e.clientX - bounds.left - ringCentre.x;
      const dy = e.clientY - bounds.top - ringCentre.y;
      return Math.atan2(-dy, dx);
    };

    const stopPick = () => {
      if (!picking) return;
      gsap.killTweensOf(state);
      picking = false;
    };

    const openProject = (i) => {
      const url = PROJECTS[i]?.url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    };






    const projectIndexForPlane = (planeIndex) => {
      const count = Math.round(params.count);
      const imageOffset = Math.round(params.imageOffset);
      return (
        ((imageOffset - signedOffset(planeIndex)) % count) + count
      ) % count;
    };

    const planeIndexForProject = (projectIndex) => {
      const count = Math.round(params.count);
      for (let planeIndex = 0; planeIndex < count; planeIndex++) {
        if (projectIndexForPlane(planeIndex) === projectIndex) return planeIndex;
      }
      return -1;
    };

    const pick = (planeIndex, shouldOpen = true) => {
      const projectIndex = projectIndexForPlane(planeIndex);
      if (!PROJECTS[projectIndex]) return;
      const slot = TAU / Math.round(params.count);

      const base =
        frontAngle - params.seed * DEG - signedOffset(planeIndex) * slot;


      const target = base + Math.round((state.spin - base) / TAU) * TAU;

      const slots = Math.abs(target - state.spin) / slot;
      if (slots < 0.01) {
        if (shouldOpen) openProject(projectIndex);
        return;
      }

      spinVel = 0;
      settling = false;
      setProjectReady(false);
      picking = true;
      wheelTweenId++;
      wheelAnimating = false;
      wheelTarget = null;
      gsap.killTweensOf(state);
      gsap.to(state, {
        spin: target,


        duration: params.pickTime * Math.sqrt(Math.max(1, slots)),
        ease: params.pickEase,
        onComplete: () => {
          picking = false;
          setProjectReady(true);
          if (shouldOpen) openProject(projectIndex);
        },
      });
    };
    pickProjectRef.current = (projectIndex) => {
      const planeIndex = planeIndexForProject(projectIndex);
      if (planeIndex >= 0) pick(planeIndex, false);
    };








    const pointer = { x: 0, y: 0, inside: false, seeded: false };


    const cursor = { x: 0, y: 0, amt: 0, wake: 0 };



    let coarse = false;
    let held = false;
    let holdTimer = 0;

    const endHold = () => {
      clearTimeout(holdTimer);
      holdTimer = 0;
      held = false;
    };

    const beginHold = () => {
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        held = true;
      }, params.touchHold * 1000);
    };



    const engaged = () => (coarse ? held : pointer.inside);

    const trackPointer = (e) => {
      coarse = e.pointerType === "touch";
      pointer.x = e.clientX - bounds.left - viewW * 0.5;
      pointer.y = viewH * 0.5 - (e.clientY - bounds.top);
      pointer.inside = true;


      if (!pointer.seeded) {
        pointer.seeded = true;
        cursor.x = pointer.x;
        cursor.y = pointer.y;
      }
    };

    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onWheel = (e) => {
      if (!interactive) return;

      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(raw) < 1) return;

      const direction = Math.sign(raw);
      const atFirstProject = shown === 0 && direction < 0;
      const atLastProject =
        shown === PROJECTS.length - 1 && direction > 0;






      if ((atFirstProject || atLastProject) && !wheelAnimating) {
        if (atLastProject && direction > 0) onReachEndRef.current?.();
        clearTimeout(wheelResetTimer);
        clearTimeout(wheelCooldownTimer);
        wheelDistance = 0;
        wheelDirection = 0;
        wheelTarget = null;
        wheelGestureLocked = false;
        wheelCooling = false;
        return;
      }

      e.preventDefault();




      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewH : 1;
      const d = raw * unit;
      const now = performance.now();
      const wheelDirectionSign = Math.sign(d);




      if (
        now - wheelLastTime > params.scrollCooldown * 1.5 ||
        (wheelDirection !== 0 && wheelDirectionSign !== wheelDirection)
      ) {
        wheelDistance = 0;
        wheelTarget = null;
      }
      wheelDirection = wheelDirectionSign;
      wheelLastTime = now;

      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelDistance = 0;
        wheelDirection = 0;
        wheelTarget = null;
        wheelGestureLocked = false;
      }, params.scrollCooldown * 1.5);




      if (wheelCooling || wheelGestureLocked) return;
      wheelDistance += Math.abs(d);




      if (wheelCooling || wheelDistance < params.scrollThreshold) return;
      wheelDistance = 0;
      wheelGestureLocked = true;




      stopPick();
      settling = false;
      spinVel = 0;
      const slot = TAU / Math.round(params.count);
      wheelCooling = true;
      wheelCooldownTimer = setTimeout(() => {
        wheelCooling = false;
        wheelDistance = 0;
      }, params.scrollCooldown);



      if (wheelTarget === null) wheelTarget = state.spin;
      wheelTarget += direction * slot;
      const target = wheelTarget;
      setProjectReady(false);
      wheelAnimating = true;
      const tweenId = ++wheelTweenId;
      gsap.to(state, {
        spin: target,
        duration: 0.34,
        ease: "power3.inOut",
        overwrite: true,
        onComplete: () => {
          if (tweenId !== wheelTweenId) return;
          state.spin = target;
          spinVel = 0;
          settling = false;
          wheelAnimating = false;
          setProjectReady(true);
        },
      });
    };

    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointerTravel = 0;
      pressX = e.clientX;
      pressY = e.clientY;
      pressed = true;
      trackPointer(e);
      if (!interactive) {
        pressed = false;
        return;
      }
      stopPick();
      clearTimeout(wheelResetTimer);
      wheelTarget = null;
      clearTimeout(wheelCooldownTimer);
      wheelCooling = false;
      wheelDistance = 0;
      wheelDirection = 0;
      wheelLastTime = 0;
      wheelGestureLocked = false;
      wheelTweenId++;
      wheelAnimating = false;
      gsap.killTweensOf(state, "spin");
      if (coarse) beginHold();
      dragging = false;
      settling = false;
      spinVel = 0;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      trackPointer(e);




      if (pressed) {
        pointerTravel = Math.hypot(e.clientX - pressX, e.clientY - pressY);
      }


      if (coarse && !held && pointerTravel > params.touchSlop) endHold();




      if (!dragging && pressed && pointerTravel >= params.dragThreshold) {
        dragging = true;
        setProjectReady(false);
        endHold();
        dragPrevAngle = pointerAngle(e);
        dragPrevTime = performance.now();
        return;
      }

      if (!dragging) return;

      const a = pointerAngle(e);
      let delta = a - dragPrevAngle;

      if (delta > Math.PI) delta -= TAU;
      if (delta < -Math.PI) delta += TAU;

      const turn = delta * params.dragSpeed;
      state.spin += turn;

      const now = performance.now();
      spinVel = turn / (Math.max(8, now - dragPrevTime) / 1000);
      dragPrevAngle = a;
      dragPrevTime = now;
    };

    const onPointerUp = (e) => {


      trackPointer(e);

      endHold();
      pressed = false;
      if (!dragging) {
        renderer.domElement.releasePointerCapture?.(e.pointerId);
        return;
      }
      dragging = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);
    };




    const onClick = () => {
      if (!interactive || pointerTravel >= params.dragThreshold || over < 0) return;
      pick(over);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("click", onClick);

    const updatePointer = (dt) => {


      const live = params.hover && engaged() && pointer.seeded && interactive;
      cursor.amt += ((live ? 1 : 0) - cursor.amt) * chase(dt, 0.12);

      const k = chase(dt, params.lag);
      cursor.x += (pointer.x - cursor.x) * k;
      cursor.y += (pointer.y - cursor.y) * k;



      const trail = Math.hypot(pointer.x - cursor.x, pointer.y - cursor.y);
      cursor.wake = Math.max(
        cursor.wake * Math.pow(0.94, dt * 60),
        clamp01(trail / (Math.max(dt, 0.001) * 2600)),
      );



      uniforms.uMouse.value.set(
        cursor.x,
        cursor.y,
        cursor.amt,
        params.melt * fit,
      );
      uniforms.uMelt.value.set(
        params.meltReach * fit,
        params.wave * fit * cursor.wake * cursor.amt,
        params.waveFreq,
        params.waveSpeed,
      );
    };






    const loading = { shown: 0 };

    const tickLoader = (dt) => {
      const target = Math.min(loadProg, clamp01(state.progress));
      loading.shown += (target - loading.shown) * chase(dt, params.loaderChase);


      const n = Math.min(100, Math.max(1, Math.round(loading.shown * 100)));
      if (loaderEl) loaderEl.textContent = String(n).padStart(3, "0");

      if (!launchReady && n >= 100) {
        launchReady = true;
        for (const fn of readyWaiters) fn();
        readyWaiters.length = 0;
      }
    };


    const travel = new Float32Array(MAX_PLANES);
    const cum = new Float32Array(MAX_PLANES);
    const order = [];


    const rest = Array.from({ length: MAX_PLANES }, () => new THREE.Vector2());



    const hoverF = new Float32Array(MAX_PLANES);
    const leanX = new Float32Array(MAX_PLANES);
    const leanY = new Float32Array(MAX_PLANES);
    const webF = new Float32Array(MAX_LINKS);


    const sideF = new Float32Array(MAX_PLANES);





    const focusPos = new THREE.Vector2();

    const swellOf = (i) =>
      Math.max(
        0.05,
        1 + params.swell * hoverF[i] - params.sideScale * sideF[i],
      );


    let shown = -1;
    let announced = -1;
    let over = -1;

    const paintList = () => {
      const items = itemsRef.current;
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        if (!el) continue;
        const on = i === shown;
        el.style.opacity = on ? "1" : "0.2";
        if (on) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      }
      setShownProject(PROJECTS[shown] ?? null);
    };

    const layout = (dt) => {
      const count = Math.round(params.count);
      uniforms.uCount.value = count;

      const step = TAU / count;
      const spread = clamp01(state.spread);



      const endScale = narrowNow ? params.narrowEndScale : params.endScale;
      const posX = tightNow
        ? params.tightPosX
        : narrowNow
          ? params.narrowPosX
          : params.posX;



      const shift = clamp01(state.shift);
      const g = (1 + (endScale - 1) * shift) * fit;
      const cx = posX * viewW * 0.5 * shift;
      const cy = params.posY * viewH * 0.5 * shift;


      ringCentre.x = viewW * 0.5 + cx;
      ringCentre.y = viewH * 0.5 - cy;



      frontAngle = cx !== 0 || cy !== 0 ? Math.atan2(-cy, -cx) : 0;



      const W = params.planeSize * planeK * g;
      const H = W / 1.5;
      uniforms.uSize.value.set(W, H);


      uniforms.uRadius.value = params.radius * planeK * g;



      const sepExtent = params.radial ? H : W;
      const faceEdge = params.radial ? W : H;

      const R = params.ringRadius * radiusK * g;
      const restingGap = 2 * R * Math.sin(step / 2) - sepExtent;
      info.restingGap = Math.round((restingGap / g) * 10) / 10;

      const finalSep = Math.max(1, restingGap);



      const maxN = Math.max(1, Math.abs(signedOffset(count - 1)));
      const dur = Math.max(0.1, 1 - FAN_START - params.stagger);



      cum[0] = 0;
      for (let n = 1; n <= maxN; n++) {
        const start = FAN_START + ((n - 1) / maxN) * params.stagger;
        const t = clamp01((spread - start) / dur);
        const e = t * t * (3 - 2 * t);
        travel[n] = e;
        cum[n] = cum[n - 1] + e;
      }

      const seedAngle = params.seed * DEG;



      const launch = easeInOutCubic(clamp01(state.launch));
      const Rnow = R * launch;

      order.length = 0;

      const track = cursor.amt > 0.001;
      const reach = Math.max(1, params.reach * W);
      const sideReach = Math.max(1, params.sideReach * W);



      const kRise = chase(dt, params.grab);
      const kFall = chase(dt, params.release);



      let frontI = -1;
      let frontD = 1e9;
      let frontCell = 0;





      const imgOff = Math.round(params.imageOffset);
      const cellOf = (slot) =>
        imageCount > 0
          ? (((imgOff - slot) % imageCount) + imageCount) % imageCount
          : 0;


      const probe = pointer.inside && pointer.seeded && interactive;
      let overI = -1;

      const focusI = track ? over : -1;

      for (let i = 0; i < count; i++) {
        const sIdx = signedOffset(i);
        const n = Math.abs(sIdx);
        const u = i === 0 ? clamp01(state.progress) : travel[n];
        const cell = cellOf(sIdx);

        const angle = seedAngle + Math.sign(sIdx) * step * cum[n] + state.spin;
        const px = Math.cos(angle) * Rnow + cx;
        const py = Math.sin(angle) * Rnow + cy;
        rest[i].set(px, py);


        const da = angle - frontAngle;
        const toFront = Math.abs(Math.atan2(Math.sin(da), Math.cos(da)));
        if (toFront < frontD) {
          frontD = toFront;
          frontI = i;
          frontCell = cell;
        }




        let f = 0;
        let toX = 0;
        let toY = 0;
        if (track) {
          const dx = cursor.x - px;
          const dy = cursor.y - py;
          const dist = Math.hypot(dx, dy);
          f = smoothstep(reach, reach * 0.22, dist) * cursor.amt * u;
          if (f > 0.0001 && dist > 0.0001) {
            const lean = (params.pull * fit * f) / dist;
            toX = dx * lean;
            toY = dy * lean;
          }
        }



        const k = f > hoverF[i] ? kRise : kFall;
        hoverF[i] += (f - hoverF[i]) * k;
        leanX[i] += (toX - leanX[i]) * k;
        leanY[i] += (toY - leanY[i]) * k;



        let sf = 0;
        if (focusI >= 0 && i !== focusI) {
          const d = Math.hypot(focusPos.x - px, focusPos.y - py);
          sf = smoothstep(sideReach, sideReach * 0.2, d) * u;
        }



        sideF[i] += (sf - sideF[i]) * (sf > sideF[i] ? kRise : kFall);



        let pushX = 0;
        let pushY = 0;
        if (sideF[i] > 0.0001) {
          const dx = px - focusPos.x;
          const dy = py - focusPos.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.0001) {
            const away = (params.sidePush * fit * sideF[i]) / dist;
            pushX = dx * away;
            pushY = dy * away;
          }
        }

        uniforms.uPos.value[i].set(
          px + leanX[i] + pushX,
          py + leanY[i] + pushY,
        );
        uniforms.uRot.value[i] =
          (params.radial ? angle : angle + HALF_PI) * launch;




        const sx =
          i === 0
            ? easeOutCubic(clamp01(u / 0.7))
            : easeOutCubic(clamp01(u / 0.34));
        const sy =
          i === 0
            ? easeOutCubic(clamp01((u - 0.18) / 0.74))
            : easeOutCubic(clamp01((u - 0.06) / 0.36));


        const sw = swellOf(i);
        uniforms.uScale.value[i].set(
          sx * sw,
          sy * sw,
          1 - params.sideDim * sideF[i],
          cell,
        );





        const symbolEl = symbolRefs.current[cell];
        if (symbolEl) {
          const planeScaleX = Math.abs(sx * sw);
          const planeScaleY = Math.abs(sy * sw);
          const planeW = W * planeScaleX;
          const planeH = H * planeScaleY;
          const symbolSize = Math.min(planeW, planeH) * 0.42;
          const localX = 0;
          const localY = planeH * 0.5 + symbolSize * 0.5 + 12 * fit;
          const centre = uniforms.uPos.value[i];
          const rotation = uniforms.uRot.value[i];
          const symbolX =
            viewW * 0.5 +
            centre.x +
            localX * Math.cos(rotation) -
            localY * Math.sin(rotation);
          const symbolY =
            viewH * 0.5 -
            (centre.y +
              localX * Math.sin(rotation) +
              localY * Math.cos(rotation));
          const symbolOpacity =
            (interactive
              ? clamp01(Math.min(planeScaleX, planeScaleY) * 1.55)
              : 0) *
            (0.86 + hoverF[i] * 0.1);

          symbolEl.style.left = `${symbolX}px`;
          symbolEl.style.top = `${symbolY - hoverF[i] * 3}px`;
          symbolEl.style.width = `${symbolSize}px`;
          symbolEl.style.opacity = String(symbolOpacity);
          symbolEl.style.transform = `translate(-50%, -50%) rotate(${(-rotation / Math.PI) * 180}deg) scale(${1 + hoverF[i] * 0.055})`;
          symbolEl.style.filter = `drop-shadow(0 8px 12px rgba(0,0,0,.28)) brightness(${1 + hoverF[i] * 0.07})`;
        }




        if (probe && overI < 0) {
          const rot = uniforms.uRot.value[i];
          const qx = cursor.x - (px + leanX[i] + pushX);
          const qy = cursor.y - (py + leanY[i] + pushY);
          const cr = Math.cos(rot);
          const sr = Math.sin(rot);
          if (
            Math.abs(qx * cr + qy * sr) <= W * 0.5 * sx * sw &&
            Math.abs(-qx * sr + qy * cr) <= H * 0.5 * sy * sw
          ) {
            overI = i;
          }
        }

        order.push(i);
      }

      for (let i = count; i < MAX_PLANES; i++) {
        uniforms.uScale.value[i].set(0, 0, 1, 0);
        hoverF[i] = 0;
        leanX[i] = 0;
        leanY[i] = 0;
        sideF[i] = 0;
      }

      over = overI;


      if (over >= 0) focusPos.copy(rest[over]);





      const viewButton = viewButtonRef.current;
      if (viewButton && frontI >= 0) {
        const center = uniforms.uPos.value[frontI];
        const scale = uniforms.uScale.value[frontI];
        const rotation = uniforms.uRot.value[frontI];
        const halfW = W * Math.abs(scale.x) * 0.5;
        const halfH = H * Math.abs(scale.y) * 0.5;
        const halfHeight =
          Math.abs(Math.sin(rotation)) * halfW +
          Math.abs(Math.cos(rotation)) * halfH;
        const desiredX = viewW * 0.5 + center.x;
        const desiredY =
          viewH * 0.5 - center.y + halfHeight + Math.max(16, 16 * fit);
        const safeHalfWidth = 58;
        const safeInset = 16;
        const left =
          viewW <= safeHalfWidth * 2 + safeInset * 2
            ? viewW * 0.5
            : Math.max(
                safeHalfWidth + safeInset,
                Math.min(viewW - safeHalfWidth - safeInset, desiredX),
              );

        viewButton.style.left = `${left}px`;
        viewButton.style.top = `${Math.min(viewH - 52, desiredY)}px`;
        viewButton.style.visibility = interactive ? "visible" : "hidden";
      }




      if (frontI >= 0 && imageCount > 0 && frontCell !== shown) {
        shown = frontCell;
        paintList();
      }





      order.sort((a, b) => signedOffset(a) - signedOffset(b));

      const edgeHalf = faceEdge * 0.5 * params.thread;



      const closed = spread > 0.995 && count > 2;
      const linkCount = Math.min(closed ? count : count - 1, MAX_LINKS);

      for (let l = 0; l < linkCount; l++) {
        const ia = order[l];
        const ib = order[(l + 1) % count];

        const ca = uniforms.uPos.value[ia];
        const cb = uniforms.uPos.value[ib];
        const scA = uniforms.uScale.value[ia];
        const scB = uniforms.uScale.value[ib];





        const shrinkA = (params.radial ? scA.y : scA.x) / swellOf(ia);
        const shrinkB = (params.radial ? scB.y : scB.x) / swellOf(ib);
        const sep =
          rest[ia].distanceTo(rest[ib]) - sepExtent * 0.5 * (shrinkA + shrinkB);


        const v = clamp01(sep / finalSep);




        let fl = 0;
        if (track && params.web > 0.0001) {
          const mx = (ca.x + cb.x) * 0.5;
          const my = (ca.y + cb.y) * 0.5;
          const webReach = Math.max(1, params.webReach * W);
          const d = Math.hypot(cursor.x - mx, cursor.y - my);
          fl = smoothstep(webReach, webReach * 0.15, d) * cursor.amt;
        }


        webF[l] += (fl - webF[l]) * (fl > webF[l] ? kRise : kFall);

        const w = Math.max(Math.pow(1 - v, params.thin), params.web * webF[l]);



        const rEnd = edgeHalf * w - params.dissolve;
        const rMid = rEnd * (1 - (1 - params.pinch) * smoothstep(0, 0.7, v));

        uniforms.uLinkA.value[l].copy(ca);
        uniforms.uLinkB.value[l].copy(cb);
        uniforms.uLinkPar.value[l].set(
          rEnd,
          rMid,
          params.sag * g * Math.pow(v, 1.5),


          Math.min(
            params.fillet * g * smoothstep(0, 0.35, v),
            Math.max(rMid, 0) * 1.5,
          ),
        );
      }
      for (let l = linkCount; l < MAX_LINKS; l++) {
        uniforms.uLinkPar.value[l].set(-100, -100, 0, 0);
      }
      uniforms.uLinkCount.value = linkCount;



      uniforms.uK.value = params.goo * planeK * fit;
      uniforms.uWobble.value =
        params.wobble * fit * (1 - smoothstep(0.2, 0.95, state.progress));




      uniforms.uTextured.value = params.textured && firstIn ? 1 : 0;
      uniforms.uBlend.value = Math.max(0.5, params.blend * planeK * g);

      const on = params.glass;
      uniforms.uBandTop.value = on ? params.bandTop * viewH : 0;
      uniforms.uBandBottom.value = on ? params.bandBottom * viewH : 0;
      uniforms.uGlass.value.set(
        params.refract,
        params.squeeze,
        params.ripple,
        params.rippleFreq,
      );
      uniforms.uFringe.value = on ? params.fringe : 0;
      uniforms.uSheen.value = on ? params.sheen : 0;
    };




    let entryGen = 0;

    const build = () => {
      interactive = false;
      setProjectReady(false);
      announced = -1;
      spinVel = 0;
      dragging = false;
      settling = false;


      stopPick();

      const gen = ++entryGen;


      if (loaderEl) gsap.set(loaderEl, { opacity: launchReady ? 0 : 1 });

      const tl = gsap.timeline({
        delay: 0.25,
        onComplete: () => {
          interactive = true;



          if (shown >= 0) {
            announced = shown;
            meta.show(shown);
          }
          setProjectReady(true);
        },
      });

      tl.fromTo(
        state,
        { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 },
        { progress: 1, duration: 1.2, ease: "power2.out" },
      );





      tl.addPause(">", () => {
        whenReady(() => {
          gsap.delayedCall(params.holdAfter, () => {
            if (disposed || gen !== entryGen) return;
            tl.resume();
            if (loaderEl) {
              gsap.to(loaderEl, {
                opacity: 0,
                duration: params.loaderOut,
                ease: "power2.in",
              });
            }
          });
        });
      });

      tl.to(state, {
        launch: 1,
        duration: params.launchTime,
        ease: "power2.inOut",
      });



      const spreadStart = tl.duration() - 0.15;
      tl.to(
        state,
        { spread: 1, duration: params.spreadTime, ease: params.spreadEase },
        spreadStart,
      );

      const stageStart = spreadStart + params.stageAt * params.spreadTime;
      tl.to(
        state,
        {
          spin: params.spinTurns * TAU,
          duration: params.spinTime,
          ease: params.spinEase,
        },
        stageStart + params.spinDelay,
      );
      tl.to(
        state,
        { shift: 1, duration: params.moveTime, ease: params.moveEase },
        stageStart + params.moveDelay,
      );

      const textStart = spreadStart + params.textAt * params.spreadTime;

      if (splitText.chars.length) {
        tl.fromTo(
          splitText.chars,
          { value: 0 },
          {
            value: 1,
            duration: params.textTime,
            ease: params.textEase,
            stagger: params.textStagger,
          },
          textStart,
        );
      }




      if (params.textOut && splitText.fades.length) {
        const landed = Math.max(
          stageStart + params.spinDelay + params.spinTime,
          stageStart + params.moveDelay + params.moveTime,
        );
        tl.fromTo(
          splitText.fades,
          { value: 1 },
          {
            value: 0,
            duration: params.textOutTime,
            ease: params.textOutEase,
            stagger: params.textStagger,
          },
          Math.max(0, landed + params.textOutAt),
        );
      }



      if (listEl) {
        tl.fromTo(
          listEl,
          { opacity: 0 },
          { opacity: 1, duration: params.textTime, ease: params.textEase },
          textStart,
        );
      }

      return tl;
    };

    styleMeta();

    let tl = null;
    const replay = () => {
      tl?.kill();
      tl = build();
    };



    splitText.build();
    styleMeta();
    if (playIntro) {
      tl = build();
    } else {
      state.progress = 1;
      state.launch = 1;
      state.spread = 1;
      state.spin = 0;
      state.shift = 1;
      interactive = true;
      setProjectReady(true);
    }


    let gui;

    if (process.env.NODE_ENV === "development") {
      Promise.all([import("lil-gui"), import("./ring/gui")]).then(
        ([{ default: GUI }, { mountGui }]) => {
          if (disposed) return;
          gui = mountGui(GUI, {
            params,
            state,
            info,
            actions: {
              replay,
              refit,
              styleMeta,
              setThreshold: meta.setThreshold,
              rebuildText: () => {
                splitText.build();
                replay();
              },
              replayMeta: () => {
                announced = -1;
              },
              adoptWindow: () => {
                params.refWidth = Math.round(viewW);
                params.refHeight = Math.round(viewH);
                refit();
              },
            },
          });


          gui.hide();
        },
      );
    }


    const start = performance.now();
    let prevT = start;

      renderer.setAnimationLoop(() => {
      const now = performance.now();

      const dt = Math.min(0.05, (now - prevT) / 1000);
      prevT = now;
      uniforms.uTime.value = (now - start) * 0.001;

      if (interactive && !dragging && !picking && !wheelAnimating) {
        state.spin += spinVel * dt;
        spinVel *= Math.pow(params.damping, dt * 60);



        let off = 0;

        if (params.snap) {
          const slot = TAU / Math.round(params.count);


          const decay = Math.max(0.01, -Math.log(params.damping) * 60);







          const engage = Math.max(params.snapFrom, decay * slot * 0.5);


          const rate = 4.8 / Math.max(0.05, params.snapTime);

          if (!settling && Math.abs(spinVel) < engage) {




            const coast = state.spin + spinVel / decay;
            const phase = params.seed * DEG - frontAngle;
            snapTo = Math.round((coast + phase) / slot) * slot - phase;




            snapCap = Math.max(Math.abs(spinVel), slot * 0.5 * rate);
            settling = true;
          }

          if (settling) {
            off = snapTo - state.spin;




            const aim = Math.max(-snapCap, Math.min(snapCap, off * rate));
            spinVel += (aim - spinVel) * clamp01(rate * dt);
          }
        } else {
          settling = false;
        }



        if (Math.abs(spinVel) < 0.0015 && Math.abs(off) < 0.0008) {
          spinVel = 0;
          state.spin += off;
        }
      }

      tickLoader(dt);
      atlas.update?.();
      updatePointer(dt);
      layout(dt);





      if (
        interactive &&
        !dragging &&
        !picking &&
        shown >= 0 &&
        shown !== announced
      ) {
        announced = shown;
        meta.show(shown);
      }

      if (
        interactive &&
        !dragging &&
        !picking &&
        !wheelAnimating &&
        !settling &&
        spinVel === 0 &&
        shown >= 0
      ) {
        setProjectReady(true);
      }

      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      clearTimeout(holdTimer);
      clearTimeout(wheelResetTimer);
      clearTimeout(wheelCooldownTimer);
      renderer.setAnimationLoop(null);

      window.removeEventListener("resize", onResize);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("click", onClick);
      pickProjectRef.current = null;

      tl?.kill();
      gsap.killTweensOf(splitText.chars);
      gsap.killTweensOf(splitText.fades);
      gsap.killTweensOf(listEl);
      meta.dispose();
      splitText.dispose();
      gui?.destroy();

      mesh.geometry.dispose();
      mesh.material.dispose();
      uniforms.uAtlas.value?.dispose();






      renderer.dispose();
      renderer.forceContextLoss();
      atlas.dispose?.();
      renderer.domElement.remove();
    };
  }, [dark, playIntro]);

  const projectList = (
    <ul
      ref={listRef}
      aria-label="Projects"
      style={{
        fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
        color: dark ? "#ededed" : "#0a0a0a",
      }}
      className={`fixed right-[12vw] top-[2.4vh] z-[30] flex flex-col items-start text-right leading-[1.4] tracking-[0.01em] opacity-0 max-sm:hidden ${projectSettled ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {PROJECTS.map((p, i) => (
        <li
          key={p.file}
          ref={(el) => {
            itemsRef.current[i] = el;
          }}


          style={{ opacity: 0.2 }}
        >
          <button
            type="button"
            className="viscose-project-nav-button"
            onClick={() => pickProjectRef.current?.(i)}
            disabled={!projectSettled}
          >
            {p.name}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>



      <div ref={containerRef} className="absolute inset-0 touch-none" />

      <div className="viscose-symbol-layer" aria-hidden="true">
        {PROJECTS.map((project, index) => (
          <Image
            key={project.symbol}
            ref={(el) => {
              symbolRefs.current[index] = el;
            }}
            className="viscose-project-symbol"
            src={project.symbol}
            alt=""
            width={512}
            height={512}
            sizes="128px"
            draggable="false"
          />
        ))}
      </div>

      <a
        ref={viewButtonRef}
        className={`viscose-view-button ${shownProject?.url ? "is-visible" : ""}`}
        href={shownProject?.url ?? undefined}
        target="_blank"
        rel="noreferrer"
        aria-label={shownProject ? `View ${shownProject.name}` : "View project"}
        tabIndex={shownProject?.url ? 0 : -1}
      >
        <span>View</span>
        <span aria-hidden="true">↗</span>
      </a>



      {typeof document !== "undefined" &&
        createPortal(projectList, document.body)}








      {[
        { side: "left", justify: "flex-start" },
        { side: "right", justify: "flex-end" },
      ].map(({ side, justify }) => {


        const row = (
          <span className="flex items-baseline whitespace-nowrap">
            <span />
            <span />
          </span>
        );
        return (
          <div
            key={side}
            ref={(el) => {
              metaRef.current[side].box = el;
            }}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 tracking-[-0.01em]"
            style={{ color: dark ? "#ededed" : "#0a0a0a" }}
          >
            <span
              ref={(el) => {
                metaRef.current[side].goo = el;
              }}
              className="absolute inset-0"


              style={{ willChange: "filter" }}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    metaRef.current[side].layers[i] = el;
                  }}
                  className="absolute inset-0 flex items-center"
                  style={{ justifyContent: justify }}
                >
                  {row}
                </span>
              ))}
            </span>
            <span
              ref={(el) => {
                metaRef.current[side].plain = el;
              }}
              className="absolute inset-0 flex items-center"
              style={{ justifyContent: justify }}
            >
              {row}
            </span>
          </div>
        );
      })}


      <div
        ref={loaderRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 tracking-[-0.01em]"
        style={{ color: dark ? "#ededed" : "#0a0a0a" }}
      />

      <div ref={liveRef} aria-live="polite" className="sr-only" />

      <div
        className={`viscose-center-stats ${
          shownProject && projectSettled ? "is-visible" : ""
        }`}
        aria-live="polite"
      >
        {shownProject && projectSettled ? (
          <AnimatedHighlightText className="viscose-stats-copy">
            <ProjectCaption project={shownProject} />
          </AnimatedHighlightText>
        ) : null}
      </div>




      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0"
        focusable="false"
      >
        <defs>
          <filter
            id="name-goo"
            x="-20%"
            y="-100%"
            width="140%"
            height="300%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              ref={cutRef}
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}
