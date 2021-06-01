/**
 * @图元三角化
 */

import { IEncodeFeature } from '@core';
import { calculteCentroid } from '../utils/geo';
import { IPosition } from '../core/geometry/path';
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

/**
 *  计算弧线顶点(2d,3d)
 * @param feature 映射数据
 * @param segNum 弧线线段数
 */
export function LineArcTriangulation(feature: IEncodeFeature) {
  const segNum = 30;
  const coordinates = feature.coordinates as IPosition[];
  const positions: any = [];
  const indexArray: any = [];
  for (let i = 0; i < segNum; i++) {
    //一个顶点偏移两次
    positions.push(
      i,
      1,
      i,
      coordinates[0][0],
      coordinates[0][1],
      coordinates[1][0],
      coordinates[1][1],
      i,
      -1,
      i,
      coordinates[0][0],
      coordinates[0][1],
      coordinates[1][0],
      coordinates[1][1]
    );
    if (i !== segNum - 1) {
      indexArray.push(
        ...[0, 1, 2, 1, 3, 2].map((v) => {
          return i * 2 + v;
        })
      );
    }
  }
  return {
    vertices: positions,
    indices: indexArray,
    size: 7,
  };
}
