import { Pixel } from "@/types/means";

export function isClosestTo(pixel: Pixel, centroids, index: number) {
  let minDist = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < centroids.length; i++) {
    const d = distance(pixel, centroids[i]);
    if (d < minDist) {
      minDist = d;
      closestIndex = i;
    }
  }
  return closestIndex === index;
}

export function distance(p1: Pixel, p2: Pixel) {
  return Math.sqrt(
    Math.pow(p1.r - p2.r, 2) +
      Math.pow(p1.g - p2.g, 2) +
      Math.pow(p1.b - p2.b, 2),
  );
}

export function arraysEqual(a: Pixel, b: Pixel) {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}
