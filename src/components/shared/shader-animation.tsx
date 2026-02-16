"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type ThreeVector2 = {
  x: number;
  y: number;
};

type ShaderUniforms = {
  time: { type: "f"; value: number };
  resolution: { type: "v2"; value: ThreeVector2 };
};

type ThreeApi = {
  Camera: new () => { position: { z: number } };
  Scene: new () => { add: (object: unknown) => void };
  PlaneBufferGeometry: new (width: number, height: number) => unknown;
  Vector2: new () => ThreeVector2;
  ShaderMaterial: new (options: {
    uniforms: ShaderUniforms;
    vertexShader: string;
    fragmentShader: string;
  }) => unknown;
  Mesh: new (geometry: unknown, material: unknown) => unknown;
  WebGLRenderer: new () => {
    domElement: HTMLCanvasElement;
    setPixelRatio: (value: number) => void;
    setSize: (width: number, height: number) => void;
    render: (scene: unknown, camera: unknown) => void;
    dispose: () => void;
  };
};

type ShaderScene = {
  camera: { position: { z: number } } | null;
  scene: { add: (object: unknown) => void } | null;
  renderer: {
    domElement: HTMLCanvasElement;
    setPixelRatio: (value: number) => void;
    setSize: (width: number, height: number) => void;
    render: (scene: unknown, camera: unknown) => void;
    dispose: () => void;
  } | null;
  uniforms: ShaderUniforms | null;
  animationId: number | null;
  onResize: (() => void) | null;
};

declare global {
  interface Window {
    THREE?: ThreeApi;
  }
}

const THREE_SCRIPT_ID = "threejs-cdn-r89";
const THREE_SCRIPT_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";

function createInitialSceneState(): ShaderScene {
  return {
    camera: null,
    scene: null,
    renderer: null,
    uniforms: null,
    animationId: null,
    onResize: null,
  };
}

export function ShaderAnimation({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ShaderScene>(createInitialSceneState());

  useEffect(() => {
    const container = containerRef.current;
    let isDisposed = false;
    let attachedScript: HTMLScriptElement | null = null;
    let scriptLoadHandler: (() => void) | null = null;

    const destroyScene = () => {
      const current = sceneRef.current;
      if (current.animationId !== null) {
        cancelAnimationFrame(current.animationId);
      }
      if (current.onResize) {
        window.removeEventListener("resize", current.onResize);
      }
      if (current.renderer) {
        current.renderer.dispose();
      }
      if (container) {
        container.innerHTML = "";
      }
      sceneRef.current = createInitialSceneState();
    };

    const initThreeJS = () => {
      if (isDisposed || !container || !window.THREE) {
        return;
      }

      const three = window.THREE;

      destroyScene();

      const camera = new three.Camera();
      camera.position.z = 1;

      const scene = new three.Scene();
      const geometry = new three.PlaneBufferGeometry(2, 2);

      const uniforms: ShaderUniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new three.Vector2() },
      };

      const vertexShader = `
        void main() {
          gl_Position = vec4( position, 1.0 );
        }
      `;

      const fragmentShader = `
        #define TWO_PI 6.2831853072
        #define PI 3.14159265359

        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        float random (in float x) {
          return fract(sin(x)*1e4);
        }
        float random (vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        varying vec2 vUv;

        void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

          vec2 fMosaicScal = vec2(4.0, 2.0);
          vec2 vScreenSize = vec2(256,256);
          uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
          uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

          float t = time*0.06+random(uv.x)*0.4;
          float lineWidth = 0.0008;

          vec3 color = vec3(0.0);
          for(int j = 0; j < 3; j++){
            for(int i=0; i < 5; i++){
              color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - length(uv));
            }
          }

          gl_FragColor = vec4(color[2],color[1],color[0],1.0);
        }
      `;

      const material = new three.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });

      const mesh = new three.Mesh(geometry, material);
      scene.add(mesh);

      const renderer = new three.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const onResize = () => {
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        uniforms.resolution.value.x = renderer.domElement.width;
        uniforms.resolution.value.y = renderer.domElement.height;
      };

      onResize();
      window.addEventListener("resize", onResize, false);

      const animate = () => {
        if (isDisposed) {
          return;
        }
        sceneRef.current.animationId = requestAnimationFrame(animate);
        uniforms.time.value += 0.05;
        renderer.render(scene, camera);
      };

      sceneRef.current = {
        camera,
        scene,
        renderer,
        uniforms,
        animationId: null,
        onResize,
      };

      animate();
    };

    if (window.THREE) {
      initThreeJS();
    } else {
      const existing = document.getElementById(THREE_SCRIPT_ID);
      scriptLoadHandler = () => initThreeJS();

      if (existing instanceof HTMLScriptElement) {
        attachedScript = existing;
        attachedScript.addEventListener("load", scriptLoadHandler, { once: true });
      } else {
        const script = document.createElement("script");
        script.id = THREE_SCRIPT_ID;
        script.src = THREE_SCRIPT_SRC;
        script.async = true;
        script.addEventListener("load", scriptLoadHandler, { once: true });
        document.head.appendChild(script);
        attachedScript = script;
      }
    }

    return () => {
      isDisposed = true;
      if (attachedScript && scriptLoadHandler) {
        attachedScript.removeEventListener("load", scriptLoadHandler);
      }
      const current = sceneRef.current;
      if (current.animationId !== null) {
        cancelAnimationFrame(current.animationId);
      }
      if (current.onResize) {
        window.removeEventListener("resize", current.onResize);
      }
      if (current.renderer) {
        current.renderer.dispose();
      }
      if (container) {
        container.innerHTML = "";
      }
      sceneRef.current = createInitialSceneState();
    };
  }, []);

  return <div ref={containerRef} className={cn("absolute inset-0 h-full w-full", className)} />;
}
