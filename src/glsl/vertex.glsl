uniform float uProgress;
uniform float uSize;
uniform float uTime;
attribute vec3 color;

varying vec3 vColor;

void main() {

  vColor.rgb = color.rgb;
  vec3 progressPos = position * uProgress + 0.5 * vec3(0,-9.8,0) * uTime * uTime;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(progressPos,1.);

  gl_PointSize = 1. * uSize;
}