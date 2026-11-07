/* Fundo do topo em GPU (WebGL): aurora azul em ruído fractal.
   Renderiza em baixa resolução, pausa fora da tela e respeita "reduzir movimento". */
(() => {
  'use strict';
  const cv = document.querySelector('canvas.shader');
  if (!cv) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gl;
  try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) {}
  if (!gl) return;

  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.03;a*=.5;}return v;}
void main(){
vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
float tt=t*.045;
vec2 q=vec2(fbm(p*1.3+vec2(0.,tt)),fbm(p*1.3+vec2(5.2,-tt)));
vec2 w=vec2(fbm(p*1.5+3.*q+vec2(1.7,9.2)+tt*.8+m*.12),fbm(p*1.5+3.*q+vec2(8.3,2.8)-tt*.6));
float f=fbm(p*1.15+3.4*w);
vec2 c=vec2(k,-.42)+m*.06;
float d=length((p-c)*vec2(.85,1.));
float glow=smoothstep(1.35,0.,d);
float band=smoothstep(.38,.98,f)*glow;
vec3 col=vec3(.002,.004,.016);
col=mix(col,vec3(.07,.2,.9)*.6,band);
col=mix(col,vec3(.1,.8,1.)*.8,pow(band,3.2));
col+=vec3(.086,.275,1.)*.1*glow*glow;
col*=smoothstep(1.5,.15,length(p*vec2(.75,1.05)));
col+=(h(gl_FragCoord.xy+fract(t*7.))-.5)*.03;
gl_FragColor=vec4(col,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  const pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm'), uK = gl.getUniformLocation(pr, 'k');

  const SCALE = 0.5;
  let w = 0, h = 0;
  const size = () => {
    const nw = Math.max(1, Math.round(cv.clientWidth * SCALE)), nh = Math.max(1, Math.round(cv.clientHeight * SCALE));
    if (nw === w && nh === h) return;
    w = nw; h = nh; cv.width = w; cv.height = h; gl.viewport(0, 0, w, h);
  };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });
  const t0 = performance.now() - 20000;
  const draw = now => {
    size();
    mouse.x += (mouse.tx - mouse.x) * 0.03; mouse.y += (mouse.ty - mouse.y) * 0.03;
    gl.uniform2f(uR, w, h);
    gl.uniform1f(uT, (now - t0) / 1000);
    gl.uniform2f(uM, mouse.x, mouse.y);
    gl.uniform1f(uK, innerWidth < 980 ? 0.0 : 0.55);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  let visible = true, raf = 0, last = 0;
  const loop = now => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (now - last > 30) { draw(now); last = now; }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && !RM) raf = requestAnimationFrame(loop); };
  draw(performance.now());
  requestAnimationFrame(() => cv.classList.add('on'));
  if (RM) { addEventListener('resize', () => draw(performance.now())); return; }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(cv);
  document.addEventListener('visibilitychange', start);
  start();
})();
