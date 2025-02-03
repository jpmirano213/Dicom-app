declare module "cornerstone-wado-image-loader" {
    import * as cornerstone from "cornerstone-core";
    import * as dicomParser from "dicom-parser";
    import * as cornerstoneMath from "cornerstone-math";
  
    export const external: {
      cornerstone: typeof cornerstone;
      dicomParser?: typeof dicomParser;
      cornerstoneMath?: typeof cornerstoneMath;
    };
  
    export function configure(options: any): void;
    export function loadImage(imageId: string): Promise<any>;
    export function registerImageLoader(scheme: string, imageLoader: any): void;
  }
  