import { ILayerModel } from '@core';
import FillModel from './fill';

export type PointType = 'fill';

const PointModels: { [key in PointType]: any } = {
  fill: FillModel,
};

export default PointModels;
