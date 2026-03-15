"use client"

import { type FC, useCallback, useEffect, useRef } from "react"
import { Mesh, Program, Renderer, Triangle, Vec3 } from "ogl"

import { cn } from "@/lib/utils"

interface VoiceOrbProps {
  className?: string
  hue?: number
  enableVoiceControl?: boolean
  voiceSensitivity?: number
  maxRotationSpeed?: number
  maxHoverIntensity?: number
  onVoiceDetected?: (detected: boolean) => void
}

const VERTEX_SHADER = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float hover;
  uniform float rot;
  uniform float hoverIntensity;
  uniform vec3 baseColor1;
  uniform vec3 baseColor2;
  uniform vec3 baseColor3;
  varying vec2 vUv;

  vec3 rgb2yiq(vec3 c) {
    float y = dot(c, vec3(0.299, 0.587, 0.114));
    float i = dot(c, vec3(0.596, -0.274, -0.322));
    float q = dot(c, vec3(0.211, -0.523, 0.312));
    return vec3(y, i, q);
  }

  vec3 yiq2rgb(vec3 c) {
    float r = c.x + 0.956 * c.y + 0.621 * c.z;
    float g = c.x - 0.272 * c.y - 0.647 * c.z;
    float b = c.x - 1.106 * c.y + 1.703 * c.z;
    return vec3(r, g, b);
  }

  vec3 adjustHue(vec3 color, float hueDeg) {
    float hueRad = hueDeg * 3.14159265 / 180.0;
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    float i = yiq.y * cosA - yiq.z * sinA;
    float q = yiq.y * sinA + yiq.z * cosA;
    yiq.y = i;
    yiq.z = q;
    return yiq2rgb(yiq);
  }

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(
      p3.x + p3.y,
      p3.x + p3.z,
      p3.y + p3.z
    ) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(
      dot(d0, d0),
      dot(d1, d1),
      dot(d2, d2),
      dot(d3, d3)
    ), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
  }

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r, colorIn.g), colorIn.b);
    return vec4(colorIn.rgb / (a + 1e-5), a);
  }

  const float innerRadius = 0.75;
  const float noiseScale = 0.65;

  float light1(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * attenuation);
  }

  float light2(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * dist * attenuation);
  }

  vec4 draw(vec2 uv) {
    vec3 color1 = adjustHue(baseColor1, hue);
    vec3 color2 = adjustHue(baseColor2, hue);
    vec3 color3 = adjustHue(baseColor3, hue);

    float ang = atan(uv.y, uv.x);
    float len = length(uv);
    float invLen = len > 0.0 ? 1.0 / len : 0.0;

    float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
    float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
    float d0 = distance(uv, (r0 * invLen) * uv);
    float v0 = light1(1.0, 10.0, d0);
    v0 *= smoothstep(r0 * 1.05, r0, len);
    float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

    float a = iTime * -1.0;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    float d = distance(uv, pos);
    float v1 = light2(1.5, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    vec3 col = mix(color1, color2, cl);
    col = mix(color3, col, v0);
    col = (col + v1) * v2 * v3;
    col = clamp(col, 0.0, 1.0);

    return extractAlpha(col);
  }

  vec4 mainImage(vec2 fragCoord) {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord - center) / size * 2.0;

    float angle = rot;
    float s = sin(angle);
    float c = cos(angle);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
    uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

    return draw(uv);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec4 col = mainImage(fragCoord);
    gl_FragColor = vec4(col.rgb * col.a, col.a);
  }
