import { PROJECTS } from "./projects";

export const EASES = [
  "power2.out",
  "power3.out",
  "power4.out",
  "expo.out",
  "circ.out",
  "back.out(1.1)",
  "power1.inOut",
  "power2.inOut",
  "power3.inOut",
  "expo.inOut",
  "none",
];

export const WEIGHTS = { Light: 300, Regular: 400, Medium: 500, Semibold: 600 };














export function defaultParams() {
  return {
    
    
    refWidth: 1512,
    refHeight: 870, 
    fitHeight: 0, 
    minScale: 0.5, 
    maxScale: 1.75,

    narrowAt: 1024, 
    narrowPlane: 1.25,
    narrowRadius: 1.3, 
    narrowText: 1.5, 
    narrowPosX: -2.5,
    narrowEndScale: 4.22,

    tightAt: 640, 
    tightRadius: 0.82, 
    tightPosX: -3.5,
    tightSplit: 0.8, 
    tightName: 1.5, 
    tightNameBottom: 16, 
    tightNameRight: 16, 
    tightMetaWidth: 70, 

    
    planeSize: 90, 
    count: PROJECTS.length, 
    ringRadius: 340,
    seed: 0, 
    radial: true, 
    radius: 6, 
    textured: true, 
    blend: 14, 
    imageOffset: 0, 

    
    
    
    holdAfter: 0,
    loaderChase: 0.18,
    loaderBottom: 1, 
    loaderOut: 0.45, 

    
    stagger: 0.34,
    launchTime: 1.95,
    spreadEase: "power2.out",
    spreadTime: 3.6,
    
    
    stageAt: 0.7,
    spinTurns: 1,
    spinTime: 2.6,
    spinEase: "power2.inOut",
    spinDelay: 0,
    posX: -2, 
    posY: 0,
    endScale: 4.46,
    moveTime: 2.2,
    moveEase: "power2.inOut",
    moveDelay: 0.2,

    
    scrollSpeed: 0.0007, 
    scrollThreshold: 64, 
    scrollCooldown: 320, 
    damping: 0.94, 
    maxSpeed: 5, 
    dragSpeed: 1,
    dragThreshold: 9, 
    snap: true, 
    snapTime: 0.8, 
    snapFrom: 1, 
    pickTime: 0.55, 
    pickEase: "power3.inOut",

    
    text: "Projects",
    textSize: 41,
    textFont: "PP Neue Montreal",
    textWeight: 400,
    textTracking: 0, 
    textColor: "#0a0a0a",
    textAt: 0.42, 
    textTime: 0.95,
    textStagger: 0.015,
    textEase: "power4.out",
    textOut: true,
    textOutAt: -0.5, 
    textOutTime: 0.7,
    textOutEase: "power2.in",

    
    
    
    metaLeft: 5.5,
    metaRight: 5.5,
    metaGapL: 4.7,
    metaGapR: 2.6,
    metaWidth: 34, 
    nameSize: (24 / 1440) * 100, 
    nameFont: "Satoshi",
    nameWeight: 500,
    idxSize: (16 / 1440) * 100, 
    idxFont: "system-ui",
    idxWeight: 400,
    listSize: 0.9, 

    
    nameMorphTime: 1.2,
    nameEase: "circ.out",
    nameBlur: 8.5, 
    nameEdge: 400, 
    nameCut: 0.33, 
    nameSoften: 0.35, 

    
    glass: true,
    bandTop: 0.08, 
    bandBottom: 0.08,
    refract: 60, 
    squeeze: 0.05,
    ripple: 5, 
    rippleFreq: 0.02,
    fringe: 1.5, 
    sheen: 0.05,

    
    
    
    hover: true,
    touchHold: 0.16, 
    touchSlop: 10, 
    lag: 0.3, 
    melt: 34, 
    meltReach: 260, 
    reach: 1.7, 
    swell: 0.09,
    pull: 26, 
    grab: 0.14, 
    release: 0.06, 
    web: 0.2, 
    webReach: 1.15,
    wave: 4, 
    waveFreq: 0.05,
    waveSpeed: 7,

    
    
    sideScale: 0.035,
    sidePush: 17, 
    sideDim: 0.15,
    sideReach: 2.4, 

    
    thread: 1.0,
    thin: 0.4,
    pinch: 0.35,
    sag: 6,
    dissolve: 2.9,
    fillet: 14,

    
    wobble: 3,
    goo: 35,
  };
}
