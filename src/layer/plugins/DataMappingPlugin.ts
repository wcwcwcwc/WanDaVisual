//为encodeFeature增加映射后的属性字段
/*Example:

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
  =====================新增映射后的属性============
    [
    {
      coordinate:[120,31],
      id:0,
      shape:'circle',
      size:5,
      color:[255,102,103,1]
    },
    {
      coordinate:[120,31],
      id:1,
      shape:'circle',
      size:15,
      color:[255,0,255,1]
    },
  ]
 */

import {
  IEncodeFeature,
  IGlobalConfigService,
  ILayer,
  ILayerPlugin,
  IParseDataItem,
  IStyleAttribute,
  IStyleAttributeService,
  TYPES,
} from '@core';
import { rgb2arr } from '@utils';
import { inject, injectable } from 'inversify';

@injectable()
export default class DataMappingPlugin implements ILayerPlugin {
  @inject(TYPES.IGlobalConfigService)
  private readonly configService: IGlobalConfigService;

  public apply(
    layer: ILayer,
    { styleAttributeService }: { styleAttributeService: IStyleAttributeService }
  ) {
    layer.hooks.init.tap('DataMappingPlugin', () => {
      console.log('进入DataMappingPlugin');
      // 初始化重新生成 map
      this.generateMaping(layer, { styleAttributeService });
    });

    layer.hooks.beforeRenderData.tap('DataMappingPlugin', () => {
      layer.dataState.dataMappingNeedUpdate = false;
      this.generateMaping(layer, { styleAttributeService });
      return true;
    });

    // remapping before render
    layer.hooks.beforeRender.tap('DataMappingPlugin', () => {
      if (layer.layerModelNeedUpdate) {
        return;
      }
      const attributes = styleAttributeService.getLayerStyleAttributes() || [];
      const filter = styleAttributeService.getLayerStyleAttribute('filter');
      const { dataArray } = layer.getSource().data;
      const attributesToRemapping = attributes.filter(
        (attribute) => attribute.needRemapping // 如果filter变化
      );
      let filterData = dataArray;
      // 数据过滤完 再执行数据映射
      if (filter?.needRemapping && filter?.scale) {
        filterData = dataArray.filter((record: IParseDataItem) => {
          return this.applyAttributeMapping(filter, record)[0];
        });
      }
      if (attributesToRemapping.length) {
        // 过滤数据
        if (filter?.needRemapping) {
          layer.setEncodedData(this.mapping(attributes, filterData));
          filter.needRemapping = false;
        } else {
          layer.setEncodedData(
            this.mapping(
              attributesToRemapping,
              filterData,
              layer.getEncodedData()
            )
          );
        }
        // 处理文本更新
        // layer.emit('remapping', null);
      }
    });
  }
  private generateMaping(
    layer: ILayer,
    { styleAttributeService }: { styleAttributeService: IStyleAttributeService }
  ) {
    const attributes = styleAttributeService.getLayerStyleAttributes() || [];
    const filter = styleAttributeService.getLayerStyleAttribute('filter');
    const { dataArray } = layer.getSource().data;
    let filterData = dataArray;
    // 数据过滤完 再执行数据映射
    if (filter?.scale) {
      filterData = dataArray.filter((record: IParseDataItem) => {
        return this.applyAttributeMapping(filter, record)[0];
      });
    }
    layer.setEncodedData(this.mapping(attributes, filterData));
  }

  private mapping(
    attributes: IStyleAttribute[],
    data: IParseDataItem[],
    predata?: IEncodeFeature[]
  ): IEncodeFeature[] {
    return data.map((record: IParseDataItem, i) => {
      const preRecord = predata ? predata[i] : {};
      const encodeRecord: IEncodeFeature = {
        id: record._id,
        coordinates: record.coordinates,
        ...preRecord,
      };
      attributes
        .filter((attribute) => attribute.scale !== undefined)
        .forEach((attribute: IStyleAttribute) => {
          let values = this.applyAttributeMapping(attribute, record);
          attribute.needRemapping = false;

          // TODO: 支持每个属性配置 postprocess
          if (attribute.name === 'color') {
            values = values.map((c: unknown) => {
              return rgb2arr(c as string);
            });
          }
          // @ts-ignore
          encodeRecord[attribute.name] =
            Array.isArray(values) && values.length === 1 ? values[0] : values;
        });
      return encodeRecord;
    }) as IEncodeFeature[];
  }

  private applyAttributeMapping(
    attribute: IStyleAttribute,
    record: { [key: string]: unknown }
  ) {
    if (!attribute.scale) {
      return [];
    }
    const scalers = attribute?.scale?.scalers || [];
    const params: unknown[] = [];

    scalers.forEach(({ field }) => {
      if (
        record.hasOwnProperty(field) ||
        attribute.scale?.type === 'variable'
      ) {
        // TODO:多字段，常量
        params.push(record[field]);
      }
    });
    return attribute.mapping ? attribute.mapping(params) : [];
  }
}