`

type RGB = [number, number, number]

function parseColorToRgb(value: string): RGB | null {
  if (typeof document === "undefined") {
    return null
  }

  const probe = document.createElement("span")
  probe.style.color = value
  probe.style.display = "none"
  document.body.appendChild(probe)
  const computedColor = getComputedStyle(probe).color
  probe.remove()

  const matches = computedColor.match(/rgba?\(([^)]+)\)/i)
  if (!matches?.[1]) {
    return null
  }

  const [r = 0, g = 0, b = 0] = matches[1]
    .split(",")
    .slice(0, 3)
    .map((channel) => Number.parseFloat(channel.trim()) / 255)

  return [r, g, b]
}

function getCssVariableColor(variableName: string, fallbackColor: string): RGB {
  if (typeof document === "undefined") {
    return [1, 1, 1]
  }

  const rootValue = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()

  return (
    parseColorToRgb(rootValue) ??
    parseColorToRgb(fallbackColor) ?? [1, 1, 1]
  )
}

function applyThemeColors(program: Program): void {
  const accent = getCssVariableColor("--accent", "rgb(255, 160, 64)")
  const chartOne = getCssVariableColor("--chart-1", "rgb(94, 156, 255)")
  const secondary = getCssVariableColor("--secondary", "rgb(40, 40, 46)")

  program.uniforms.baseColor1.value.set(accent[0], accent[1], accent[2])
  program.uniforms.baseColor2.value.set(chartOne[0], chartOne[1], chartOne[2])
  program.uniforms.baseColor3.value.set(secondary[0], secondary[1], secondary[2])
}

export const VoiceOrb: FC<VoiceOrbProps> = ({
  className,
  hue = 0,
  enableVoiceControl = true,
  voiceSensitivity = 1.5,
  maxRotationSpeed = 1.2,
  maxHoverIntensity = 0.8,
  onVoiceDetected,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const analyzeAudio = useCallback((): number => {
    if (!analyserRef.current || !dataArrayRef.current) {
      return 0
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)

    let sum = 0
    for (let index = 0; index < dataArrayRef.current.length; index += 1) {
      const value = dataArrayRef.current[index] / 255
      sum += value * value
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length)
    return Math.min(rms * voiceSensitivity * 3.0, 1)
  }, [voiceSensitivity])

  const stopMicrophone = useCallback(() => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }

      if (microphoneRef.current) {
        microphoneRef.current.disconnect()
        microphoneRef.current = null
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect()
        analyserRef.current = null
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close()
      }
      audioContextRef.current = null
      dataArrayRef.current = null
    } catch {
      // Ignore cleanup errors for best-effort teardown.
    }
  }, [])

  const initMicrophone = useCallback(async (): Promise<boolean> => {
    try {
      stopMicrophone()

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44_100,
        },
      })

      const AudioContextClass = window.AudioContext
      if (!AudioContextClass) {
        stream.getTracks().forEach((track) => track.stop())
        return false
      }

      mediaStreamRef.current = stream
      audioContextRef.current = new AudioContextClass()

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)

      analyserRef.current.fftSize = 512
      analyserRef.current.smoothingTimeConstant = 0.3
      analyserRef.current.minDecibels = -90
      analyserRef.current.maxDecibels = -10

      microphoneRef.current.connect(analyserRef.current)
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
      return true
    } catch {
      return false
    }
  }, [stopMicrophone])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let renderer: Renderer | null = null
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
    let rafId = 0
    let program: Program | null = null
    let disposeThemeObserver: (() => void) | undefined
    let isMicrophoneReady = false

    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        dpr: window.devicePixelRatio || 1,
      })

      gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      container.appendChild(gl.canvas)

      const geometry = new Triangle(gl)
      program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
          },
          hue: { value: hue },
          hover: { value: 0 },
          rot: { value: 0 },
          hoverIntensity: { value: 0 },
          baseColor1: { value: new Vec3(1, 0.65, 0.25) },
          baseColor2: { value: new Vec3(0.35, 0.6, 1.0) },
          baseColor3: { value: new Vec3(0.16, 0.16, 0.18) },
        },
      })

      applyThemeColors(program)

      const root = document.documentElement
      const themeObserver = new MutationObserver(() => {
        if (program) {
          applyThemeColors(program)
        }
      })
      themeObserver.observe(root, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme"],
      })
      disposeThemeObserver = () => themeObserver.disconnect()

      const mesh = new Mesh(gl, { geometry, program })

      const resize = () => {
        if (!container || !renderer || !gl || !program) {
          return
        }

        const dpr = window.devicePixelRatio || 1
        const width = container.clientWidth
        const height = container.clientHeight
        if (width === 0 || height === 0) {
          return
        }

        renderer.setSize(width * dpr, height * dpr)
        gl.canvas.style.width = `${width}px`
        gl.canvas.style.height = `${height}px`
        program.uniforms.iResolution.value.set(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        )
      }

      window.addEventListener("resize", resize)
      resize()

      if (enableVoiceControl) {
        void initMicrophone().then((success) => {
          isMicrophoneReady = success
        })
      } else {
        stopMicrophone()
      }

      let lastTime = 0
      let currentRotation = 0
      const baseRotationSpeed = 0.3

      const update = (time: number) => {
        rafId = window.requestAnimationFrame(update)
        if (!program || !renderer || !gl) {
          return
        }

        const delta = (time - lastTime) * 0.001
        lastTime = time
        program.uniforms.iTime.value = time * 0.001
        program.uniforms.hue.value = hue

        if (enableVoiceControl && isMicrophoneReady) {
          const voiceLevel = analyzeAudio()
          onVoiceDetected?.(voiceLevel > 0.1)

          const rotationSpeed = baseRotationSpeed + voiceLevel * maxRotationSpeed * 2.0
          if (voiceLevel > 0.05) {
            currentRotation += delta * rotationSpeed
          }

          program.uniforms.hover.value = Math.min(voiceLevel * 2.0, 1)
          program.uniforms.hoverIntensity.value = Math.min(
            voiceLevel * maxHoverIntensity * 0.8,
            maxHoverIntensity,
          )
        } else {
          onVoiceDetected?.(false)
          program.uniforms.hover.value = 0
          program.uniforms.hoverIntensity.value = 0
        }

        program.uniforms.rot.value = currentRotation
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        renderer.render({ scene: mesh })
      }

      rafId = window.requestAnimationFrame(update)

      return () => {
        window.cancelAnimationFrame(rafId)
        window.removeEventListener("resize", resize)
        disposeThemeObserver?.()
        stopMicrophone()

        if (container && gl?.canvas && container.contains(gl.canvas)) {
          container.removeChild(gl.canvas)
        }

        gl?.getExtension("WEBGL_lose_context")?.loseContext()
      }
    } catch {
      stopMicrophone()
      disposeThemeObserver?.()
      return
    }
  }, [
    analyzeAudio,
    enableVoiceControl,
    hue,
    initMicrophone,
    maxHoverIntensity,
    maxRotationSpeed,
    onVoiceDetected,
    stopMicrophone,
    voiceSensitivity,
  ])

  return <div ref={containerRef} className={cn("relative h-full w-full", className)} />
}
