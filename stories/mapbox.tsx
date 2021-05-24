import * as React from 'react';
import mapboxgl from './assets/mapbox-gl';
import './assets/mapbox-gl.css';
import Scene from '../src/sence';
import { PointLayer } from '../src/layer';
export default class Mapbox extends React.Component {
  public async componentDidMount() {
    mapboxgl.accessToken =
      'pk.eyJ1Ijoid2N3Y3djIiwiYSI6ImNrbmg0dmw2OTB4ZDIyb253ZDJuYXZlNG4ifQ.5vSMRe8A35mNhq7imipISg';
    let map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [120.6584389547279, 31.292601214089288], //地图中心经纬度
      zoom: 10, //缩放级别
      container: 'map',
    });
    map.on('load', () => {
      let mapConfig = {
        map,
        mapType: 'mapbox',
      };
      let scene = new Scene(mapConfig);
      scene.on('loaded', () => {
        console.log('场景初始化完成');
        let testResult = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                Magnitude: 2.5,
              },
              geometry: {
                type: 'Point',
                coordinates: [-121.07083, 36.08],
              },
            },
            {
              type: 'Feature',
              properties: {
                Magnitude: 5.7,
              },
              geometry: {
                type: 'Point',
                coordinates: [-121.57083, 36.28],
              },
            },
            {
              type: 'Feature',
              properties: {
                Magnitude: 7.7,
              },
              geometry: {
                type: 'Point',
                coordinates: [-121.87083, 36.68],
              },
            },
          ],
        };
        let point = new PointLayer()
          .source(testResult)
          .shape('circle')
          // .scale('Magnitude', {
          //   type: 'linear',
          // })
          .size('Magnitude', [50, 100])
          // .select({
          //   color: 'red',
          // })
          .color('Magnitude', ['#7ABCFF', '#FF00FF'])
          .style({
            opacity: 1,
            strokeWidth: 0,
            stroke: '#fff',
          });
        scene.addLayer(point);
        console.log('映射完成后的encodeFeature======>', point.getEncodedData());
      });
    });
  }
  public render() {
    return (
      <div
        id="map"
        className="map"
        style={{ width: '100%', height: '860px' }}
      />
    );
  }
}
