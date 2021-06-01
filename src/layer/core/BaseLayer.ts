import {
  ILayer,
  IDataState,
  IModel,
  IMultiPassRenderer,
  ILayerPlugin,
  ILayerModel,
  lazyInject,
  TYPES,
  IGlobalConfigService,
  IShaderModuleService,
  ICameraService,
  IRendererService,
  ILayerService,
  IMapService,
  IStyleAttributeService,
  IPostProcessingPass,
  IPass,
  IAnimateOption,
  IEncodeFeature,
  ILayerConfig,
  StyleAttributeField,
  StyleAttributeOption,
  IStyleAttributeUpdateOptions,
  IScaleOptions,
  ICoordinateSystemService,
  ILayerModelInitializationOptions,
  IModelInitializationOptions,
  BlendType,
} from '@core';
import { Source } from '@source';
import { Container } from 'inversify';
import { isFunction, isObject } from 'lodash';
import { SyncBailHook, SyncHook, SyncWaterfallHook } from 'tapable';
import { BlendTypes } from '../utils/blend';

/**
 * 分配 layer id
 */
let layerIdCounter = 0;
//图层实体类，唯一实体
export default class BaseLayer<ChildLayerStyleOptions = {}> implements ILayer {
  public id: string = `${layerIdCounter++}`;
  public name: string = `${layerIdCounter}`;
  public type: string;
  public visible: boolean = true;
  public zIndex: number = 0;
  public minZoom: number;
  public maxZoom: number;
  public inited: boolean = false;
  public layerModelNeedUpdate: boolean = false;
  public pickedFeatureID: number | null = null;
  public selectedFeatureID: number | null = null;
  public styleNeedUpdate: boolean = false;
  public dataState: IDataState = {
    dataSourceNeedUpdate: false,
    dataMappingNeedUpdate: false,
    filterNeedUpdate: false,
    featureScaleNeedUpdate: false,
    StyleAttrNeedUpdate: false,
  };
  // 生命周期钩子
  public hooks = {
    init: new SyncBailHook(),
    afterInit: new SyncBailHook(),
    beforeRender: new SyncBailHook(),
    //@ts-ignore
    beforeRenderData: new SyncWaterfallHook(['test']), //SyncWaterfallHook必传一个参数，此处test无意义
    afterRender: new SyncHook(),
    beforePickingEncode: new SyncHook(),
    afterPickingEncode: new SyncHook(),
    beforeHighlight: new SyncHook(['pickedColor']),
    afterHighlight: new SyncHook(),
    beforeSelect: new SyncHook(['pickedColor']),
    afterSelect: new SyncHook(),
    beforeDestroy: new SyncHook(),
    afterDestroy: new SyncHook(),
  };

  // 待渲染 model 列表
  public models: IModel[] = [];

  // 每个 Layer 都有一个
  public multiPassRenderer: IMultiPassRenderer;

  // 注入插件集
  public plugins: ILayerPlugin[];

  //数据只支持GeoJson格式
  public sourceOption: {
    data: any;
    options?: any;
  };
  public layerModel: ILayerModel;

  @lazyInject(TYPES.IGlobalConfigService)
  protected readonly configService: IGlobalConfigService;

  @lazyInject(TYPES.IShaderModuleService)
  protected readonly shaderModuleService: IShaderModuleService;

  protected cameraService: ICameraService;

  protected rendererService: IRendererService;

  protected layerService: ILayerService;

  protected mapService: IMapService;

  protected coordinateService: ICoordinateSystemService;

  protected styleAttributeService: IStyleAttributeService;

  protected layerSource: Source;

  protected postProcessingPassFactory: (
    name: string
  ) => IPostProcessingPass<unknown>;
  protected normalPassFactory: (name: string) => IPass<unknown>;

  protected animateOptions: IAnimateOption = { enable: false };

  /**
   * 图层容器
   */
  private container: Container;

  private encodedData: IEncodeFeature[];

  private configSchema: object;

  private currentPickId: number | null = null;

  private rawConfig: Partial<ILayerConfig & ChildLayerStyleOptions>;

  /**
   * style样式字段
   */
  private needUpdateConfig: Partial<ILayerConfig & ChildLayerStyleOptions>;
  /**
   * 待更新样式属性，在初始化阶段完成注册
   */
  private pendingStyleAttributes: Array<{
    attributeName: string;
    attributeField: StyleAttributeField;
    attributeValues?: StyleAttributeOption;
    defaultName?: string;
    updateOptions?: Partial<IStyleAttributeUpdateOptions>;
  }> = [];
  private scaleOptions: IScaleOptions = {};

  private animateStartTime: number;

  private aniamateStatus: boolean = false;

