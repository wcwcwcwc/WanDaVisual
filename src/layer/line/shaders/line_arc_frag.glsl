#define LineTypeSolid 0.0
#define LineTypeDash 1.0
#define Animate 0.0

uniform float u_opacity;
uniform float u_blur : 0.9;
uniform float u_line_type: 0.0;
varying vec2 v_normal;
varying vec4 v_dash_array;
varying float v_distance_ratio;
varying vec4 v_color;

uniform float u_time;
uniform vec4 u_aimate: [ 0, 2., 1.0, 0.2 ];

#pragma include "picking"

void main() {
  gl_FragColor = v_color;
  // float blur = 1.- smoothstep(u_blur, 1., length(v_normal.xy));
  // float blur = smoothstep(1.0, u_blur, length(v_normal.xy));
  gl_FragColor.a *= u_opacity;
  if(u_line_type == LineTypeDash) {
   float flag = 0.;
    float dashLength = mod(v_distance_ratio, v_dash_array.x + v_dash_array.y + v_dash_array.z + v_dash_array.w);
    if(dashLength < v_dash_array.x || (dashLength > (v_dash_array.x + v_dash_array.y) && dashLength <  v_dash_array.x + v_dash_array.y + v_dash_array.z)) {
      flag = 1.;
    }
    gl_FragColor.a *=flag;
  }

  if(u_aimate.x == Animate) {
      float alpha =1.0 - fract( mod(1.0- v_distance_ratio, u_aimate.z)* (1.0/ u_aimate.z) + u_time / u_aimate.y);
      alpha = (alpha + u_aimate.w -1.0) / u_aimate.w;
      alpha = smoothstep(0., 1., alpha);
      gl_FragColor.a *= alpha;
  }
  //gl_FragColor = filterColor(gl_FragColor);
}
