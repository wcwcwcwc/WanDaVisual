import 'reflect-metadata';
import { Container, decorate, injectable, interfaces } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import { TYPES } from './type';
import { EventEmitter } from 'eventemitter3';

//接口服务
import { ILayerService } from './services/layer/lLayerService';
import { ISceneService } from './services/scene/ISceneService';
import { ICameraService } from './services/camera/ICameraService';
import { IGlobalConfigService } from './services/config/IGlobalConfigService';
import { IShaderModuleService } from './services/shader/IShaderModuleService';
import { IStyleAttributeService } from './services/styleAttribute/IStyleAttributeService';

//实体服务
import LayerService from './services/layer/LayerService';
import SceneService from './services/scene/SceneService';
import CameraService from './services/camera/CameraService';
import GlobalConfigService from './services/config/GlobalConfigService';
import ShaderModuleService from './services/shader/ShaderModuleService';
import StyleAttributeService from './services/styleAttribute/StyleAttributeService';

const container = new Container();

container
  .bind<IGlobalConfigService>(TYPES.IGlobalConfigService)
  .to(GlobalConfigService)
  .inSingletonScope();
container
  .bind<IShaderModuleService>(TYPES.IShaderModuleService)
  .to(ShaderModuleService)
  .inSingletonScope();

decorate(injectable(), EventEmitter);
container.bind(TYPES.IEventEmitter).to(EventEmitter);
const DECORATORS = getDecorators(container, false);
interface IBabelPropertyDescriptor extends PropertyDescriptor {
  initializer(): any;
}
export default container;
// Add babel legacy decorators support
// @see https://github.com/inversify/InversifyJS/issues/1050
// @see https://github.com/inversify/InversifyJS/issues/1026#issuecomment-504936034
export const lazyInject = (
  serviceIdentifier: interfaces.ServiceIdentifier<any>
) => {
  const original = DECORATORS.lazyInject(serviceIdentifier);
  // the 'descriptor' parameter is actually always defined for class fields for Babel, but is considered undefined for TSC
  // so we just hack it with ?/! combination to avoid "TS1240: Unable to resolve signature of property decorator when called as an expression"
  return function(
    this: any,
    proto: any,
    key: string,
    descriptor?: IBabelPropertyDescriptor
  ): void {
    // make it work as usual
    original.call(this, proto, key);
    // return link to proto, so own value wont be 'undefined' after component's creation
    if (descriptor) {
      descriptor.initializer = () => {
        return proto[key];
      };
    }
  };
};

let sceneId = 0;
export function setScene() {
  const sceneContainer = new Container();
  sceneContainer.parent = container;
  // 生成场景 ID 并保存在容器内
  sceneContainer.bind<string>(TYPES.SceneID).toConstantValue(`${sceneId++}`);
  sceneContainer
    .bind<ILayerService>(TYPES.ILayerService)
    .to(LayerService)
    .inSingletonScope();
  sceneContainer
    .bind<ISceneService>(TYPES.ISceneService)
    .to(SceneService)
    .inSingletonScope();
  sceneContainer
    .bind<ICameraService>(TYPES.ICameraService)
    .to(CameraService)
    .inSingletonScope();

  return sceneContainer;
}
export function createLayerContainer(sceneContainer: Container) {
  const layerContainer = new Container();
  layerContainer.parent = sceneContainer;

  layerContainer
    .bind<IStyleAttributeService>(TYPES.IStyleAttributeService)
    .to(StyleAttributeService)
    .inSingletonScope();
  // layerContainer
  //   .bind<IMultiPassRenderer>(TYPES.IMultiPassRenderer)
  //   .to(MultiPassRenderer)
  //   .inSingletonScope();
  // layerContainer
  //   .bind<IPostProcessor>(TYPES.IPostProcessor)
  //   .to(PostProcessor)
  //   .inSingletonScope();

  return layerContainer;
}
