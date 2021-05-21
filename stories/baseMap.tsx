import * as React from 'react';
import mapboxgl from './assets/mapbox-gl';
import './assets/mapbox-gl.css';
export default class BaseMap extends React.Component {
  public async componentDidMount() {
    mapboxgl.accessToken =
      'pk.eyJ1Ijoid2N3Y3djIiwiYSI6ImNrbmg0dmw2OTB4ZDIyb253ZDJuYXZlNG4ifQ.5vSMRe8A35mNhq7imipISg';
    new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [120.6584389547279, 31.292601214089288], //地图中心经纬度
      zoom: 10, //缩放级别
      container: 'map',
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
