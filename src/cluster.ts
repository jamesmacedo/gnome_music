import { Pixel } from "@/types/means"

import GdkPixbuf from 'gi://GdkPixbuf';
import {distance,arraysEqual} from "@/helpers"

export class Cluster {

    k: number = 3; 
    maxIterations: number  = 10
    centroids = []
    pixels:Pixel[] = []
    threshold_percent = 0.10 
    threshold = 0 

    constructor(image: string){
        let pixbuf = null

        if(image.startsWith('file://')){
            pixbuf = GdkPixbuf.Pixbuf.new_from_file(image.replace("file://", "")); 
        }
        // else if(image.startsWith('https://') || image.startsWith('http://')){
        //     pixbuf = GdkPixbuf.Pixbuf.new_from_uri(image); 
        // }
        
        // console.log(`w: ${pixbuf.width} - h: ${pixbuf.height}`)

        const pixelsData = this.compress(pixbuf.get_pixels(), pixbuf.width, pixbuf.height, 100, 100)

        this.threshold = pixelsData.length * this.threshold_percent;

        for(let i=0; i<pixelsData.length; i+=(pixbuf.get_n_channels()+1)){
            this.pixels.push({"r":pixelsData[i], "g":pixelsData[i+1], "b":pixelsData[i+2]} as Pixel); 
        }

        for(let i=0; i<this.k; i++){
            this.centroids.push(this.pixels[Math.floor(Math.random() * this.pixels.length)])
        }
    }

    compress(pixels, w, h, target_w, target_h){

        const blockW = Math.floor(w/ target_w)
        const blockH = Math.floor(h/ target_h)

        const output = new Uint8Array(target_h * target_w * 4)

        for(let y = 0;y < target_h; y++){
            for(let x = 0; x < target_w; x++){
                let r = 0, g = 0, b = 0, a = 0
                let count = 0

                const yStart = y * blockH, xStart = x * blockW; 

                for(let i = 0; i <blockH; i++){
                    for(let j = 0; j < blockW; j++){
                        const origX = xStart + j;
                        const origY = yStart + i;

                        if(origX < w && origY < h){
                            const idx = (origY * w + origX) * 4
                            r += pixels[idx]
                            g += pixels[idx + 1]
                            b += pixels[idx + 2]

                            count++
                        }
                    }
                }

                const outIdx = (y * target_w + x) * 4

                output[outIdx] = Math.round(r / count)
                output[outIdx + 1] = Math.round(g / count)
                output[outIdx + 2] = Math.round(b / count)
            }
        }

        return output

    }

    componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
      return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    styling(result): string{
        return `background-gradient-direction: horizontal;
                background-gradient-start: rgb(${result[0].r},${result[0].g},${result[0].b});
                background-gradient-end: rgb(${result[1].r},${result[1].g},${result[1].b});
                padding: 5px 15px;
                border-radius: 10px;`;
    }

    run(){
        for(let ite=0;ite<this.maxIterations; ite++){
            let clusters = Array.from({length: this.k}, ()=>({pixels: [], sum: [0, 0, 0]}));

            for(let pixel of this.pixels){

                let minDist  = Infinity;
                let closestIndex = 0;

                for(let i=0;i<this.centroids.length;i++){
                    let dist = distance(pixel, this.centroids[i]);
                    if(dist < minDist){
                        minDist = dist;
                        closestIndex = i;
                    }
                }

                clusters[closestIndex].pixels.push(pixel);
                clusters[closestIndex].sum[0] += pixel.r;
                clusters[closestIndex].sum[1] += pixel.g;
                clusters[closestIndex].sum[2] += pixel.b;
            }

            clusters = clusters.filter((c => c.pixels.length >= this.threshold)).sort((a, b) => b.pixels.length - a.pixels.length);

            let changed = false;
            for(let i:number ; i<this.k; i++){
                const count = clusters[i].pixels.length;
                if(count > 0){
                    const newCentroid = {
                        "r": Math.round(clusters[i].sum[0]/count),
                        "g": Math.round(clusters[i].sum[1]/count),
                        "b": Math.round(clusters[i].sum[2]/count),
                    } as Pixel;

                    if(!arraysEqual(newCentroid, this.centroids[i])){
                        this.centroids[i] = newCentroid; 
                        changed = true;
                    }
                }
            }

            if (!changed) break;
        }

        // console.log(this.centroids);

        // let result = this.centroids.map((c) => c)

        this.centroids.map((color: any)=> console.log(`hex: ${this.rgbToHex(color.r, color.g, color.b)}`))

        return this.styling(this.centroids)
    }
}
