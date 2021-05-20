//场景入口
import { setScene } from '../core/inversify.config';
import { Container } from 'inversify';
import {
  IMapConfig,
  IMapService,
  TYPES,
  IRendererService,
  ISceneService,
  ILayerService,
} from '@core';
import MapboxMap from '../map/mapbox/map';
import { ReglRendererService } from '@renderer';
export default class sence {
  private container: Container;
  private mapService: IMapService;
  private sceneService: ISceneService;
  private layerService: ILayerService;
  constructor(config: IMapConfig) {
    const { map, mapType } = config;
    //创建场景容器
    const sceneContainer = setScene();
    this.container = sceneContainer;
    //场景config初始化
    this.container.bind<IMapConfig>(TYPES.MapConfig).toConstantValue({
      ...config,
    });
    //绑定地图服务，如：mapbox=>./map/mapbox
    if (mapType === 'mapbox') {
      this.container
        .bind<IMapService>(TYPES.IMapService)
        .to(MapboxMap)
        .inSingletonScope();
    }
    // 绑定渲染引擎服务
    sceneContainer
      .bind<IRendererService>(TYPES.IRendererService)
      .to(ReglRendererService)
      .inSingletonScope();
    //依赖注入
    this.mapService = this.container.get<IMapService>(TYPES.IMapService);
    this.sceneService = this.container.get<ISceneService>(TYPES.ISceneService);
    this.layerService = this.container.get<ILayerService>(TYPES.ILayerService);
    // // //相机初始化，绑定move事件
    this.mapService.initMap();
    // 初始化 scene
    this.sceneService.init(config);
  }
  //获取地图类型
  getMapType() {}
  //获取场景容器canvas
  getContainer() {}
  //场景添加图层
  addLayer() {}
  //移除当前场景，移除此场景的全部图层
  remove() {}
}
