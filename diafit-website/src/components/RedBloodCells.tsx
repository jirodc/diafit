"use client";

/**
 * Red blood cells background – adapted from Ballpit by Kevin Levron
 * https://x.com/soju22/status/1858925191671271801
 */

import React, { useRef, useEffect } from "react";
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  type WebGLRendererParameters,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

interface XConfig {
  canvas?: HTMLCanvasElement;
  id?: string;
  rendererOptions?: Partial<WebGLRendererParameters>;
  size?: "parent" | { width: number; height: number };
}

interface SizeData {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

class X {
  #config: XConfig;
  #resizeObserver?: ResizeObserver;
  #intersectionObserver?: IntersectionObserver;
  #resizeTimer?: number;
  #animationFrameId = 0;
  #clock = new Clock();
  #animationState = { elapsed: 0, delta: 0 };
  #isVisible = false;

  canvas!: HTMLCanvasElement;
  camera!: PerspectiveCamera;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov!: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene!: Scene;
  renderer!: WebGLRenderer;
  size: SizeData = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0,
  };

  render = this.#render.bind(this);
  onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {};
  onAfterRender: (state: { elapsed: number; delta: number }) => void = () => {};
  onAfterResize: (size: SizeData) => void = () => {};
  isDisposed = false;

  constructor(config: XConfig) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }

  #initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  #initScene() {
    this.scene = new Scene();
  }

  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      const elem = document.getElementById(this.#config.id);
      if (elem instanceof HTMLCanvasElement) this.canvas = elem;
    }
    if (!this.canvas) throw new Error("RedBloodCells: Missing canvas");
    this.canvas.style.display = "block";
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      alpha: true,
      ...this.#config.rendererOptions,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
  }

  #initObservers() {
    if (this.#config.size !== "parent") {
      window.addEventListener("resize", this.#onResize.bind(this));
    } else if (this.canvas.parentNode) {
      this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
      this.#resizeObserver.observe(this.canvas.parentNode as Element);
    }
    this.#intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !this.#isVisible) this.#startAnimation();
        if (!visible && this.#isVisible) this.#stopAnimation();
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    this.#intersectionObserver.observe(this.canvas);
  }

  #onResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100) as unknown as number;
  }

  resize() {
    let w: number, h: number;
    if (this.#config.size && typeof this.#config.size === "object") {
      w = this.#config.size.width;
      h = this.#config.size.height;
    } else if (this.#config.size === "parent" && this.canvas.parentNode) {
      w = (this.canvas.parentNode as HTMLElement).offsetWidth;
      h = (this.canvas.parentNode as HTMLElement).offsetHeight;
    } else {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    this.size.width = w;
    this.size.height = h;
    this.size.ratio = w / h;
    this.camera.aspect = this.size.ratio;
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
    this.renderer.setSize(w, h);
    const pr = Math.min(window.devicePixelRatio ?? 2, 2);
    this.renderer.setPixelRatio(pr);
    this.size.pixelRatio = pr;
    this.onAfterResize(this.size);
  }

  updateWorldSize() {
    const fovRad = (this.camera.fov * Math.PI) / 180;
    this.size.wHeight = 2 * Math.tan(fovRad / 2) * Math.abs(this.camera.position.z);
    this.size.wWidth = this.size.wHeight * this.camera.aspect;
  }

  #startAnimation() {
    this.#isVisible = true;
    this.#clock.start();
    const loop = () => {
      this.#animationFrameId = requestAnimationFrame(loop);
      this.#animationState.delta = this.#clock.getDelta();
      this.#animationState.elapsed += this.#animationState.delta;
      this.onBeforeRender(this.#animationState);
      this.render();
      this.onAfterRender(this.#animationState);
    };
    loop();
  }

  #stopAnimation() {
    cancelAnimationFrame(this.#animationFrameId);
    this.#isVisible = false;
    this.#clock.stop();
  }

  #render() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.clear();
  }

  dispose() {
    this.#stopAnimation();
    this.clear();
    this.renderer.dispose();
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    this.isDisposed = true;
  }
}

