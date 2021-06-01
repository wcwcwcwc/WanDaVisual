import BaseLayer from '../core/BaseLayer';
import LineModels, { LineModelType } from './models';
export enum lineStyleType {
  'solid' = 0.0,
  'dash' = 1.0,
}
export interface ILineLayerStyleOptions {
  opacity: number;
  lineType?: keyof typeof lineStyleType;
  dashArray?: [number, number];
  segmentNumber: number;
}

export default class LineLayer extends BaseLayer<ILineLayerStyleOptions> {
  public type: string = 'LineLayer';

  public buildModels() {
    const shape = this.getModelType();
    this.layerModel = new LineModels[shape](this);
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
      line: {},
      arc3d: { blend: 'additive' },
      arc: { blend: 'additive' },
      greatcircle: { blend: 'additive' },
    };
    return defaultConfig[type];
  }
  protected getModelType(): LineModelType {
    const shapeAttribute = this.styleAttributeService.getLayerStyleAttribute(
      'shape'
    );
    const shape = shapeAttribute?.scale?.field as LineModelType;
    return shape || 'line';
  }
}
