//数据处理；统一输入是geojson=》分离坐标
//只关注数据本身，此处还不对属性做映射
/* Example
    {
      type:'FeatureCollection',
      features:[
        {type:'Feature',
         properties:{},
         geometry:{
           type:'Point',
            coordinates:[120,31]
        }},
        {type:'Feature',
         properties:{},
         geometry:{
           type:'Point',
            coordinates:[121,31]
        }},
      ]
    }
    ================转化成=================
  encodeFeature:
  [
    {
      coordinate:[120,31],
      id:0,
    },
    {
      coordinate:[120,31],
      id:1,
    },
  ]
*/
import { ILayer, ILayerPlugin, IMapService, TYPES } from '@core';
import Source from '../../source/source';
import { injectable } from 'inversify';
@injectable()
export default class DataSourcePlugin implements ILayerPlugin {
  protected mapService: IMapService;
  public apply(layer: ILayer) {
    this.mapService = layer.getContainer().get<IMapService>(TYPES.IMapService);
    layer.hooks.init.tap('DataSourcePlugin', () => {
      console.log('进入DataSourcePlugin');
      const { data } = layer.sourceOption;
      layer.setSource(new Source(data));
    });

    // 检测数据是否需要更新
    layer.hooks.beforeRenderData.tap('DataSourcePlugin', () => {
      const dataSourceNeedUpdate = layer.dataState.dataSourceNeedUpdate;
      layer.dataState.dataSourceNeedUpdate = false;
      return dataSourceNeedUpdate;
    });
  }
}
