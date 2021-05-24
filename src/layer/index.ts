import { container, ILayerPlugin, TYPES } from '@core';
import BaseLayer from './core/BaseLayer';
import './glsl.d';
import PointLayer from './point';

import DataMappingPlugin from './plugins/DataMappingPlugin';
import DataSourcePlugin from './plugins/DataSourcePlugin';
import FeatureScalePlugin from './plugins/FeatureScalePlugin';
import RegisterStyleAttributePlugin from './plugins/RegisterStyleAttributePlugin';

/*
  图层生命周期流程————数据处理阶段
  1. 数据源转成相应格式，并完成数据源绑定
  2. 除了注册自定义属性（指：用户输入的属性）外，还要注册内置属性（position，filter，color）
  3. 根据属性值和数据源中的字段名称，生成Scale，用于数据映射
  4. 根据每个属性Attributes上的Scaler，对每个点进行字段映射，生成完整的encodeFeature信息，包含（shape，color，size，coordinate等）

  图层生命周期流程————模型生成阶段
*/

container
  .bind<ILayerPlugin>(TYPES.ILayerPlugin)
  .to(DataSourcePlugin)
  .inRequestScope();
/**
 * 根据 StyleAttribute 创建 VertexAttribute
 */
container
  .bind<ILayerPlugin>(TYPES.ILayerPlugin)
  .to(RegisterStyleAttributePlugin)
  .inRequestScope();
/**
 * 根据 Source 创建 Scale
 */
container
  .bind<ILayerPlugin>(TYPES.ILayerPlugin)
  .to(FeatureScalePlugin)
  .inRequestScope();
/**
 * 使用 Scale 进行数据映射
 */
container
  .bind<ILayerPlugin>(TYPES.ILayerPlugin)
  .to(DataMappingPlugin)
  .inRequestScope();

export { PointLayer };