  constructor(config: Partial<ILayerConfig & ChildLayerStyleOptions> = {}) {
    this.name = config.name || this.id;
    this.zIndex = config.zIndex || 0;
    this.rawConfig = config;
  }
  public getLayerConfig() {
    return this.configService.getLayerConfig<ChildLayerStyleOptions>(this.id);
  }
  public updateLayerConfig(
    configToUpdate: Partial<ILayerConfig | ChildLayerStyleOptions>
  ) {
    if (!this.inited) {
      this.needUpdateConfig = {
        ...this.needUpdateConfig,
        ...configToUpdate,
      };
    } else {
      const sceneId = this.container.get<string>(TYPES.SceneID);
      this.configService.setLayerConfig(sceneId, this.id, {
        ...this.configService.getLayerConfig(this.id),
        ...this.needUpdateConfig,
        ...configToUpdate,
      });
      this.needUpdateConfig = {};
    }
  }
  /**
   * 注入图层容器，父容器为场景容器
   * RootContainer 1
   *  -> SceneContainer 1.*
   *   -> LayerContainer 1.*
   */
  public setContainer(container: Container) {
    this.container = container;
  }
  public getContainer() {
    return this.container;
  }
  //@ts-ignore
  public addPlugin(plugin: ILayerPlugin) {
    this.plugins.push(plugin);
    return this;
  }
  /**
   * 动画设置
   */
  public animate(options: IAnimateOption | boolean) {
    let rawAnimate: Partial<IAnimateOption> = {};
    if (isObject(options)) {
      rawAnimate.enable = true;
      rawAnimate = {
        ...rawAnimate,
        ...options,
      };
    } else {
      rawAnimate.enable = options;
    }
    this.updateLayerConfig({
      animateOption: rawAnimate,
    });
    // this.animateOptions = options;
    return this;
  }
  /**
   * 设置数据源
   */
  public source(data: any) {
    this.sourceOption = {
      data,
    };
    return this;
  }
  public style(
    options: Partial<ChildLayerStyleOptions> & Partial<ILayerConfig>
  ) {
    const { passes, ...rest } = options;

    // passes 特殊处理
    // if (passes) {
    //   normalizePasses(passes).forEach(
    //     (pass: [string, { [key: string]: unknown }]) => {
    //       const postProcessingPass = this.multiPassRenderer
    //         .getPostProcessor()
    //         .getPostProcessingPassByName(pass[0]);
    //       if (postProcessingPass) {
    //         postProcessingPass.updateOptions(pass[1]);
    //       }
    //     },
    //   );
    // }

    this.rawConfig = {
      ...this.rawConfig,
      ...rest,
    };

    if (this.container) {
      this.updateLayerConfig(this.rawConfig);
      this.styleNeedUpdate = true;
    }
    return this;
  }

  public init() {
    const sceneId = this.container.get<string>(TYPES.SceneID);
    // 初始化图层配置项
    const { enableMultiPassRenderer = false } = this.rawConfig;
    this.configService.setLayerConfig(sceneId, this.id, {
      enableMultiPassRenderer,
    });
    //场景容器服务
    this.rendererService = this.container.get<IRendererService>(
      TYPES.IRendererService
    );
    this.layerService = this.container.get<ILayerService>(TYPES.ILayerService);
    this.mapService = this.container.get<IMapService>(TYPES.IMapService);
    this.cameraService = this.container.get<ICameraService>(
      TYPES.ICameraService
    );
    this.coordinateService = this.container.get<ICoordinateSystemService>(
      TYPES.ICoordinateSystemService
    );

    //图层容器服务
    this.styleAttributeService = this.container.get<IStyleAttributeService>(
      TYPES.IStyleAttributeService
    );
    // 自定义属性注册
    this.pendingStyleAttributes.forEach(
      ({ attributeName, attributeField, attributeValues, updateOptions }) => {
        this.styleAttributeService.updateStyleAttribute(
          attributeName,
          {
            // @ts-ignore
            scale: {
              field: attributeField,
              ...this.splitValuesAndCallbackInAttribute(
                // @ts-ignore
                attributeValues,
                // @ts-ignore
                this.getLayerConfig()[attributeName]
              ),
            },
          },
          // @ts-ignore
          updateOptions
        );
      }
    );
    this.pendingStyleAttributes = [];

    //图层生命周期插件注册依赖注入
    this.plugins = this.container.getAll<ILayerPlugin>(TYPES.ILayerPlugin);
    // 完成插件注册，传入场景和图层容器内的服务
    for (const plugin of this.plugins) {
      //@ts-ignore
      plugin.apply(this, {
        rendererService: this.rendererService,
        mapService: this.mapService,
        styleAttributeService: this.styleAttributeService,
        normalPassFactory: this.normalPassFactory,
        postProcessingPassFactory: this.postProcessingPassFactory,
      });
    }
    // 触发 init 生命周期插件
    //@ts-ignore
    this.hooks.init.call();
    //@ts-ignore
    this.hooks.afterInit.call();
    return this;
  }

  public prepareBuildModel() {
    this.inited = true;
    this.updateLayerConfig({
      ...(this.getDefaultConfig() as object),
      ...this.rawConfig,
    });

    // 启动动画
    const { animateOption } = this.getLayerConfig();
    if (animateOption?.enable) {
      this.layerService.startAnimate();
      this.aniamateStatus = true;
    }
  }
  public color(
    field: StyleAttributeField,
    values?: StyleAttributeOption,
    updateOptions?: Partial<IStyleAttributeUpdateOptions>
  ) {
    // 设置 color、size、shape、style 时由于场景服务尚未完成（并没有调用 scene.addLayer），因此暂时加入待更新属性列表
    this.updateStyleAttribute('color', field, values, updateOptions);
    return this;
  }

