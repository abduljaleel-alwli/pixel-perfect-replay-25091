import * as THREE from "three";

// Seeded RNG so textures are identical every load.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function veins(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, r: () => number, tone: string) {
  ctx.strokeStyle = tone;
  for (let v = 0; v < 5; v++) {
    ctx.lineWidth = 0.4 + r() * 1.4;
    ctx.globalAlpha = 0.15 + r() * 0.3;
    ctx.beginPath();
    let px = x + r() * s, py = y;
    ctx.moveTo(px, py);
    for (let k = 0; k < 10; k++) {
      px += (r() - 0.5) * s * 0.25;
      py += s / 10;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Travertine/marble tile floor with grout lines. */
export function makeTileTexture(tiles = 4, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const r = rng(7);
  const s = size / tiles;
  ctx.fillStyle = "#8d8378";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < tiles; i++)
    for (let j = 0; j < tiles; j++) {
      const l = 86 + r() * 6;
      ctx.fillStyle = `hsl(36, 22%, ${l}%)`;
      ctx.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
      veins(ctx, i * s, j * s, s, r, "#9b8f80");
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Single tile face for the floating assembling tiles. */
export function makeSlabTexture(seed: number, hue: number, light: number) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const r = rng(seed);
  ctx.fillStyle = `hsl(${hue}, 18%, ${light}%)`;
  ctx.fillRect(0, 0, size, size);
  veins(ctx, 0, 0, size, r, light > 50 ? "#7d7266" : "#d8cbb8");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Subtle plaster grain for gypsum surfaces (used as bump map). */
export function makePlasterBump(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const r = rng(3);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + r() * 40;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  return t;
}
