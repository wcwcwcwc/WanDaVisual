import * as React from 'react';
import mapboxgl from './assets/mapbox-gl';
import './assets/mapbox-gl.css';
import Scene from '../src/sence';
import { LineLayer } from '../src/layer';
export default class MapboxLine extends React.Component {
  public async componentDidMount() {
    mapboxgl.accessToken =
      'pk.eyJ1Ijoid2N3Y3djIiwiYSI6ImNrbmg0dmw2OTB4ZDIyb253ZDJuYXZlNG4ifQ.5vSMRe8A35mNhq7imipISg';
    let map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [117.24253235827246, 45.82851343781135], //地图中心经纬度
      zoom: 3.2, //缩放级别
      pitch: 59.5,
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
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [106.5234375, 57.51582286553883],
                  [136.40625, 61.77312286453146],
                ],
              },
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [106.5234375, 57.51582286553883],
                  [120.40625, 31.77312286453146],
                ],
              },
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [106.5234375, 57.51582286553883],
                  [128.40625, 38.77312286453146],
                ],
              },
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [106.5234375, 57.51582286553883],
                  [90.40625, 28.77312286453146],
                ],
              },
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [106.5234375, 57.51582286553883],
                  [102.40625, 52.77312286453146],
                ],
              },
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [106.5234375, 57.51582286553883],
                  [108.40625, 57.77312286453146],
                ],
              },
            },
          ],
        };
        const lineLayer = new LineLayer({
          blend: 'normal',
        })
          .source(testResult)
          .size(2)
          .shape('arc3d')
          // .select({
          //   color: 'red',
          // })
          // .active({
          //   color: 'red',
          // })
          .color('rgb(13,64,140)')
          .style({
            opacity: 1,
          });
        // .animate({
        //   interval: 0.8,
        //   trailLength: 0.8,
        // });
        scene.addLayer(lineLayer);
        // map.on('move', () => {
        //   console.log(map.getCenter(), map.getPitch());
        // });
        console.log(
          '映射完成后的encodeFeature======>',
          lineLayer.getEncodedData()
        );
      });
    });
  }
  public render() {
    return (
      <div
        id="map"
        className="map"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }
}
