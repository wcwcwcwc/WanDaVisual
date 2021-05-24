import BaseLayer from '../core/BaseLayer';
interface IPointLayerStyleOptions {
  opacity: number;
  strokeWidth: number;
  stroke: string;
}
export default class PointLayer extends BaseLayer<IPointLayerStyleOptions> {}
