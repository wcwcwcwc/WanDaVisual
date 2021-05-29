/**
 * @图元三角化
 */

import { IEncodeFeature } from '@core';
import { calculteCentroid } from '../utils/geo';
/**
 * 计算2D 填充点图顶点
 * 将一个点复制成4份，构成点阵
 *                                    point  -   point
 *   point =========================>  -           -
 *                                    point  -   point
 * @param feature 映射feature
 */
export function PointFillTriangulation(feature: IEncodeFeature) {
  const coordinates = calculteCentroid(feature.coordinates);
  return {
    vertices: [...coordinates, ...coordinates, ...coordinates, ...coordinates],
    indices: [0, 1, 2, 2, 3, 0],
    size: coordinates.length,
  };
}
