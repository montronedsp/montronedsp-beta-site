/**
 * Visual & Game Audio hero: a small, atmospheric Three.js scene.
 * Reinterprets CynicViz's layered noise field and drifting particles.
 * Decorative only: no microphone access, audio capture, or synthetic level meters.
 */
(function () {
  'use strict';

  const host = document.querySelector('[data-vga-scene]');
  if (!host || !('matchMedia' in window)) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(max-width: 700px)');
  let instance = null;
  let initializing = false;
  let visible = false;

  function dispose() {
    if (!instance) return;
    instance.dispose();
    instance = null;
    host.classList.remove('vga-art--webgl');
  }

  function allowed() {
    return visible && !document.hidden && !motion.matches && host.isConnected;
  }

  async function ensureScene() {
    if (!allowed() || initializing || instance) return;
    initializing = true;
    try {
      const THREE = await import('./vendor/three-r161.module.min.js');
      if (!allowed()) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'vga-art__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();

      // Two displaced color fields: broad, low-contrast and intentionally asymmetric.
      const fieldMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uAspect: { value: 2.7 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }`,
        fragmentShader: `
          precision mediump float;
          varying vec2 vUv;
          uniform float uTime;
          uniform float uAspect;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                       mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
          }
          float fbm(vec2 p) {
            float n=0., a=.5;
            for (int i=0; i<4; i++) {
              n+=a*noise(p);
              p=p*2.04+vec2(2.13,1.73);
              a*=.5;
            }
            return n;
          }
          void main() {
            vec2 uv=vUv;
            vec2 p=vec2(uv.x*uAspect, uv.y);
            float time=uTime*.028;
            vec2 drift=vec2(time,-time*.43);
            float flow=fbm(p*1.65+drift);
            float folds=fbm(p*3.1+vec2(flow*.9,-flow*.45)+drift*.47);
            vec2 a=vec2(uAspect*.72,.66), b=vec2(uAspect*.23,.37);
            float d1=length((p-a)*vec2(.66,1.5));
            float d2=length((p-b)*vec2(.5,1.9));
            float cloud1=exp(-d1*d1*1.25)*(0.25+0.75*flow);
            float cloud2=exp(-d2*d2*1.9)*(0.2+0.8*folds);
            float veil=smoothstep(.35,.78,folds)*.1;
            vec3 teal=vec3(.10,.63,.53);
            vec3 violet=vec3(.26,.16,.51);
            vec3 mist=vec3(.57,.83,.71);
            vec3 color=teal*cloud1*.52+violet*cloud2*.44+mist*veil;
            float highlight=pow(max(0.,1.-d1*.57),3.)*pow(folds,4.);
            color+=mist*highlight*.18;
            float vignette=smoothstep(1.25,.22,length((uv-.5)*vec2(1.55,1.)));
            gl_FragColor=vec4(color*vignette,.94);
          }`
      });

      const fieldGeometry = new THREE.PlaneGeometry(2, 2);
      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      scene.add(field);

      const count = coarse.matches ? 90 : 170;
      const positions = new Float32Array(count * 3);
      const phases = new Float32Array(count);
      const sizes = new Float32Array(count);
      // Reproducible distribution: avoid random visual jumps on page reload.
      let seed = 0x0c71c;
      function rand() {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      for (let i = 0; i < count; i++) {
        positions[i*3] = rand()*2-1;
        positions[i*3+1] = rand()*2-1;
        positions[i*3+2] = 0;
        phases[i] = rand()*6.28318;
        sizes[i] = .7+rand()*1.7;
      }
      const pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
      pointGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      const particleMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.5) } },
        vertexShader: `
          attribute float aPhase;
          attribute float aSize;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vOpacity;
          void main() {
            vec3 p=position;
            p.x+=sin(uTime*.13+aPhase)*.012;
            p.y+=cos(uTime*.2+aPhase)*.025;
            vOpacity=.3+.24*sin(uTime*.4+aPhase);
            gl_PointSize=aSize*uPixelRatio*2.5;
            gl_Position=vec4(p,1.);
          }`,
        fragmentShader: `
          precision mediump float;
          varying float vOpacity;
          void main() {
            vec2 p=gl_PointCoord-.5;
            float a=exp(-dot(p,p)*18.)*vOpacity;
            gl_FragColor=vec4(.55,.96,.80,a);
          }`
      });
      const points = new THREE.Points(pointGeometry, particleMaterial);
      scene.add(points);

      let raf=0;
      let last=0;
      const start=performance.now();
      let stopped=false;

      function resize() {
        const rect=host.getBoundingClientRect();
        if (rect.width<1 || rect.height<1) return;
        renderer.setSize(Math.ceil(rect.width),Math.ceil(rect.height),false);
        fieldMaterial.uniforms.uAspect.value=rect.width/rect.height;
      }
      function frame(now) {
        raf=0;
        if (stopped || !allowed()) return;
        if (now-last>=33) {
          const seconds=(now-start)*.001;
          fieldMaterial.uniforms.uTime.value=seconds;
          particleMaterial.uniforms.uTime.value=seconds;
          renderer.render(scene,camera);
          last=now;
        }
        raf=requestAnimationFrame(frame);
      }
      const observer='ResizeObserver' in window ? new ResizeObserver(resize) : null;
      const onWindowResize=()=>resize();
      const onLost=(event)=>{event.preventDefault();dispose();};
      canvas.addEventListener('webglcontextlost',onLost);
      host.insertBefore(canvas,host.firstChild);
      resize();
      instance={
        start:()=>{if(!raf && !stopped){last=0;raf=requestAnimationFrame(frame);}},
        stop:()=>{if(raf)cancelAnimationFrame(raf);raf=0;},
        dispose:()=>{
          if(stopped)return;
          stopped=true;
          if(raf)cancelAnimationFrame(raf);
          if(observer)observer.disconnect();
          else window.removeEventListener('resize',onWindowResize);
          canvas.removeEventListener('webglcontextlost',onLost);
          scene.remove(field,points);
          fieldGeometry.dispose();
          fieldMaterial.dispose();
          pointGeometry.dispose();
          particleMaterial.dispose();
          renderer.dispose();
          canvas.remove();
        }
      };
      if(observer)observer.observe(host);
      else window.addEventListener('resize',onWindowResize,{passive:true});
      host.classList.add('vga-art--webgl');
      instance.start();
    } catch (error) {
      // The CSS composition is a deliberate static fallback.
      console.warn('Visual scene unavailable; retaining static artwork.',error);
      dispose();
    } finally {
      initializing=false;
    }
  }

  function sync() {
    if (allowed()) {
      if(instance)instance.start();
      else ensureScene();
    } else {
      if(instance)instance.stop();
      if(motion.matches)dispose();
    }
  }
  const intersection='IntersectionObserver' in window
    ? new IntersectionObserver((entries)=>{visible=!!entries[0]?.isIntersecting;sync();},{rootMargin:'120px'})
    : null;
  if(intersection)intersection.observe(host);
  else {visible=true;sync();}
  document.addEventListener('visibilitychange',sync);
  if(motion.addEventListener)motion.addEventListener('change',sync);
  else if(motion.addListener)motion.addListener(sync);
  // Let the browser retire all resources on navigation; no global animation loop remains.
})();
