import * as THREE from 'three';

/** A directional night sky with independently folding emission curtains. */
export function createAuroraNightSky(lowPower:boolean){
  const time={value:0};
  const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:false,
    uniforms:{uTime:time,uDetail:{value:lowPower?240:420}},
    vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`precision highp float;
      uniform float uTime;uniform float uDetail;varying vec3 vDirection;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
      float stars(vec2 p,float seed){vec2 i=floor(p),f=fract(p);float h=hash(i+seed);vec2 point=vec2(hash(i+2.3),hash(i+6.8));float radius=mix(.025,.07,pow(h,10.));return (1.-smoothstep(0.,radius,length(f-point)))*step(.965,h)*(.3+.7*h);}
      vec3 curtain(vec2 p,float shift,float strength){
        float t=uTime*.12;float x=p.x+shift;
        x+=.075*sin(x*4.2+t*.35)+.022*sin(x*13.-t*.23);
        float base=.105+.073*sin(x*4.3+t*.30)+.036*sin(x*11.1-t*.21);
        float h=p.y-base;
        float fine=noise(vec2((x+.016*sin(h*8.+x*9.-t*.1))*uDetail+t*.22,h*1.1));
        float bundle=noise(vec2(x*26.-t*.4,h*.7));
        float rays=pow(fine,2.3)*(.4+.6*bundle)*(.55+.45*noise(vec2(x*45.,h*11.+t*.1)));
        float rising=smoothstep(-.012,.022,h);
        float veil=rising*exp(-max(h,0.)*8.)*(1.-smoothstep(.12+bundle*.10,.36+bundle*.10,h));
        float hem=exp(-abs(h)*115.)*(.28+.72*bundle);
        vec3 green=vec3(.025,.48,.18),violet=vec3(.17,.045,.30);
        vec3 colour=mix(green,violet,smoothstep(.055,.25,h));
        float horizontal=1.-smoothstep(.75,1.5,abs(x-.12));
        return colour*(veil*(.06+1.5*rays)+hem*.42)*horizontal*strength;
      }
      void main(){
        vec3 d=normalize(vDirection);
        vec2 p=vec2(atan(dot(d,vec3(.834,0,.552)),dot(d,vec3(.552,0,-.834))),asin(clamp(d.y,-1.,1.)));
        vec3 sky=mix(vec3(.007,.017,.030),vec3(.001,.003,.012),smoothstep(-.03,.85,d.y));
        float haze=noise(p*vec2(3.,9.)+vec2(.2,0.))*noise(p*vec2(7.,15.));
        sky+=vec3(.002,.004,.008)*haze;
        float star=stars(p*vec2(560.,530.),.3)+stars(p*vec2(910.,830.),7.)*.35;
        sky+=vec3(.55,.70,.86)*star*smoothstep(.015,.25,d.y);
        vec3 glow=curtain(p,0.,.9)+curtain(p+vec2(0.,-.14),.65,.55);
        sky+=glow*smoothstep(.015,.11,d.y);
        gl_FragColor=vec4(sky,1.);
        #include <colorspace_fragment>
      }`});
  const root=new THREE.Mesh(new THREE.SphereGeometry(180,32,20),material);root.name='animated-aurora-sky';root.renderOrder=-10;
  return{root,update(t:number,camera:THREE.Camera){time.value=t;root.position.copy(camera.position);},dispose(){root.geometry.dispose();material.dispose();}};
}
