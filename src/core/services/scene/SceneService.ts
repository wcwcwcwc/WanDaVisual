import { inject, injectable } from 'inversify';
import elementResizeEvent, { unbind } from 'element-resize-event';
import { ISceneService, ISceneConfig } from './ISceneService';
import { TYPES } from '@core';
import { IGlobalConfigService } from '../config/IGlobalConfigService';
import { IMapService } from '../map/IMapService';
import { IRendererService, IRenderConfig } from '../renderer/IRendererService';
import { ILayerService, ILayer } from '../layer/lLayerService';
import { ICameraService, IViewport } from '../camera/ICameraService';
import { IShaderModuleService } from '../shader/IShaderModuleService';
import { ICoordinateSystemService } from '../coordinate/ICoordinateSystemService';
import { createRendererContainer } from '../../utils/dom';
import { DOM } from '@utils';
import { EventEmitter } from 'eventemitter3';

@injectable()
export default class Scene extends EventEmitter implements ISceneService {
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

  @inject(TYPES.ICoordinateSystemService)
  private readonly coordinateSystemService: ICoordinateSystemService;

  public destroyed: boolean = false;

  public loaded: boolean = false;
  /**
   * 是否首次渲染
   */
  private inited: boolean = false;

  private rendering: boolean = false;

  /**
   * canvas 容器
   */
  private $container: HTMLDivElement | null;

  private canvas: HTMLCanvasElement;

  public async init(config: ISceneConfig) {
    let mapId = this.map.getContainer()?.id;
    let configAll = {
      id: mapId,
      ...config,
    };
    //设置场景配置项
    this.configService.setSceneConfig(this.id, configAll);
    // 初始化 ShaderModule,注册内置shader
    this.shaderModuleService.registerBuiltinModules();
    /**
     * 初始化相机
     */
    this.map.onCameraChanged((viewport: IViewport) => {
      this.cameraService.init();
      this.cameraService.update(viewport);
    });
    this.map.init();
    // 重新绑定非首次相机更新事件
    this.map.onCameraChanged(this.handleMapCameraChanged);

    /**
     * 初始化渲染引擎
     */

    // 创建底图之上的 container
    const $container = createRendererContainer(
      this.configService.getSceneConfig(this.id).id || ''
    );
    this.$container = $container;
    if ($container) {
      this.canvas = DOM.create('canvas', '', $container) as HTMLCanvasElement;
      this.setCanvas();
      await this.rendererService.init(
        // @ts-ignore
        this.canvas,
        this.configService.getSceneConfig(this.id) as IRenderConfig
      );
      elementResizeEvent(
        this.$container as HTMLDivElement,
        this.handleWindowResized
      );
    }
    this.render();
  }

  public addLayer(layer: ILayer): void {
    this.layerService.add(layer);
    this.render()
  }
  // public getSceneConfig(): Partial<ISceneConfig> {}
  public render(): void {
    if (this.rendering || this.destroyed) {
      return;
    }
    this.rendering = true;
    // 首次初始化，或者地图的容器被强制销毁的需要重新初始化
    if (!this.inited) {
      if (this.destroyed) {
        this.destroy();
      }
      this.layerService.initLayers();
      this.loaded = true;
      this.emit('loaded');
      this.inited = true;
    }
    // 尝试初始化未初始化的图层
    this.layerService.renderLayers();
    this.rendering = false;
  }
  public getSceneContainer(): HTMLDivElement {
    return this.$container as HTMLDivElement;
  }
  // public getMarkerContainer(): HTMLElement {}
  // public exportPng(type?: 'png' | 'jpg'): string {}
  public destroy(): void {
    if (!this.inited) {
      this.destroyed = true;
      return;
    }
    this.layerService.destroy();
    this.rendererService.destroy();
    this.map.destroy();
    this.inited = false;
    unbind(this.$container as HTMLDivElement, this.handleWindowResized);
  }
  private handleMapCameraChanged = (viewport: IViewport) => {
    this.cameraService.update(viewport);
    this.render();
  };
  private setCanvas() {
    const pixelRatio = DOM.DPR;
    const w = this.$container?.clientWidth || 400;
    const h = this.$container?.clientHeight || 300;
    const canvas = this.canvas;
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
  private handleWindowResized = () => {
    // this.emit('resize');
    // @ts-check
    if (this.$container) {
      this.initContainer();
      DOM.triggerResize();
      this.coordinateSystemService.needRefresh = true;

      //  repaint layers
      this.render();
    }
  };
  private initContainer() {
    const pixelRatio = DOM.DPR;
    const w = this.$container?.clientWidth || 400;
    const h = this.$container?.clientHeight || 300;
    const canvas = this.canvas;
    if (canvas) {
      canvas.width = w * pixelRatio;
      canvas.height = h * pixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    this.rendererService.viewport({
      x: 0,
      y: 0,
      width: pixelRatio * w,
      height: pixelRatio * h,
    });
  }
}
