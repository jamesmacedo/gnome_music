export type Pixel = {
  r: number;
  g: number;
  b: number;
};

export type Cluster = {
  pixels: Pixel[];
  sum: number[]
};
