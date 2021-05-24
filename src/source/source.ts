import { IParserData } from '@core';
import { BBox } from '@turf/helpers';
import geoJSON from './parser/geojson';
import { extent } from '@utils';
export default class Source {
  //处理后的数据
  public data: IParserData;
  // 数据范围
  public extent: BBox;
  public parser = { type: 'geojson' }; //唯一格式：GeoJSon
  // 是否有效范围
  private invalidExtent: boolean = false;
  // 原始数据
  private originData: any;
  constructor(data: any) {
    this.originData = data;
    this.data = geoJSON(this.originData);
    this.extent = extent(this.data.dataArray);
    this.invalidExtent =
      this.extent[0] === this.extent[2] || this.extent[1] === this.extent[3];
  }
}
