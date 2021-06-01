import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '@storybook/react/demo'; // 这里引入你想展示的组件
import BaseMap from './baseMap';
import Mapbox from './point';
import test from '../src/index';
import MapboxPointAnimate from './pointAnimate';
import MapboxLine from './line';
import MapboxLineAnimate from './lineAnimate';
storiesOf('Geov', module).add(test, () => <BaseMap />);
storiesOf('Geov', module).add('点图层', () => <Mapbox />);
storiesOf('Geov', module).add('点图层动画', () => <MapboxPointAnimate />);
storiesOf('Geov', module).add('线图层', () => <MapboxLine />);
storiesOf('Geov', module).add('线图层动画', () => <MapboxLineAnimate />);
