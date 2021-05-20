import { ILayer } from '../layer/lLayerService';
import { IMapConfig } from '../map/IMapService';
import { IMapService } from '@core';

export interface ISceneConfig {
  mapType: string;
  map: IMapService;
  animate?: boolean;
  fitBoundsOptions?: unknown;
  pickBufferScale?: number;
}

export interface ISceneService {
  destroyed: boolean;
  loaded: boolean;
  // on(type: string, handle: (...args: any[]) => void): void;
  // off(type: string, handle: (...args: any[]) => void): void;
  // removeAllListeners(event?: string): this;
  init(config: ISceneConfig): void;
  addLayer(layer: ILayer): void;
  // getSceneConfig(): Partial<ISceneConfig>;
  render(): void;
  // getSceneContainer(): HTMLDivElement;
  // getMarkerContainer(): HTMLElement;
  // exportPng(type?: 'png' | 'jpg'): string;
  destroy(): void;
}
