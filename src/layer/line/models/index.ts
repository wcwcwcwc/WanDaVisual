
import Arc3DModel from './arc_3d';
export type LineModelType = 'arc3d';

const LineModels: { [key in LineModelType]: any } = {
  arc3d: Arc3DModel,
};

export default LineModels;