interface WConfig {
  count: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  maxSize: number;
  minSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  controlSphere0?: boolean;
  followCursor?: boolean;
}

class W {
  config: WConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: Vector3 = new Vector3();

  constructor(config: WConfig) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.#initializePositions();
    this.setSizes();
  }

  #initializePositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i;
      positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
      positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
      positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
    }
  }

  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIdx = 0;
    if (config.controlSphere0) {
      startIdx = 1;
      const firstVec = new Vector3().fromArray(positionData, 0);
      firstVec.lerp(center, 0.1).toArray(positionData, 0);
      new Vector3(0, 0, 0).toArray(velocityData, 0);
    }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      const pos = new Vector3().fromArray(positionData, base);
      const vel = new Vector3().fromArray(velocityData, base);
      vel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
      vel.multiplyScalar(config.friction);
      vel.clampLength(0, config.maxVelocity);
      pos.add(vel);
      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      const pos = new Vector3().fromArray(positionData, base);
      const vel = new Vector3().fromArray(velocityData, base);
      const radius = sizeData[idx];
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        const otherPos = new Vector3().fromArray(positionData, otherBase);
        const otherVel = new Vector3().fromArray(velocityData, otherBase);
        const diff = new Vector3().copy(otherPos).sub(pos);
        const dist = diff.length();
        const sumRadius = radius + sizeData[jdx];
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          const correction = diff.normalize().multiplyScalar(0.5 * overlap);
          const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 1));
          pos.sub(correction);
          vel.sub(velCorrection);
          pos.toArray(positionData, base);
          vel.toArray(velocityData, base);
          otherPos.add(correction);
          otherVel.add(correction.clone().multiplyScalar(Math.max(otherVel.length(), 1)));
          otherPos.toArray(positionData, otherBase);
          otherVel.toArray(velocityData, otherBase);
        }
      }
      if (config.controlSphere0) {
        const diff = new Vector3().fromArray(positionData, 0).sub(pos);
        const d = diff.length();
        const sumRadius0 = radius + sizeData[0];
        if (d < sumRadius0) {
          const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
          vel.sub(correction.clone().multiplyScalar(Math.max(vel.length(), 2)));
          pos.sub(correction);
        }
      }
      if (Math.abs(pos.x) + radius > config.maxX) {
        pos.x = Math.sign(pos.x) * (config.maxX - radius);
        vel.x = -vel.x * config.wallBounce;
      }
      if (pos.y - radius < -config.maxY) {
        pos.y = -config.maxY + radius;
        vel.y = -vel.y * config.wallBounce;
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(pos.z) + radius > maxBoundary) {
        pos.z = Math.sign(pos.z) * (maxBoundary - radius);
        vel.z = -vel.z * config.wallBounce;
      }
      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }
  }
}

function saturate(x: number) {
  return Math.max(0, Math.min(1, x));
}

class BloodCellMaterial extends MeshPhysicalMaterial {
  uniforms: Record<string, { value: number }> = {
    thicknessDistortion: { value: 0.1 },
    thicknessAmbient: { value: 0 },
    thicknessAttenuation: { value: 0.1 },
    thicknessPower: { value: 2 },
    thicknessScale: { value: 10 },
  };

