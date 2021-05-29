import { ILayer, ILayerPlugin, IMapService, TYPES } from '@core';
import { injectable } from 'inversify';
/**
 * Model 更新
 */
@injectable()
export default class UpdateModelPlugin implements ILayerPlugin {
  public apply(layer: ILayer) {
    layer.hooks.beforeRender.tap('UpdateModelPlugin', () => {
      // 处理文本更新
      if (layer.layerModel) {
        layer.layerModel.needUpdate();
      }
    });
  }
}
