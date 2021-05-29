import BaseLayer from '../core/BaseLayer';
import { IEncodeFeature } from '@core';
import PointModels, { PointType } from './models/index';
interface IPointLayerStyleOptions {
  opacity: number;
  strokeWidth: number;
  stroke: string;
}
export default class PointLayer extends BaseLayer<IPointLayerStyleOptions> {
  public type: string = 'PointLayer';
  public buildModels() {
    const modelType = this.getModelType();
    this.layerModel = new PointModels[modelType](this);

    this.models = this.layerModel.initModels();
  }
  public rebuildModels() {
    this.models = this.layerModel.buildModels();
  }
  protected getConfigSchema() {
    return {
      properties: {
        opacity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
        },
      },
    };
  }
  protected getDefaultConfig() {
    const type = this.getModelType();
    const defaultConfig = {
      normal: {
        blend: 'additive',
      },
      fill: { blend: 'normal' },
      extrude: {},
      image: {},
      icon: {},
      text: {
        blend: 'normal',
      },
    };
    return defaultConfig[type];
  }
  //@ts-ignore
  protected getModelType(): PointType {
    // pointlayer
    // 第一版先只实现fill
    const layerData = this.getEncodedData();
    const { shape2d, shape3d } = this.getLayerConfig();
    const item = layerData.find((fe: IEncodeFeature) => {
      return fe.hasOwnProperty('shape');
    });
    const shape = item && item.shape;
    if (shape2d?.indexOf(shape as string) !== -1) {
      return 'fill';
    }
  }
}
