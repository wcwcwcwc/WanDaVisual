import { inject, injectable } from 'inversify';
import { ISceneService, ISceneConfig } from './ISceneService';
import { TYPES } from '@core';
import { IGlobalConfigService } from '../config/IGlobalConfigService';
import { IMapService } from '../map/IMapService';
import { IRendererService } from '../renderer/IRendererService';
import { ILayerService, ILayer } from '../layer/lLayerService';
import { ICameraService } from '../camera/ICameraService';
import { IShaderModuleService } from '../shader/IShaderModuleService';

@injectable()
export default class Scene implements ISceneService {
  public destroyed: boolean = false;

  public loaded: boolean = false;

  @inject(TYPES.SceneID)
  private readonly id: string;

  @inject(TYPES.IGlobalConfigService)
  private readonly configService: IGlobalConfigService;

  @inject(TYPES.IMapService)
  private readonly map: IMapService;

  @inject(TYPES.IRendererService)
  private readonly rendererService: IRendererService;

  @inject(TYPES.ILayerService)
  private readonly layerService: ILayerService;

  @inject(TYPES.ICameraService)
  private readonly cameraService: ICameraService;

  @inject(TYPES.IShaderModuleService)
  private readonly shaderModuleService: IShaderModuleService;

  /**
   * 是否首次渲染
   */
  private inited: boolean = false;

  /**
   * canvas 容器
   */
  private $container: HTMLDivElement | null;

  private canvas: HTMLCanvasElement;

  public init(config: ISceneConfig) {
    let id = this.map.getContainer()?.id;
  }

  public addLayer(layer: ILayer): void {}
  // public getSceneConfig(): Partial<ISceneConfig> {}
  public render(): void {}
  // public getSceneContainer(): HTMLDivElement {}
  // public getMarkerContainer(): HTMLElement {}
  // public exportPng(type?: 'png' | 'jpg'): string {}
  public destroy(): void {}
}