  public size(
    field: StyleAttributeField,
    values?: StyleAttributeOption,
    updateOptions?: Partial<IStyleAttributeUpdateOptions>
  ) {
    this.updateStyleAttribute('size', field, values, updateOptions);
    return this;
  }
  public shape(
    field: StyleAttributeField,
    values?: StyleAttributeOption,
    updateOptions?: Partial<IStyleAttributeUpdateOptions>
  ) {
    this.updateStyleAttribute('shape', field, values, updateOptions);
    return this;
  }

  private updateStyleAttribute(
    type: string,
    field: StyleAttributeField,
    values?: StyleAttributeOption,
    updateOptions?: Partial<IStyleAttributeUpdateOptions>
  ) {
    if (!this.inited) {
      this.pendingStyleAttributes.push({
        attributeName: type,
        attributeField: field,
        attributeValues: values,
        updateOptions,
      });
    } else {
      this.styleAttributeService.updateStyleAttribute(
        type,
        {
          // @ts-ignore
          scale: {
            field,
            ...this.splitValuesAndCallbackInAttribute(
              // @ts-ignore
              values,
              // @ts-ignore
              this.getLayerConfig()[field]
            ),
          },
        },
        // @ts-ignore
        updateOptions
      );
    }
  }
  //判断value值是callback的情况
  private splitValuesAndCallbackInAttribute(
    valuesOrCallback?: unknown[],
    defaultValues?: unknown[]
  ) {
    return {
      values: isFunction(valuesOrCallback)
        ? undefined
        : valuesOrCallback || defaultValues,
      callback: isFunction(valuesOrCallback) ? valuesOrCallback : undefined,
    };
  }
  public isVisible(): boolean {
    const zoom = this.mapService.getZoom();
    const {
      visible,
      minZoom = -Infinity,
      maxZoom = Infinity,
    } = this.getLayerConfig();
    return !!visible && zoom >= minZoom && zoom <= maxZoom;
  }
  public render() {
    // if (
    //   this.needPick() &&
    //   this.multiPassRenderer &&
    //   this.multiPassRenderer.getRenderFlag()
    // ) {
    //   this.multiPassRenderer.render();
    // } else if (this.needPick() && this.multiPassRenderer) {
    //   this.renderModels();
    // } else {
    //   this.renderModels();
    // }
    //this.renderModels();
    // this.multiPassRenderer.render();
    // this.renderModels();
    this.renderModels();
    return this;
  }
  public destroy() {}
  public setSource(source: Source) {
    this.layerSource = source;
    // const zoom = this.mapService.getZoom();
    // if (this.layerSource.cluster) {
    //   this.layerSource.updateClusterData(zoom);
    // }
    // // source 可能会复用，会在其它layer被修改
    // this.layerSource.on('update', this.sourceEvent);
  }
  public getSource() {
    return this.layerSource;
  }
  public setEncodedData(encodedData: IEncodeFeature[]) {
    this.encodedData = encodedData;
  }
  public getEncodedData() {
    return this.encodedData;
  }

  public getScaleOptions() {
    return this.scaleOptions;
  }
  protected getDefaultConfig() {
    return {};
  }
  public buildModels() {
    throw new Error('Method not implemented.');
  }
  public setAnimateStartTime() {
    this.animateStartTime = this.layerService.clock.getElapsedTime();
  }
  public getLayerAnimateTime(): number {
    return this.layerService.clock.getElapsedTime() - this.animateStartTime;
  }
  public buildLayerModel(
    options: ILayerModelInitializationOptions &
      Partial<IModelInitializationOptions>
  ): IModel {
    const {
      moduleName,
      vertexShader,
      fragmentShader,
      triangulation,
      ...rest
    } = options;
    this.shaderModuleService.registerModule(moduleName, {
      vs: vertexShader,
      fs: fragmentShader,
    });
    const { vs, fs, uniforms } = this.shaderModuleService.getModule(moduleName);
    //vs、fs:包含模块引用后的着色器
    //uniforms：包含提取后的uniforms

    const { createModel } = this.rendererService;
    const {
      attributes,
      elements,
    } = this.styleAttributeService.createAttributesAndIndices(
      this.encodedData,
      triangulation
    );
    return createModel({
      attributes,
      uniforms,
      fs,
      vs,
      elements,
      blend: BlendTypes[BlendType.normal],
      ...rest,
    });
  }
  public renderModels() {
    if (this.layerModelNeedUpdate && this.layerModel) {
      this.models = this.layerModel.buildModels();
      //@ts-ignore
      this.hooks.beforeRender.call();
      this.layerModelNeedUpdate = false;
    }
    this.models.forEach((model) => {
      model.draw({
        uniforms: this.layerModel.getUninforms(),
      });
    });
    return this;
  }
}
