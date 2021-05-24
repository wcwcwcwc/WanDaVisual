//抽象地图接口
import { IViewport } from '../camera/ICameraService';
export type Point = [number, number];
export type Bounds = [[number, number], [number, number]];
export interface ILngLat {
  lng: number;
  lat: number;
}
export interface IPoint {
  x: number;
  y: number;
}
export interface IMapService {
  map: any;
  // get dom
  getContainer(): HTMLElement | null;
  getSize(): [number, number];
  // get map status method
  getMinZoom(): number;
  getMaxZoom(): number;
  // get map params
  getType(): string;
  getZoom(): number;
  getCenter(): ILngLat;
  getPitch(): number;
  getRotation(): number;
  getBounds(): Bounds;
  getMapContainer(): HTMLElement | null;
  getMapCanvasContainer(): HTMLElement;

  // control with raw map
  setRotation(rotation: number): void;
  zoomIn(option?: any, eventData?: any): void;
  zoomOut(option?: any, eventData?: any): void;
  panTo(p: Point): void;
  panBy(pixel: Point): void;
  fitBounds(bound: Bounds, fitBoundsOptions?: unknown): void;
  setZoomAndCenter(zoom: number, center: Point): void;
  setCenter(center: [number, number]): void;
  setPitch(pitch: number): void;
  setZoom(zoom: number): void;

  // coordinates methods
  pixelToLngLat(pixel: Point): ILngLat;
  lngLatToPixel(lnglat: Point): IPoint;
  on(type: string, handler: (...args: any[]) => void): void;
  off(type: string, handler: (...args: any[]) => void): void;
  init(): void;
  initMap(): void;
  onCameraChanged(callback: (viewport: IViewport) => void): void;
  destroy(): void;
}

export interface IMapConfig {
  //地图配置项
  map: any;
  mapType: string;
}
/**
 * 地图相机参数
 * @see
 */
export interface IMapCamera {
  // Perspective 相机常规参数
  // @see https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
  aspect: number;
  fov: number;
  near: number;
  far: number;

  viewportWidth: number;
  viewportHeight: number;

  // 地图相机特有参数
  // @see https://docs.mapbox.com/mapbox-gl-js/api/#map
  pitch: number;
  bearing: number;
  zoom: number;
  center: [number, number];
  // 相机高度
  cameraHeight: number;
  // 偏移原点，例如 P20 坐标系下
  offsetOrigin: [number, number];
}
