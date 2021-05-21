import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '@storybook/react/demo'; // 这里引入你想展示的组件
import BaseMap from './baseMap';
import Mapbox from './mapbox';
import test from '../src/index';
storiesOf('Geov', module).add(test, () => <BaseMap />);
storiesOf('Geov', module).add('地图兼容', () => <Mapbox />);
