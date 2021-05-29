import { IMapService } from '../../core/services/map/IMapService';
import mapboxgl, { IControl, Map } from 'mapbox-gl';
import { inject, injectable } from 'inversify';
import Viewport from './viewport';
import {
  TYPES,
  IMapConfig,
  ILngLat,
  Bounds,
  IPoint,
  IViewport,
  ICoordinateSystemService,
  CoordinateSystem,
} from '@core';

//默认偏移坐标层级是12，大于12是偏移坐标系
const LNGLAT_OFFSET_ZOOM_THRESHOLD = 12;

@injectable()
export default class MapboxMap implements IMapService {
  public map: any;

  @inject(TYPES.MapConfig)
  private readonly config: IMapConfig;

  @inject(TYPES.ICoordinateSystemService)
  private readonly coordinateSystemService: ICoordinateSystemService;

  private $mapContainer: HTMLElement | null;
  private cameraChangedCallback: (viewport: IViewport) => void;
  private viewport: Viewport;
  //初始化
  public initMap() {
    this.map = this.config.map;
  }
  public init() {
    this.viewport = new Viewport();
    this.$mapContainer = this.map.getContainer();
    this.handleCameraChanged();
    this.map.on('move', this.handleCameraChanged.bind(this)); //同步相机
  }
  private handleCameraChanged() {
    const { lat, lng } = this.map.getCenter().wrap();
    this.viewport.syncWithMapCamera({
      bearing: this.map.getBearing(),
      center: [lng, lat],
      viewportHeight: this.map.transform.height,
      pitch: this.map.getPitch(),
      viewportWidth: this.map.transform.width,
      zoom: this.map.getZoom(),
      // mapbox 中固定相机高度为 viewport 高度的 1.5 倍
      cameraHeight: 0,
    });
    // set coordinate system
    if (this.viewport.getZoom() > LNGLAT_OFFSET_ZOOM_THRESHOLD) {
      this.coordinateSystemService.setCoordinateSystem(
        CoordinateSystem.LNGLAT_OFFSET
      );
    } else {
      this.coordinateSystemService.setCoordinateSystem(CoordinateSystem.LNGLAT);
    }
    // console.log('move');
    this.cameraChangedCallback(this.viewport);
  }
  public onCameraChanged(callback: (viewport: IViewport) => void): void {
    this.cameraChangedCallback = callback;
  }

  //  map event
  public on(type: string, handle: (...args: any[]) => void): void {
    // 统一事件名称
    this.map.on(type, handle);
  }
  public off(type: string, handle: (...args: any[]) => void): void {
    this.map.off(type, handle);
  }

  public getContainer(): HTMLElement | null {
    return this.map.getContainer();
  }

  public getMapCanvasContainer(): HTMLElement {
    return this.map.getCanvasContainer() as HTMLElement;
  }

  public getSize(): [number, number] {
    const size = this.map.transform;
    return [size.width, size.height];
  }
  // get mapStatus method

  public getType() {
    return 'mapbox';
  }

  public getZoom(): number {
    return this.map.getZoom();
  }

  public setZoom(zoom: number) {
    return this.map.setZoom(zoom);
  }

  public getCenter(): ILngLat {
    return this.map.getCenter();
  }

  public setCenter(lnglat: [number, number]): void {
    this.map.setCenter(lnglat);
  }

  public getPitch(): number {
    return this.map.getPitch();
  }

  public getRotation(): number {
    return this.map.getBearing();
  }

  public getBounds(): Bounds {
    return this.map.getBounds().toArray() as Bounds;
  }

  public getMinZoom(): number {
    return this.map.getMinZoom();
  }

  public getMaxZoom(): number {
    return this.map.getMaxZoom();
  }

  public setRotation(rotation: number): void {
    this.map.setBearing(rotation);
  }

  public zoomIn(option?: any, eventData?: any): void {
    this.map.zoomIn(option, eventData);
  }
  public zoomOut(option?: any, eventData?: any): void {
    this.map.zoomOut(option, eventData);
  }
  public setPitch(pitch: number) {
    return this.map.setPitch(pitch);
  }

  public panTo(p: [number, number]): void {
    this.map.panTo(p);
  }

  public panBy(pixel: [number, number]): void {
    this.panTo(pixel);
  }

  public fitBounds(bound: Bounds, fitBoundsOptions?: unknown): void {
    this.map.fitBounds(bound, fitBoundsOptions as mapboxgl.FitBoundsOptions);
  }

  public setMaxZoom(max: number): void {
    this.map.setMaxZoom(max);
  }

  public setMinZoom(min: number): void {
    this.map.setMinZoom(min);
  }
  public getMapContainer() {
    return this.map.getContainer();
  }
  public setZoomAndCenter(zoom: number, center: [number, number]): void {
    this.map.flyTo({
      zoom,
      center,
    });
  }
  public pixelToLngLat(pixel: [number, number]): ILngLat {
    return this.map.unproject(pixel);
  }

  public lngLatToPixel(lnglat: [number, number]): IPoint {
    return this.map.project(lnglat);
  }
  public destroy() {
    if (this.map) {
      this.map.remove();
      this.$mapContainer = null;
    }
  }
}