  constructor(params: Record<string, unknown>) {
    super(params);
    this.defines = { USE_UV: "" };
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }
        void main() {
        `
      );
      const chunk = ShaderChunk.lights_fragment_begin.replaceAll(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_begin>", chunk);
    };
  }
}

const U = new Object3D();

const defaultConfig = {
  count: 120,
  colors: [0x8b0000, 0xb22222, 0xdc143c, 0xa52a2a],
  ambientColor: 0x330a0a,
  ambientIntensity: 0.6,
  lightIntensity: 80,
  materialParams: {
    metalness: 0.15,
    roughness: 0.6,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    color: 0x8b0000,
  },
  minSize: 0.35,
  maxSize: 0.7,
  size0: 0.5,
  gravity: 0.012,
  friction: 0.998,
  wallBounce: 0.92,
  maxVelocity: 0.08,
  maxX: 8,
  maxY: 8,
  maxZ: 3,
  controlSphere0: false,
  followCursor: false,
};

class BloodCellsMesh extends InstancedMesh {
  config: typeof defaultConfig;
  physics: W;
  ambientLight!: AmbientLight;
  light!: PointLight;

  constructor(renderer: WebGLRenderer, params: Partial<typeof defaultConfig> = {}) {
    const config = { ...defaultConfig, ...params };
    const roomEnv = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(roomEnv).texture;
    const geometry = new SphereGeometry(1, 32, 32);
    const material = new BloodCellMaterial({
      envMap: envTexture,
      ...config.materialParams,
    });
    (material as MeshPhysicalMaterial).envMapIntensity = 0.4;
    super(geometry, material, config.count);
    this.config = config;
    this.physics = new W(config);
    this.#setupLights();
    this.setColors(config.colors);
  }

  #setupLights() {
    this.ambientLight = new AmbientLight(
      this.config.ambientColor,
      this.config.ambientIntensity
    );
    this.add(this.ambientLight);
    const firstColor = new Color(
      Array.isArray(this.config.colors) ? this.config.colors[0] : 0x8b0000
    );
    this.light = new PointLight(firstColor, this.config.lightIntensity);
    this.add(this.light);
  }

  setColors(colors: number[]) {
    if (!Array.isArray(colors) || colors.length < 1) return;
    const colorObjects = colors.map((c) => new Color(c));
    const getColorAt = (ratio: number, out = new Color()) => {
      const clamped = Math.max(0, Math.min(1, ratio));
      const scaled = clamped * (colors.length - 1);
      const idx = Math.floor(scaled);
      const start = colorObjects[idx];
      if (idx >= colors.length - 1) return start.clone();
      const alpha = scaled - idx;
      const end = colorObjects[idx + 1];
      out.r = start.r + alpha * (end.r - start.r);
      out.g = start.g + alpha * (end.g - start.g);
      out.b = start.b + alpha * (end.b - start.b);
      return out;
    };
    for (let idx = 0; idx < this.count; idx++) {
      this.setColorAt(idx, getColorAt(idx / this.count));
      if (idx === 0) this.light.color.copy(getColorAt(0));
    }
    if (this.instanceColor) this.instanceColor.needsUpdate = true;
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo);
    for (let idx = 0; idx < this.count; idx++) {
      U.position.fromArray(this.physics.positionData, 3 * idx);
      U.scale.setScalar(this.physics.sizeData[idx]);
      U.updateMatrix();
      this.setMatrixAt(idx, U.matrix);
      if (idx === 0) this.light.position.copy(U.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

interface RedBloodCellsProps {
  className?: string;
  count?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  followCursor?: boolean;
}

export default function RedBloodCells({
  className = "",
  count = 120,
  gravity = 0.012,
  friction = 0.998,
  wallBounce = 0.92,
  followCursor = false,
}: RedBloodCellsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<X | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const three = new X({
      canvas,
      size: "parent",
      rendererOptions: { antialias: true, alpha: true },
    });

    three.renderer.toneMapping = ACESFilmicToneMapping;
    three.renderer.toneMappingExposure = 0.9;
    three.camera.position.set(0, 0, 18);
    three.camera.lookAt(0, 0, 0);
    three.resize();

    let spheres: BloodCellsMesh;
    const init = () => {
      if (spheres) {
        three.clear();
        three.scene.remove(spheres);
      }
      spheres = new BloodCellsMesh(three.renderer, {
        count,
        gravity,
        friction,
        wallBounce,
        followCursor,
      });
      three.scene.add(spheres);
    };

    init();
    three.onBeforeRender = (deltaInfo) => spheres.update(deltaInfo);
    three.onAfterResize = (size) => {
      spheres.config.maxX = size.wWidth / 2;
      spheres.config.maxY = size.wHeight / 2;
    };

    instanceRef.current = three;

    return () => {
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, [count, gravity, friction, wallBounce, followCursor]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full ${className}`}
      style={{ touchAction: "none", userSelect: "none" }}
    />
  );
}
