uniform float uTime;
uniform vec3 uColor;

varying vec3 vColor;

void main() {

  gl_FragColor = vec4(mix(vColor,uColor,0.6),(1. - smoothstep(0.,1.5,uTime)) * (1. - uColor.r * 0.3));
}