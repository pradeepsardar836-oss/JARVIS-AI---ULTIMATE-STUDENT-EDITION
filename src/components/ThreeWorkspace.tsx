import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Model3DSpec, ModelPartSpec } from '../types/jarvis';
import { exportGroupToObj, triggerDownload } from '../utils/objExporter';
import { 
  Box, Eye, Layers, RotateCw, Download, Code2, 
  Sparkles, ChevronUp, ChevronDown, Check, Copy, HelpCircle, RefreshCw
} from 'lucide-react';

interface ThreeWorkspaceProps {
  currentModel?: Model3DSpec | null;
  onGenerateCustom?: (prompt: string) => void;
  isLoading?: boolean;
}

export const ThreeWorkspace: React.FC<ThreeWorkspaceProps> = ({
  currentModel,
  onGenerateCustom,
  isLoading = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const partsArrayRef = useRef<{ mesh: THREE.Mesh | THREE.Group; initialPos: THREE.Vector3; explodeDir: THREE.Vector3 }[]>([]);
  
  // HUD and Viewer States
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<string>('solar_system');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'3d' | 'blender' | 'explanation'>('3d');
  const [copiedBlender, setCopiedBlender] = useState<boolean>(false);
  const [customPromptInput, setCustomPromptInput] = useState<string>('');

  // 1. Detect Software WebGL
  const isSoftwareGl = (() => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as any).RENDERER;
    const gpu = String((gl as any).getParameter(param) || '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  // 2. Build Procedural Preset Models
  const buildPresetModel = (type: string): THREE.Group => {
    const rootGroup = new THREE.Group();
    rootGroup.name = type;
    partsArrayRef.current = [];

    if (type === 'solar_system') {
      // 1. Sun
      const sunGeo = new THREE.SphereGeometry(1.8, 32, 32);
      const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff7700,
        emissiveIntensity: 1.2,
        roughness: 0.2,
        metalness: 0.1,
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.name = 'Sun (सूर्य)';
      rootGroup.add(sun);
      partsArrayRef.current.push({ mesh: sun, initialPos: sun.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0) });

      // Corona glow halo
      const coronaGeo = new THREE.SphereGeometry(2.1, 16, 16);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xffd000,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const corona = new THREE.Mesh(coronaGeo, coronaMat);
      rootGroup.add(corona);

      // Planets & Orbit Rings
      const planets = [
        { name: 'Mercury (बुध)', r: 0.35, dist: 3.2, col: 0x94a3b8 },
        { name: 'Venus (शुक्र)', r: 0.6, dist: 4.8, col: 0xf59e0b },
        { name: 'Earth (पृथ्वी)', r: 0.75, dist: 6.8, col: 0x0284c7 },
        { name: 'Mars (मंगल)', r: 0.5, dist: 9.0, col: 0xef4444 },
        { name: 'Jupiter (बृहस्पति)', r: 1.4, dist: 12.0, col: 0xd97706 },
      ];

      planets.forEach((p, idx) => {
        // Orbit line
        const orbitCurve = new THREE.EllipseCurve(0, 0, p.dist, p.dist, 0, 2 * Math.PI, false, 0);
        const points = orbitCurve.getPoints(64);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map(pt => new THREE.Vector3(pt.x, 0, pt.y)));
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        rootGroup.add(orbitLine);

        // Planet body
        const pGeo = new THREE.SphereGeometry(p.r, 24, 24);
        const pMat = new THREE.MeshStandardMaterial({ color: p.col, roughness: 0.6, metalness: 0.2 });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.name = p.name;
        const angle = idx * 1.3;
        pMesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
        rootGroup.add(pMesh);

        // If Earth, add Moon
        if (p.name.includes('Earth')) {
          const moonGeo = new THREE.SphereGeometry(0.18, 16, 16);
          const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
          const moon = new THREE.Mesh(moonGeo, moonMat);
          moon.name = 'Moon (चंद्रमा)';
          moon.position.set(pMesh.position.x + 1.2, 0.4, pMesh.position.z);
          rootGroup.add(moon);
        }

        partsArrayRef.current.push({
          mesh: pMesh,
          initialPos: pMesh.position.clone(),
          explodeDir: pMesh.position.clone().normalize().multiplyScalar(3.5),
        });
      });

    } else if (type === 'dna_helix') {
      // DNA Double Helix
      const numSteps = 36;
      const radius = 2.0;
      const heightStep = 0.25;

      const strand1Mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.7 });
      const strand2Mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.7 });

      const baseColors = [0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6]; // A, T, G, C

      for (let i = 0; i < numSteps; i++) {
        const theta = i * 0.4;
        const y = (i - numSteps / 2) * heightStep;

        const x1 = Math.cos(theta) * radius;
        const z1 = Math.sin(theta) * radius;
        const x2 = Math.cos(theta + Math.PI) * radius;
        const z2 = Math.sin(theta + Math.PI) * radius;

        // Backbone Node 1
        const nodeGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const node1 = new THREE.Mesh(nodeGeo, strand1Mat);
        node1.position.set(x1, y, z1);
        node1.name = `Backbone Sugar-Phosphate Strand A - Node ${i}`;
        rootGroup.add(node1);

        // Backbone Node 2
        const node2 = new THREE.Mesh(nodeGeo, strand2Mat);
        node2.position.set(x2, y, z2);
        node2.name = `Backbone Sugar-Phosphate Strand B - Node ${i}`;
        rootGroup.add(node2);

        // Nitrogenous Base Pair Connection Rung
        const rungGroup = new THREE.Group();
        const rungGeo = new THREE.CylinderGeometry(0.08, 0.08, radius * 2, 12);
        const baseMat = new THREE.MeshStandardMaterial({
          color: baseColors[i % baseColors.length],
          metalness: 0.4,
          roughness: 0.4,
        });
        const rung = new THREE.Mesh(rungGeo, baseMat);
        rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x2 - x1, 0, z2 - z1).normalize());
        rung.name = `Base Pair Rung (${['A-T', 'G-C', 'T-A', 'C-G'][i % 4]})`;
        rootGroup.add(rung);

        partsArrayRef.current.push({
          mesh: rung,
          initialPos: rung.position.clone(),
          explodeDir: new THREE.Vector3(x1, 0, z1).normalize().multiplyScalar(2.0),
        });
      }

    } else if (type === 'atom_model') {
      // Rutherford/Bohr Atomic Model
      // 1. Central Nucleus (Protons + Neutrons clustered)
      const nucleusGroup = new THREE.Group();
      nucleusGroup.name = 'Nucleus (नाभिक - प्रोटॉन व न्यूट्रॉन)';
      const protonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 }); // Red
      const neutronMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.4 }); // Grey

      for (let i = 0; i < 14; i++) {
        const nucSphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), i % 2 === 0 ? protonMat : neutronMat);
        const phi = Math.acos(-1 + (2 * i) / 14);
        const theta = Math.sqrt(14 * Math.PI) * phi;
        nucSphere.position.set(
          Math.cos(theta) * Math.sin(phi) * 0.7,
          Math.sin(theta) * Math.sin(phi) * 0.7,
          Math.cos(phi) * 0.7
        );
        nucleusGroup.add(nucSphere);
      }
      rootGroup.add(nucleusGroup);
      partsArrayRef.current.push({ mesh: nucleusGroup, initialPos: nucleusGroup.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0) });

      // 3 Electron Orbit Rings & Electrons
      const ringAngles = [
        new THREE.Euler(0, 0, 0),
        new THREE.Euler(Math.PI / 3, 0, Math.PI / 4),
        new THREE.Euler(-Math.PI / 3, 0, -Math.PI / 4),
      ];

      ringAngles.forEach((rot, idx) => {
        const ringGeo = new THREE.TorusGeometry(3.5, 0.05, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.copy(rot);
        rootGroup.add(ring);

        // Orbiting Electron
        const electronGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const electronMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 1.5,
        });
        const electron = new THREE.Mesh(electronGeo, electronMat);
        electron.name = `Electron ${idx + 1} (ऋणात्मक इलेक्ट्रॉन)`;
        const angle = (idx * Math.PI * 2) / 3;
        electron.position.set(Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0).applyEuler(rot);
        rootGroup.add(electron);

        partsArrayRef.current.push({
          mesh: electron,
          initialPos: electron.position.clone(),
          explodeDir: electron.position.clone().normalize().multiplyScalar(3.0),
        });
      });

    } else if (type === 'robot_arm') {
      // 6-Axis Industrial Robotic Arm
      // 1. Heavy Base
      const baseGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.6, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.name = 'Robotic Base Platform (आधार)';
      base.position.y = -2.5;
      rootGroup.add(base);

      // 2. Turntable Swivel
      const turnGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 32);
      const turnMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.7 });
      const turn = new THREE.Mesh(turnGeo, turnMat);
      turn.name = 'Axis 1: Turntable Swivel';
      turn.position.y = -1.8;
      rootGroup.add(turn);

      // 3. Lower Boom Arm
      const boom1Geo = new THREE.BoxGeometry(0.6, 2.6, 0.8);
      const boomMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.6 });
      const boom1 = new THREE.Mesh(boom1Geo, boomMat);
      boom1.name = 'Axis 2: Primary Arm Boom';
      boom1.position.set(0, -0.2, 0);
      boom1.rotation.z = 0.2;
      rootGroup.add(boom1);

      // 4. Elbow Joint
      const elbowGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.0, 24);
      const elbow = new THREE.Mesh(elbowGeo, turnMat);
      elbow.name = 'Axis 3: Articulated Elbow Joint';
      elbow.position.set(0.3, 1.2, 0);
      elbow.rotation.x = Math.PI / 2;
      rootGroup.add(elbow);

      // 5. Forearm
      const boom2Geo = new THREE.BoxGeometry(0.5, 2.2, 0.6);
      const boom2 = new THREE.Mesh(boom2Geo, boomMat);
      boom2.name = 'Axis 4: Forearm Boom';
      boom2.position.set(1.2, 2.0, 0);
      boom2.rotation.z = -0.5;
      rootGroup.add(boom2);

      // 6. Wrist & Two-finger Gripper
      const wristGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const wrist = new THREE.Mesh(wristGeo, turnMat);
      wrist.position.set(2.2, 2.5, 0);
      rootGroup.add(wrist);

      const fingerGeo = new THREE.BoxGeometry(0.12, 0.7, 0.2);
      const fingerMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.2 });
      const f1 = new THREE.Mesh(fingerGeo, fingerMat);
      f1.position.set(2.4, 2.8, 0.2);
      const f2 = new THREE.Mesh(fingerGeo, fingerMat);
      f2.position.set(2.4, 2.8, -0.2);
      f1.name = 'Gripper Claw A';
      f2.name = 'Gripper Claw B';
      rootGroup.add(f1);
      rootGroup.add(f2);

      partsArrayRef.current.push({ mesh: base, initialPos: base.position.clone(), explodeDir: new THREE.Vector3(0, -2, 0) });
      partsArrayRef.current.push({ mesh: turn, initialPos: turn.position.clone(), explodeDir: new THREE.Vector3(0, -1, 0) });
      partsArrayRef.current.push({ mesh: boom1, initialPos: boom1.position.clone(), explodeDir: new THREE.Vector3(-1, 0, 0) });
      partsArrayRef.current.push({ mesh: boom2, initialPos: boom2.position.clone(), explodeDir: new THREE.Vector3(1, 1, 0) });
      partsArrayRef.current.push({ mesh: f1, initialPos: f1.position.clone(), explodeDir: new THREE.Vector3(2, 2, 1) });
      partsArrayRef.current.push({ mesh: f2, initialPos: f2.position.clone(), explodeDir: new THREE.Vector3(2, 2, -1) });
    }

    return rootGroup;
  };

  // 3. Build Custom Model from ModelPartSpec
  const buildCustomModelFromSpec = (spec: Model3DSpec): THREE.Group => {
    const rootGroup = new THREE.Group();
    rootGroup.name = spec.title;
    partsArrayRef.current = [];

    spec.parts.forEach((p: ModelPartSpec, idx: number) => {
      let geo: THREE.BufferGeometry;
      const [sx, sy, sz] = p.relativeScale || [1, 1, 1];

      if (p.geometryType === 'sphere') {
        geo = new THREE.SphereGeometry(sx, 24, 24);
      } else if (p.geometryType === 'cylinder') {
        geo = new THREE.CylinderGeometry(sx, sx, sy, 24);
      } else if (p.geometryType === 'torus') {
        geo = new THREE.TorusGeometry(sx, Math.max(sy * 0.2, 0.1), 16, 48);
      } else if (p.geometryType === 'cone') {
        geo = new THREE.ConeGeometry(sx, sy, 24);
      } else {
        geo = new THREE.BoxGeometry(sx, sy, sz);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: p.colorHex || '#38bdf8',
        roughness: 0.35,
        metalness: 0.6,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = p.name;
      const [px, py, pz] = p.relativePosition || [0, 0, 0];
      mesh.position.set(px, py, pz);
      rootGroup.add(mesh);

      const explodeVec = new THREE.Vector3(px || (idx - 2) * 1.5, py || idx, pz || 0).normalize().multiplyScalar(3.0);
      partsArrayRef.current.push({
        mesh,
        initialPos: mesh.position.clone(),
        explodeDir: explodeVec,
      });
    });

    return rootGroup;
  };

  // Initialize Three.js Scene and Renderer
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 6, 16);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Environment Lighting (RoomEnvironment per Three.js skill)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Studio Lights
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x082f49, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.0);
    keyLight.position.set(8, 14, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-10, -5, -8);
    scene.add(rimLight);

    // Contact Ground Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -3.2;
    scene.add(gridHelper);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 3;

    // Load initial model
    const initialGroup = currentModel ? buildCustomModelFromSpec(currentModel) : buildPresetModel(selectedPreset);
    modelGroupRef.current = initialGroup;
    scene.add(initialGroup);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();

      if (modelGroupRef.current && isRotating) {
        modelGroupRef.current.rotation.y += 0.4 * rotationSpeed * delta;
      }

      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Scene when Preset or Custom Model Changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
    }

    let newGroup: THREE.Group;
    if (currentModel) {
      newGroup = buildCustomModelFromSpec(currentModel);
    } else {
      newGroup = buildPresetModel(selectedPreset);
    }

    modelGroupRef.current = newGroup;
    scene.add(newGroup);

    // Apply wireframe setting
    applyWireframe(wireframe, newGroup);
    applyExplode(explodedFactor);
  }, [selectedPreset, currentModel]);

  // Wireframe toggle effect
  const applyWireframe = (isWire: boolean, targetGroup?: THREE.Group) => {
    const group = targetGroup || modelGroupRef.current;
    if (!group) return;
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach(m => (m as THREE.MeshStandardMaterial).wireframe = isWire);
        } else if (mat) {
          (mat as THREE.MeshStandardMaterial).wireframe = isWire;
        }
      }
    });
  };

  const handleToggleWireframe = () => {
    const next = !wireframe;
    setWireframe(next);
    applyWireframe(next);
  };

  // Exploded View effect
  const applyExplode = (factor: number) => {
    partsArrayRef.current.forEach(({ mesh, initialPos, explodeDir }) => {
      mesh.position.copy(initialPos).addScaledVector(explodeDir, factor);
    });
  };

  const handleExplodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setExplodedFactor(val);
    applyExplode(val);
  };

  // Export to OBJ
  const handleExportObj = () => {
    if (!modelGroupRef.current) return;
    const name = currentModel?.title || selectedPreset;
    const objText = exportGroupToObj(modelGroupRef.current, name);
    triggerDownload(objText, `${name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.obj`, 'model/obj');
  };

  // Copy Blender Script
  const handleCopyBlender = () => {
    const script = currentModel?.blenderPythonScript || `# JARVIS Procedural 3D Model Generator for Blender 3.x / 4.x
import bpy

# Clean existing scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create high-res 3D model: ${selectedPreset}
bpy.ops.mesh.primitive_uv_sphere_add(radius=2, location=(0,0,0))
obj = bpy.context.active_object
obj.name = "JARVIS_${selectedPreset}"

# Material setup
mat = bpy.data.materials.new(name="SciFi_Blue")
mat.use_nodes = True
nodes = mat.node_tree.nodes
principled = nodes.get("Principled BSDF")
principled.inputs['Base Color'].default_value = (0.02, 0.7, 0.9, 1.0)
principled.inputs['Metallic'].default_value = 0.8
principled.inputs['Roughness'].default_value = 0.2
obj.data.materials.append(mat)

# Add Camera & Studio Light
bpy.ops.object.camera_add(location=(0, -12, 6), rotation=(1.1, 0, 0))
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))

print("JARVIS: Blender 3D Project initialized successfully!")
`;
    navigator.clipboard.writeText(script);
    setCopiedBlender(true);
    setTimeout(() => setCopiedBlender(false), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPromptInput.trim() && onGenerateCustom) {
      onGenerateCustom(customPromptInput.trim());
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 flex flex-col select-none shadow-2xl">
      {/* Top Spec & Preset Selector Bar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-cyan-500/40 backdrop-blur-md shadow-md">
          <Box className="w-5 h-5 text-cyan-400" />
          <span className="font-orbitron font-bold text-sm text-cyan-200 tracking-wider">
            3D HOLOGRAPHIC LAB
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-400 font-mono border border-cyan-700/50">
            {currentModel ? 'AI GENERATED' : selectedPreset.toUpperCase()}
          </span>
        </div>

        {/* Model Presets */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md">
          <span className="text-xs text-cyan-400/80 font-chakra pr-1 hidden sm:inline">Presets:</span>
          {[
            { id: 'solar_system', label: 'सौरमंडल (Solar)' },
            { id: 'dna_helix', label: 'DNA Double Helix' },
            { id: 'atom_model', label: 'Bohr Atom' },
            { id: 'robot_arm', label: 'Robotic Arm' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset.id);
              }}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                selectedPreset === preset.id && !currentModel
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-cyan-300 hover:bg-cyan-950/70'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* View Switcher (3D / Blender Code / Hindi Notes) */}
        <div className="flex items-center gap-1 bg-slate-950/85 p-1 rounded-lg border border-cyan-500/30 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-2.5 py-1 text-xs rounded flex items-center gap-1 ${
              activeTab === '3d' ? 'bg-cyan-600/40 text-cyan-100 font-semibold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> 3D View
          </button>
          <button
            onClick={() => setActiveTab('blender')}
            className={`px-2.5 py-1 text-xs rounded flex items-center gap-1 ${
              activeTab === 'blender' ? 'bg-cyan-600/40 text-cyan-100 font-semibold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Blender Script
          </button>
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-2.5 py-1 text-xs rounded flex items-center gap-1 ${
              activeTab === 'explanation' ? 'bg-cyan-600/40 text-cyan-100 font-semibold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Hindi Guide
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Mount (100% Unobstructed Center) */}
      <div
        ref={mountRef}
        className={`w-full flex-1 relative ${activeTab !== '3d' ? 'hidden' : ''}`}
      />

      {/* Overlay: Blender Python Script Viewer */}
      {activeTab === 'blender' && (
        <div className="w-full flex-1 p-6 overflow-y-auto bg-slate-950/95 z-10 flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-cyan-500/30 pb-2">
            <div>
              <h3 className="font-orbitron text-sm font-bold text-cyan-300">
                BLENDER PYTHON AUTOMATION SCRIPT (bpy)
              </h3>
              <p className="text-xs text-slate-400">
                Copy this code and paste into Blender &gt; Scripting Tab &gt; Run Script
              </p>
            </div>
            <button
              onClick={handleCopyBlender}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedBlender ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedBlender ? 'Copied to Clipboard!' : 'Copy Script'}
            </button>
          </div>
          <pre className="flex-1 p-4 rounded-lg bg-slate-900 border border-cyan-900/60 font-mono text-xs text-cyan-300 overflow-x-auto select-text leading-relaxed">
            {currentModel?.blenderPythonScript || `# Blender Python Script (bpy) for ${selectedPreset}
import bpy

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Procedural generation code
bpy.ops.mesh.primitive_uv_sphere_add(radius=2, location=(0,0,0))
obj = bpy.context.active_object
obj.name = "JARVIS_${selectedPreset}"

mat = bpy.data.materials.new(name="SciFi_Blue")
mat.use_nodes = True
obj.data.materials.append(mat)
print("Ready for rendering in Cycles or EEVEE.")
`}
          </pre>
        </div>
      )}

      {/* Overlay: Hindi Educational Explanation */}
      {activeTab === 'explanation' && (
        <div className="w-full flex-1 p-6 overflow-y-auto bg-slate-950/95 z-10">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="font-orbitron text-lg font-bold text-cyan-300 border-b border-cyan-500/30 pb-2">
              📖 3D मॉडल व विज्ञान का विवरण (Educational Notes)
            </h3>
            <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-slate-200 text-sm leading-relaxed space-y-3">
              <p className="font-semibold text-cyan-400">
                {currentModel?.title || selectedPreset.replace('_', ' ').toUpperCase()}
              </p>
              <p>
                {currentModel?.description ||
                  'यह त्रि-आयामी (3D) संरचना विद्यार्थियों को ज्यामिति, भौतिक विज्ञान और कंप्यूटर ग्राफिक्स के अंतर्संबंधों को सरलता से समझने के लिए बनाई गई है।'}
              </p>
              <div className="p-3 bg-slate-900/90 rounded border border-cyan-800/40 text-xs text-cyan-200">
                <span className="font-bold text-cyan-400">JARVIS शिक्षण टिप:</span>{' '}
                {currentModel?.educationalNotes ||
                  'Blender में आप "OBJ" फ़ाइल इम्पोर्ट कर सकते हैं या इस Python कोड को चलाकर सीधे भौतिकी आधारित रेंडर प्राप्त कर सकते हैं।'}
              </div>
            </div>

            <div className="border border-slate-800 p-4 rounded-lg">
              <h4 className="font-chakra font-bold text-sm text-cyan-400 mb-2">3D मॉडलिंग के मुख्य चरण:</h4>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2">
                <li><strong>Mesh Geometry:</strong> वर्टिसेस (Vertices) और फेसेस (Faces) द्वारा 3D ढांचा तैयार करना।</li>
                <li><strong>PBR Shading:</strong> मैटेरियल में Metallic, Roughness और Base Color जोड़ना।</li>
                <li><strong>Lighting & PMREM:</strong> त्रि-आयामी गहराई के लिए Key, Fill और Rim लाइट का सामंजस्य।</li>
                <li><strong>Export & Print:</strong> 3D प्रिंटर या गेम इंजन के लिए .OBJ / .STL / .GLB में निर्यात करना।</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Text-to-3D Prompt Bar */}
      <div className="absolute top-16 left-4 right-4 z-20 pointer-events-auto flex justify-center">
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 max-w-lg w-full bg-slate-950/90 border border-cyan-500/50 rounded-lg p-1.5 shadow-xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400 ml-2 shrink-0" />
          <input
            type="text"
            value={customPromptInput}
            onChange={(e) => setCustomPromptInput(e.target.value)}
            placeholder="बोलें या लिखें: 'JARVIS, DNA model बनाओ'..."
            className="flex-1 bg-transparent text-xs text-cyan-100 placeholder:text-slate-500 focus:outline-none px-2"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1 shrink-0"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generate 3D'}
          </button>
        </form>
      </div>

      {/* Unified Bottom Control Dock (Follows Three.js Skill Ergonomic Dock Directive) */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-[92%] max-w-3xl transition-all duration-300"
        style={{ transform: isDockCollapsed ? 'translate(-50%, calc(100% - 24px))' : 'translate(-50%, 0)' }}
      >
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center -mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-3 py-0.5 rounded-t-md bg-slate-900 border-t border-x border-cyan-500/40 text-[11px] font-chakra text-cyan-300 flex items-center gap-1 hover:bg-slate-800 transition-colors shadow-lg"
          >
            {isDockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isDockCollapsed ? 'Show Controls' : 'Hide Controls (Zen Mode)'}
          </button>
        </div>

        {/* Dock Bar */}
        <div className="hud-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-lg border border-cyan-500/40">
          {/* Rotation Toggle & Speed */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-1.5 rounded border text-xs flex items-center gap-1 ${
                isRotating ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300' : 'border-slate-700 text-slate-400'
              }`}
              title="Toggle Auto Rotation"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
            <div className="flex items-center gap-1 text-xs text-cyan-300">
              <span className="text-[10px] text-slate-400">Speed:</span>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.2"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-16 h-1 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Wireframe Toggle */}
          <button
            onClick={handleToggleWireframe}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              wireframe ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'border-cyan-700/50 text-cyan-300 hover:bg-cyan-950/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          {/* Exploded View Slider */}
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <span className="text-[11px] font-chakra text-cyan-400">Exploded View:</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={explodedFactor}
              onChange={handleExplodeChange}
              className="w-24 h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono text-[10px] w-6">{Math.round(explodedFactor * 100)}%</span>
          </div>

          {/* Export OBJ Button */}
          <button
            onClick={handleExportObj}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-900/30"
            title="Download 3D Model in standard .OBJ format for Blender / 3D printing"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export OBJ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
