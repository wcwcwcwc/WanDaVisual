# WanDaVisual



1.定义外部`mapbox`实例

```
const map = new mapboxgl.Map({
container: 'map', // container id
style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
center: [-74.5, 40], // starting position [lng, lat]
zoom: 9, // starting zoom
});

```

2.配置地图参数

```
let mapConfig={
map,
mapType:'mapbox'
}
```

3.定义`GeoV`场景，参数传入`mapConfig`

```
let sence=new GeoV.sence(mapConfig)
```

4.定义可视化对象（pointLayer,lineLayer,polygonLayer,heatmapLayer）

```
let bubble=new GeoV.pointLayer()
.setData()
.shape('circle')
.color()
.style()
.animate()
```

5.场景加载可视化对象

```
sence.addLayer(bubble)
```

### 为什么需要一个场景？

1.更好的做地图之间的兼容，未来可做如 openlayer、高德地图的兼容

2.全局初始一次依赖注入

3.共享 canvas，即生成的 canvas 只允许一次

4.绑定地图实例一次即可，不然每次定义可视化类，都得传入地图实例，可以参考 mapv，代码不优雅简洁

### 地图配置为什么需要传入`mapType`?

其实不传`mapType`也可以，利用 `instanceof` 也能拿到地图类，从而判断传进来的地图是 mapbox，还是 openLayer，
加入 mapType，更加强制性限制用户传入。



### 设计模式

依赖注入

### WebGL渲染引擎

regl.GL

### 文档编写、开发环境

采用`storybook`的方式；

后续示例中心，包括对外的 Api 文档、示例代码都可以用 storybook 打包的方式迁出去

