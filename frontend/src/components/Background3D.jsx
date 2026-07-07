import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const EARTH_POINTS = 1600;
const STAR_POINTS = 600;

// Color Constants for interpolation
const cSpace1 = new THREE.Color("#020617");
const cSpace2 = new THREE.Color("#090d16");

const cSunrise1 = new THREE.Color("#0c0a09");
const cSunrise2 = new THREE.Color("#7c2d12");

const cDay1 = new THREE.Color("#0284c7"); // Deep sky blue
const cDay2 = new THREE.Color("#bae6fd"); // Light blue sky

const cSunset1 = new THREE.Color("#451a03"); // Dark wood
const cSunset2 = new THREE.Color("#b91c1c"); // Crimson sunset

const cNight1 = new THREE.Color("#020617");
const cNight2 = new THREE.Color("#030712");

function getInterpolatedColors(ratio) {
  const color1 = new THREE.Color();
  const color2 = new THREE.Color();

  if (ratio < 0.22) {
    // Space to Sunrise
    const t = ratio / 0.22;
    color1.lerpColors(cSpace1, cSunrise1, t);
    color2.lerpColors(cSpace2, cSunrise2, t);
  } else if (ratio < 0.45) {
    // Sunrise to Day
    const t = (ratio - 0.22) / 0.23;
    color1.lerpColors(cSunrise1, cDay1, t);
    color2.lerpColors(cSunrise2, cDay2, t);
  } else if (ratio < 0.70) {
    // Day to Sunset
    const t = (ratio - 0.45) / 0.25;
    color1.lerpColors(cDay1, cSunset1, t);
    color2.lerpColors(cDay2, cSunset2, t);
  } else if (ratio < 0.88) {
    // Sunset to Night
    const t = (ratio - 0.70) / 0.18;
    color1.lerpColors(cSunset1, cNight1, t);
    color2.lerpColors(cSunset2, cNight2, t);
  } else {
    // Night to Space
    const t = (ratio - 0.88) / 0.12;
    color1.lerpColors(cNight1, cSpace1, t);
    color2.lerpColors(cNight2, cSpace2, t);
  }

  return `radial-gradient(circle at 50% 50%, ${color1.getStyle()} 0%, ${color2.getStyle()} 100%)`;
}

function CinematicScene({ scrollRatio }) {
  const earthRef = useRef();
  const sunRef = useRef();
  const sparkRef = useRef();
  const starsRef = useRef();

  // 1. Generate Earth City Lights Sphere
  const earthPositions = useMemo(() => {
    const arr = new Float32Array(EARTH_POINTS * 3);
    for (let i = 0; i < EARTH_POINTS; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 0.1; // Spherical surface
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  // 2. Generate Starfield
  const starPositions = useMemo(() => {
    const arr = new Float32Array(STAR_POINTS * 3);
    for (let i = 0; i < STAR_POINTS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 10 + Math.random() * 5; // Far field
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // --- Earth Globe Controls ---
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.05;
      earthRef.current.rotation.x = time * 0.01;

      // Earth is visible at start (ratio=0) and zooms in/fades out as we scroll to 0.25
      // Earth returns at end (ratio > 0.85) zooming back out to normal scale
      let scale = 1.0;
      let opacity = 0.0;

      if (scrollRatio < 0.28) {
        const t = scrollRatio / 0.28; // 0 to 1
        scale = 1.0 + t * 2.5; // Zoom in
        opacity = THREE.MathUtils.lerp(0.75, 0.0, t);
      } else if (scrollRatio > 0.85) {
        const t = (scrollRatio - 0.85) / 0.15; // 0 to 1
        scale = 3.5 - t * 2.5; // Zoom out
        opacity = THREE.MathUtils.lerp(0.0, 0.75, t);
      }

      earthRef.current.scale.setScalar(scale);
      earthRef.current.material.opacity = opacity;
    }

    // --- Sun Controls ---
    if (sunRef.current) {
      // Sun rises from Sunrise to Day, and sets from Day to Sunset
      let y = -5;
      let opacity = 0.0;
      let scale = 0.0;

      if (scrollRatio >= 0.12 && scrollRatio <= 0.82) {
        // Active range
        if (scrollRatio < 0.45) {
          // Rising
          const t = (scrollRatio - 0.12) / 0.33;
          y = THREE.MathUtils.lerp(-4.0, 3.5, t);
          opacity = THREE.MathUtils.lerp(0.0, 1.0, t);
          scale = THREE.MathUtils.lerp(0.2, 0.9, t);
        } else {
          // Setting
          const t = (scrollRatio - 0.45) / 0.37;
          y = THREE.MathUtils.lerp(3.5, -4.0, t);
          opacity = THREE.MathUtils.lerp(1.0, 0.0, t);
          scale = THREE.MathUtils.lerp(0.9, 0.1, t);
        }
      }

      sunRef.current.position.set(0.0, y, -2.5); // position in background
      sunRef.current.scale.setScalar(scale);
      sunRef.current.material.opacity = opacity;
    }

    // --- Single Cabin Spark (Night) ---
    if (sparkRef.current) {
      let opacity = 0.0;
      if (scrollRatio >= 0.75 && scrollRatio <= 0.92) {
        if (scrollRatio < 0.84) {
          // Fade in
          opacity = (scrollRatio - 0.75) / 0.09;
        } else {
          // Fade out
          opacity = 1.0 - (scrollRatio - 0.84) / 0.08;
        }
      }
      
      // Pulse animation
      const pulseSize = 0.22 + Math.sin(time * 6.0) * 0.08;
      sparkRef.current.scale.setScalar(pulseSize);
      sparkRef.current.material.opacity = opacity;
    }

    // --- Background Stars Controls ---
    if (starsRef.current) {
      starsRef.current.rotation.y = time * 0.008;

      // Stars fade during bright Day section
      let opacity = 0.8;
      if (scrollRatio > 0.22 && scrollRatio < 0.78) {
        // Mid day range
        if (scrollRatio < 0.45) {
          opacity = THREE.MathUtils.lerp(0.8, 0.05, (scrollRatio - 0.22) / 0.23);
        } else {
          opacity = THREE.MathUtils.lerp(0.05, 0.8, (scrollRatio - 0.45) / 0.33);
        }
      }
      starsRef.current.material.opacity = opacity;
    }
  });

  return (
    <group>
      {/* 1. Earth Globe points */}
      <points ref={earthRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[earthPositions, 3]}
            count={EARTH_POINTS}
            array={earthPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#60a5fa"
          size={0.045}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Rising/Setting Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent={true}
          opacity={0.0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Single Cabin Spark (Night Indicator) */}
      <mesh ref={sparkRef} position={[0, -0.4, 1.5]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent={true}
          opacity={0.0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Background Starfield */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
            count={STAR_POINTS}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.03}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function Background3D() {
  const [scrollRatio, setScrollRatio] = useState(0);

  // Read scroll ratio dynamically
  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollRatio(Math.min(1, Math.max(0, scrollY / totalHeight)));
      }
    }

    // Set initial
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const currentBackground = useMemo(() => getInterpolatedColors(scrollRatio), [scrollRatio]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: -1,
      pointerEvents: "none",
      background: currentBackground,
      transition: "background 0.1s ease" // minor smoothing
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <CinematicScene scrollRatio={scrollRatio} />
      </Canvas>
    </div>
  );
}
