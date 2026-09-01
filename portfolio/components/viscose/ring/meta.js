import gsap from "gsap";
import { PROJECTS } from "./projects";























const SIDES = ["left", "right"];
const SLOTS = 2;

const slotsOf = (row) => row?.firstElementChild?.children;





function fade(el, f, blur) {
  if (!el) return;
  if (f >= 1) {
    el.style.filter = "none";
    el.style.opacity = "1";
  } else if (f <= 0) {


    el.style.filter = "none";
    el.style.opacity = "0";
  } else {
    el.style.filter = `blur(${Math.min(blur / f - blur, 100)}px)`;
    el.style.opacity = `${Math.pow(f, 0.4)}`;
  }
}

function createGroup(side, groups, params) {
  const m = { t: 1 };




  let prev = ["", ""];
  let moving = [false, false];

  const draw = () => {
    const g = groups[side];
    if (!g) return;
    const out = slotsOf(g.layers[0]);
    const into = slotsOf(g.layers[1]);
    const held = slotsOf(g.plain);
    const t = m.t;

    for (let j = 0; j < SLOTS; j++) {
      if (moving[j]) {
        fade(out?.[j], 1 - t, params.nameBlur);
        fade(into?.[j], t, params.nameBlur);
        if (held?.[j]) held[j].style.opacity = "0";
      } else {
        if (out?.[j]) out[j].style.opacity = "0";
        if (into?.[j]) into[j].style.opacity = "0";
        if (held?.[j]) held[j].style.opacity = "1";
      }
    }




    if (g.goo) {
      g.goo.style.filter =
        t >= 1 ? "none" : `url(#name-goo) blur(${params.nameSoften}px)`;
    }
  };



  const set = (parts) => {
    const g = groups[side];
    if (!g?.layers[0] || !g.layers[1] || !g.plain) return;
    gsap.killTweensOf(m);




    m.t = 1;
    draw();

    const next = [parts[0] ?? "", parts[1] ?? ""];
    moving = [next[0] !== prev[0], next[1] !== prev[1]];

    const out = slotsOf(g.layers[0]);
    const into = slotsOf(g.layers[1]);
    const held = slotsOf(g.plain);
    for (let j = 0; j < SLOTS; j++) {
      if (out?.[j]) out[j].textContent = prev[j];
      if (into?.[j]) into[j].textContent = next[j];
      if (held?.[j]) held[j].textContent = next[j];
    }
    prev = next;



    if (!moving[0] && !moving[1]) {
      m.t = 1;
      draw();
      return;
    }

    m.t = 0;
    draw();
    gsap.to(m, {
      t: 1,
      duration: params.nameMorphTime,
      ease: params.nameEase,
      onUpdate: draw,
    });
  };

  return { m, set };
}





export function createMeta(refs, params) {
  const { groups, list, loader, cut, live } = refs;
  const left = createGroup("left", groups, params);
  const right = createGroup("right", groups, params);


  const setThreshold = () => {
    cut?.setAttribute(
      "values",
      `1 0 0 0 0
       0 1 0 0 0
       0 0 1 0 0
       0 0 0 ${params.nameEdge} ${-params.nameEdge * params.nameCut}`,
    );
  };



  const style = ({ textK, tight, viewW }) => {


    const bigVw = params.nameSize * textK * (tight ? params.tightName : 1);
    const big = `${bigVw}vw`;
    const small = `${params.idxSize * textK}vw`;
    const bigFace = `"${params.nameFont}", ui-sans-serif, system-ui, sans-serif`;
    const smallFace = `"${params.idxFont}", ui-sans-serif, system-ui, sans-serif`;
    const bigWeight = `${params.nameWeight}`;
    const smallWeight = `${params.idxWeight}`;


    const h = bigVw * 3;

    for (const side of SIDES) {
      const g = groups[side];
      if (!g?.box) continue;
      const isRight = side === "right";




      const corner = tight && !isRight;
      if (tight && isRight) {
        g.box.style.display = "none";
        continue;
      }
      g.box.style.display = "";

      g.box.style.width = `${corner ? params.tightMetaWidth : params.metaWidth}vw`;
      g.box.style.height = `${h}vw`;

      if (corner) {



        const boxPx = (h * viewW) / 100;
        const emPx = (bigVw * viewW) / 100;
        g.box.style.top = "auto";
        g.box.style.left = "auto";
        g.box.style.right = `${params.tightNameRight}px`;
        g.box.style.bottom = `${params.tightNameBottom + emPx * 0.5 - boxPx * 0.5}px`;
        g.box.style.transform = "none";
      } else {

        g.box.style.top = "";
        g.box.style.bottom = "";
        g.box.style.transform = "";




        g.box.style.left = isRight ? "auto" : `${params.metaLeft}vw`;
        g.box.style.right = isRight ? `${params.metaRight}vw` : "auto";
      }



      for (const layer of [...g.layers, g.plain]) {
        if (!layer) continue;
        layer.style.justifyContent =
          corner || isRight ? "flex-end" : "flex-start";
        const row = layer.firstElementChild;
        row.style.gap = `${isRight ? params.metaGapR : params.metaGapL}vw`;
        const [lead, trail] = row.children;


        lead.style.display = corner ? "none" : "";
        lead.style.fontFamily = isRight ? bigFace : smallFace;
        lead.style.fontSize = isRight ? big : small;
        lead.style.fontWeight = isRight ? bigWeight : smallWeight;
        trail.style.fontFamily = isRight ? smallFace : bigFace;
        trail.style.fontSize = isRight ? small : big;
        trail.style.fontWeight = isRight ? smallWeight : bigWeight;
      }
    }



    if (list) list.style.fontSize = `${params.listSize * textK}vw`;
    if (loader) {
      loader.style.bottom = `${params.loaderBottom}vh`;
      loader.style.fontFamily = smallFace;
      loader.style.fontSize = small;
      loader.style.fontWeight = smallWeight;
    }

    setThreshold();
  };



  const show = (i) => {
    const p = PROJECTS[i];
    if (!p) return;
    left.set([String(i + 1).padStart(2, "0"), p.name]);
    right.set([p.type, p.year]);


    if (live) {
      live.textContent = [
        `${p.name}. ${p.type}, ${p.year}.`,
        p.description,
        p.stats,
      ]
        .filter(Boolean)
        .join(" ");
    }
  };

  const dispose = () => {
    gsap.killTweensOf(left.m);
    gsap.killTweensOf(right.m);
  };

  return { show, style, setThreshold, dispose };
}
