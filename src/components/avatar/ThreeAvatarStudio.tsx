import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCcw,
  Sparkles,
  Check,
  Palette,
  Camera,
  Layers,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Box,
  Upload,
  Eye,
  User,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { ClosetItem, UserProfile, Outfit, ClothingCategory } from '../../types';

interface ThreeAvatarStudioProps {
  closetItems: ClosetItem[];
  user: UserProfile;
  onSaveOutfit?: (outfit: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>) => void;
  onClose?: () => void;
}

const SKIN_TONES = [
  { id: 'fair', label: 'Porcelain', hex: '#F9E0D2', lipHex: '#D98278' },
  { id: 'peach', label: 'Warm Peach', hex: '#F1C4A5', lipHex: '#C96E63' },
  { id: 'olive', label: 'Golden Honey', hex: '#DBA379', lipHex: '#B65B50' },
  { id: 'caramel', label: 'Caramel', hex: '#B9784E', lipHex: '#94433B' },
  { id: 'bronze', label: 'Warm Bronze', hex: '#8A5232', lipHex: '#6E2E28' },
  { id: 'espresso', label: 'Rich Espresso', hex: '#522F1D', lipHex: '#441C18' },
];

const HAIR_COLORS = [
  { id: 'espresso', label: 'Dark Espresso', hex: '#1E1512' },
  { id: 'chestnut', label: 'Warm Chestnut', hex: '#4E2A1A' },
  { id: 'auburn', label: 'Copper Auburn', hex: '#7D321E' },
  { id: 'golden', label: 'Honey Blonde', hex: '#C8964B' },
  { id: 'platinum', label: 'Champagne Blonde', hex: '#E6D6BE' },
  { id: 'rose', label: 'Rose Velvet', hex: '#A84255' },
];

const EYE_COLORS = [
  { id: 'hazel', label: 'Warm Hazel', hex: '#6E4726', innerHex: '#A67438' },
  { id: 'emerald', label: 'Emerald', hex: '#2D6A4F', innerHex: '#52B788' },
  { id: 'ocean', label: 'Ocean Blue', hex: '#255C99', innerHex: '#64A6BD' },
  { id: 'amber', label: 'Golden Amber', hex: '#9C5A1A', innerHex: '#E09F3E' },
  { id: 'espresso', label: 'Deep Brown', hex: '#2E1A11', innerHex: '#5C3A28' },
];

type HairStyleId = 'center_part' | 'glamour_waves' | 'swept_quiff' | 'sleek_bob';
type BodyArchetype = 'feminine' | 'streetwear';
type StagePreset = 'hologram' | 'atelier' | 'runway';
type CameraPreset = 'full' | 'outfit' | 'portrait';
type TextureWrapMode = 'pattern_wrap' | 'front_graphic' | 'tinted_weave';

/**
 * Generates a realistic radial iris texture with limbal ring, iris fibers, pupil, and dual catchlights
 */
function createIrisTexture(outerHex: string, innerHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const cx = 128;
  const cy = 128;

  // Sclera outer edge
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 256, 256);

  // Outer limbal ring
  const grad = ctx.createRadialGradient(cx, cy, 24, cx, cy, 118);
  grad.addColorStop(0, innerHex);
  grad.addColorStop(0.55, outerHex);
  grad.addColorStop(0.88, '#1A110B');
  grad.addColorStop(1, '#FFFFFF');

  ctx.beginPath();
  ctx.arc(cx, cy, 115, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Radial iris striations
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 90; i++) {
    const angle = (i / 90) * Math.PI * 2;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 32, Math.sin(angle) * 32);
    ctx.lineTo(Math.cos(angle) * 102, Math.sin(angle) * 102);
    ctx.stroke();
  }
  ctx.restore();

  // Deep pupil
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.fillStyle = '#09090B';
  ctx.fill();

  // Primary & secondary corneal catchlights (Pixar/RPM style)
  ctx.beginPath();
  ctx.arc(cx - 26, cy - 28, 16, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx + 28, cy + 24, 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a high-resolution garment texture from a ClosetItem or uploaded photo
 */
function buildGarmentCanvasTexture(
  baseColorHex: string,
  itemName: string,
  wrapMode: TextureWrapMode,
  loadedImage?: HTMLImageElement | null
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base fabric color
  ctx.fillStyle = baseColorHex || '#E2725B';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle fabric weave
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let y = 0; y < 1024; y += 6) {
    ctx.fillRect(0, y, 1024, 2);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let x = 0; x < 1024; x += 6) {
    ctx.fillRect(x, 0, 2, 1024);
  }

  if (loadedImage) {
    if (wrapMode === 'pattern_wrap') {
      // Tile / wrap the clothing photo seamlessly across the 3D garment mesh (like Image 3)
      const cols = 2;
      const rows = 2;
      const cellW = 1024 / cols;
      const cellH = 1024 / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.drawImage(loadedImage, c * cellW, r * cellH, cellW, cellH);
        }
      }
      // Subtle seam shading
      const grad = ctx.createLinearGradient(0, 0, 0, 1024);
      grad.addColorStop(0, 'rgba(255,255,255,0.08)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);
    } else if (wrapMode === 'front_graphic') {
      // Draw the clothing image prominently on the front & back torso panels
      // Front center panel (in LatheGeometry UV, u=0.25..0.75 is front/back)
      const drawPanel = (centerX: number) => {
        const w = 360;
        const h = 440;
        const x = centerX - w / 2;
        const y = 240;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 28);
        ctx.clip();
        ctx.drawImage(loadedImage, x, y, w, h);
        ctx.restore();
      };
      drawPanel(256);
      drawPanel(768);
    } else {
      // Tinted weave blend
      ctx.globalAlpha = 0.72;
      ctx.drawImage(loadedImage, 0, 0, 1024, 1024);
      ctx.globalAlpha = 1.0;
    }
  } else {
    // Stylized designer seam & motif when no photo is loaded yet
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, 960, 960);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(itemName.toUpperCase().slice(0, 22), 512, 480);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export const ThreeAvatarStudio: React.FC<ThreeAvatarStudioProps> = ({
  closetItems,
  user,
  onSaveOutfit
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gltfInputRef = useRef<HTMLInputElement | null>(null);
  const photoTryOnInputRef = useRef<HTMLInputElement | null>(null);

  // Avatar Appearance State
  const [skinTone, setSkinTone] = useState(
    user.avatarConfig?.skinTone || SKIN_TONES[1].hex
  );
  const [hairColor, setHairColor] = useState(
    user.avatarConfig?.hairColor || HAIR_COLORS[1].hex
  );
  const [eyeColorId, setEyeColorId] = useState<string>('hazel');
  const [hairStyle, setHairStyle] = useState<HairStyleId>('center_part');
  const [bodyArchetype, setBodyArchetype] = useState<BodyArchetype>('feminine');
  const [stagePreset, setStagePreset] = useState<StagePreset>('hologram');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('full');
  const [textureWrapMode, setTextureWrapMode] = useState<TextureWrapMode>('pattern_wrap');

  // Equipped Clothing Items by Slot
  const [selectedTop, setSelectedTop] = useState<ClosetItem | null>(
    () => closetItems.find((i) => i.category === 'tops') || null
  );
  const [selectedBottom, setSelectedBottom] = useState<ClosetItem | null>(
    () => closetItems.find((i) => i.category === 'bottoms') || null
  );
  const [selectedDress, setSelectedDress] = useState<ClosetItem | null>(null);
  const [selectedOuterwear, setSelectedOuterwear] = useState<ClosetItem | null>(
    () => closetItems.find((i) => i.category === 'outerwear') || null
  );
  const [selectedShoes, setSelectedShoes] = useState<ClosetItem | null>(
    () => closetItems.find((i) => i.category === 'shoes') || null
  );
  const [selectedAccessory, setSelectedAccessory] = useState<ClosetItem | null>(
    () => closetItems.find((i) => i.category === 'accessories') || null
  );

  // Custom uploaded try-on photo state
  const [customTryOnPhoto, setCustomTryOnPhoto] = useState<{
    dataUrl: string;
    targetSlot: 'dress' | 'tops' | 'outerwear' | 'bottoms';
    label: string;
  } | null>(null);

  // Studio Controls
  const [activeCategoryTab, setActiveCategoryTab] = useState<ClothingCategory>('tops');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(4.2);
  const [outfitTitle, setOutfitTitle] = useState<string>('');
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [customModelName, setCustomModelName] = useState<string | null>(null);
  const [lastEquippedLabel, setLastEquippedLabel] = useState<string | null>(null);

  // Three.js Mutable References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const stageGroupRef = useRef<THREE.Group | null>(null);
  const customGltfRef = useRef<THREE.Group | null>(null);

  // Dynamic Mesh References for Live Material / Texture Updates
  const skinMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const lipMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const hairMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const irisMaterialsRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const hairVariantGroupsRef = useRef<Record<HairStyleId, THREE.Group | null>>({
    center_part: null,
    glamour_waves: null,
    swept_quiff: null,
    sleek_bob: null,
  });

  // Garment Group & Material Refs
  const garmentRefs = useRef<{
    topGroup: THREE.Group | null;
    topMat: THREE.MeshStandardMaterial | null;
    bottomGroup: THREE.Group | null;
    bottomMat: THREE.MeshStandardMaterial | null;
    dressGroup: THREE.Group | null;
    dressMat: THREE.MeshStandardMaterial | null;
    outerwearGroup: THREE.Group | null;
    outerwearMat: THREE.MeshStandardMaterial | null;
    shoesGroup: THREE.Group | null;
    shoesMat: THREE.MeshStandardMaterial | null;
    accessoryGroup: THREE.Group | null;
    accessoryMat: THREE.MeshStandardMaterial | null;
  }>({
    topGroup: null,
    topMat: null,
    bottomGroup: null,
    bottomMat: null,
    dressGroup: null,
    dressMat: null,
    outerwearGroup: null,
    outerwearMat: null,
    shoesGroup: null,
    shoesMat: null,
    accessoryGroup: null,
    accessoryMat: null,
  });

  // Orbit / Drag State
  const isDraggingRef = useRef<boolean>(false);
  const previousMouseXRef = useRef<number>(0);
  const targetRotationYRef = useRef<number>(0);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const cameraTargetYRef = useRef<number>(0.35);
  const cameraPosZRef = useRef<number>(4.2);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  /**
   * Builds the entire stylized 3D character (Pixar / ReadyPlayerMe style head, eyes, lashes, hair, organic torso/limbs, and form-fitting 3D garments)
   */
  const buildStylizedCharacter = (archetype: BodyArchetype) => {
    const avatarGroup = avatarGroupRef.current;
    if (!avatarGroup) return;

    // Clear previous procedural meshes (except custom GLTF if loaded)
    while (avatarGroup.children.length > 0) {
      avatarGroup.remove(avatarGroup.children[0]);
    }
    skinMaterialsRef.current = [];
    lipMaterialsRef.current = [];
    hairMaterialsRef.current = [];
    irisMaterialsRef.current = [];

    const isFem = archetype === 'feminine';
    const selectedSkinObj = SKIN_TONES.find((s) => s.hex === skinTone) || SKIN_TONES[1];
    const selectedEyeObj = EYE_COLORS.find((e) => e.id === eyeColorId) || EYE_COLORS[0];

    // 1. Subsurface-style Skin Material
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(skinTone),
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
      sheen: 0.25,
      sheenColor: new THREE.Color('#FFE5D9'),
    });
    skinMaterialsRef.current.push(skinMat);

    // 2. Lip Material
    const lipMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(selectedSkinObj.lipHex),
      roughness: 0.28,
      metalness: 0.02,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
    });
    lipMaterialsRef.current.push(lipMat);

    // 3. Hair Material
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: 0.36,
      metalness: 0.14,
    });
    hairMaterialsRef.current.push(hairMat);

    // =========================================================================
    // HEAD & EXPRESSIVE FACE (Matching Image 4 & Image 2/3)
    // =========================================================================
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.38, 0);

    // Sculpted Cranium + Jawline via Lathe / Deformed Sphere
    const headProfile: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -0.24),   // Chin tip
      new THREE.Vector2(0.075, -0.22), // Lower jaw
      new THREE.Vector2(0.145, -0.14), // Jawline contour
      new THREE.Vector2(0.185, -0.03), // Cheekbones
      new THREE.Vector2(0.195, 0.08),  // Temple
      new THREE.Vector2(0.175, 0.19),  // Forehead
      new THREE.Vector2(0.11, 0.26),   // Crown
      new THREE.Vector2(0.0, 0.285),   // Top of skull
    ];
    const headGeo = new THREE.LatheGeometry(headProfile, 48);
    headGeo.scale(1.0, 1.0, 1.06);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headGroup.add(headMesh);

    // Soft Cheek Blushes (subtle warm glow)
    const cheekGeo = new THREE.SphereGeometry(0.055, 24, 24);
    cheekGeo.scale(1.2, 0.8, 0.5);
    const blushMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E57A77'),
      transparent: true,
      opacity: isFem ? 0.16 : 0.06,
    });
    [-0.105, 0.105].forEach((x) => {
      const cheek = new THREE.Mesh(cheekGeo, blushMat);
      cheek.position.set(x, -0.05, 0.165);
      headGroup.add(cheek);
    });

    // Sculpted 3D Ears
    const earGeo = new THREE.SphereGeometry(0.048, 20, 20);
    earGeo.scale(0.42, 1.15, 0.72);
    [-1, 1].forEach((dir) => {
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.position.set(dir * 0.19, -0.01, -0.01);
      ear.rotation.z = dir * -0.14;
      ear.rotation.y = dir * 0.25;
      headGroup.add(ear);
    });

    // =========================================================================
    // LARGE EXPRESSIVE 3D EYES (Sclera + Iris Texture + Cornea + Eyelids + Lashes)
    // =========================================================================
    const irisTex = createIrisTexture(selectedEyeObj.hex, selectedEyeObj.innerHex);
    const scleraMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
    });
    const irisMat = new THREE.MeshBasicMaterial({
      map: irisTex,
    });
    irisMaterialsRef.current.push(irisMat);

    const lashMat = new THREE.MeshStandardMaterial({
      color: 0x140d0b,
      roughness: 0.35,
    });

    [-1, 1].forEach((dir) => {
      const eyeSocket = new THREE.Group();
      eyeSocket.position.set(dir * 0.072, 0.028, 0.162);
      eyeSocket.rotation.y = dir * 0.14;

      // Sclera sphere
      const scleraGeo = new THREE.SphereGeometry(0.042, 28, 28);
      scleraGeo.scale(1.08, 0.95, 0.65);
      const sclera = new THREE.Mesh(scleraGeo, scleraMat);
      eyeSocket.add(sclera);

      // Iris disc with radial striation texture & catchlights
      const irisGeo = new THREE.CircleGeometry(0.028, 32);
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(0, 0, 0.028);
      eyeSocket.add(iris);

      // Glossy transparent cornea dome
      const corneaGeo = new THREE.SphereGeometry(0.029, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const corneaMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.02,
        clearcoat: 1.0,
      });
      const cornea = new THREE.Mesh(corneaGeo, corneaMat);
      cornea.rotation.x = Math.PI / 2;
      cornea.position.set(0, 0, 0.015);
      eyeSocket.add(cornea);

      // Upper Eyelid Fold
      const upperLidGeo = new THREE.TorusGeometry(0.041, 0.008, 14, 28, Math.PI);
      const upperLid = new THREE.Mesh(upperLidGeo, skinMat);
      upperLid.position.set(0, 0.005, 0.018);
      upperLid.rotation.z = dir * -0.06;
      eyeSocket.add(upperLid);

      // Upper Eyelash Line (winged for feminine, clean for streetwear)
      const lashArcGeo = new THREE.TorusGeometry(
        0.042,
        isFem ? 0.0065 : 0.0045,
        12,
        28,
        Math.PI * 1.05
      );
      const lashLine = new THREE.Mesh(lashArcGeo, lashMat);
      lashLine.position.set(dir * 0.002, 0.006, 0.024);
      lashLine.rotation.z = dir * -0.08;
      eyeSocket.add(lashLine);

      // Individual outer lash flicks (like Image 4)
      if (isFem) {
        for (let l = 0; l < 4; l++) {
          const flickGeo = new THREE.ConeGeometry(0.003, 0.018, 8);
          const flick = new THREE.Mesh(flickGeo, lashMat);
          const angle = 0.35 + l * 0.22;
          flick.position.set(
            dir * Math.cos(angle) * 0.044,
            Math.sin(angle) * 0.038,
            0.024
          );
          flick.rotation.z = dir * (-0.75 - l * 0.12);
          eyeSocket.add(flick);
        }
      }

      // Arched 3D Eyebrow
      const browCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * -0.036, 0.048, 0.018),
        new THREE.Vector3(dir * 0.006, 0.062, 0.024),
        new THREE.Vector3(dir * 0.045, 0.046, 0.012),
      ]);
      const browGeo = new THREE.TubeGeometry(browCurve, 20, isFem ? 0.0065 : 0.009, 10, false);
      const brow = new THREE.Mesh(browGeo, hairMat);
      eyeSocket.add(brow);

      headGroup.add(eyeSocket);
    });

    // =========================================================================
    // SCULPTED 3D NOSE (Bridge + Soft Tip + Nostril Wings)
    // =========================================================================
    const noseGroup = new THREE.Group();
    noseGroup.position.set(0, -0.02, 0.192);

    const noseBridgeGeo = new THREE.CylinderGeometry(0.011, 0.018, 0.075, 16);
    noseBridgeGeo.scale(0.85, 1, 1.15);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
    noseBridge.position.set(0, 0.018, -0.004);
    noseBridge.rotation.x = -0.18;
    noseGroup.add(noseBridge);

    const noseTipGeo = new THREE.SphereGeometry(0.021, 20, 20);
    noseTipGeo.scale(1.12, 0.88, 1.05);
    const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
    noseTip.position.set(0, -0.018, 0.008);
    noseGroup.add(noseTip);

    [-1, 1].forEach((dir) => {
      const nostrilWingGeo = new THREE.SphereGeometry(0.013, 14, 14);
      const wing = new THREE.Mesh(nostrilWingGeo, skinMat);
      wing.position.set(dir * 0.016, -0.022, -0.002);
      noseGroup.add(wing);
    });
    headGroup.add(noseGroup);

    // =========================================================================
    // SCULPTED 3D LIPS (Cupid's Bow Upper Lip + Full Lower Lip)
    // =========================================================================
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.108, 0.178);

    // Upper lip curve
    const upperLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.044, -0.003, -0.008),
      new THREE.Vector3(-0.015, 0.008, 0.012),
      new THREE.Vector3(0.0, 0.004, 0.014),
      new THREE.Vector3(0.015, 0.008, 0.012),
      new THREE.Vector3(0.044, -0.003, -0.008),
    ]);
    const upperLipGeo = new THREE.TubeGeometry(
      upperLipCurve,
      24,
      isFem ? 0.0105 : 0.0085,
      14,
      false
    );
    const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
    mouthGroup.add(upperLip);

    // Lower lip curve
    const lowerLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.042, -0.004, -0.008),
      new THREE.Vector3(0.0, -0.016, 0.015),
      new THREE.Vector3(0.042, -0.004, -0.008),
    ]);
    const lowerLipGeo = new THREE.TubeGeometry(
      lowerLipCurve,
      24,
      isFem ? 0.0125 : 0.0095,
      14,
      false
    );
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
    mouthGroup.add(lowerLip);

    headGroup.add(mouthGroup);

    // =========================================================================
    // MULTI-STRAND 3D HAIRSTYLES (Images 2, 3, and 4)
    // =========================================================================
    // 1. Center-Parted Long Sleek Hair (Image 4 style)
    const centerPartGroup = new THREE.Group();
    const scalpCapGeo = new THREE.SphereGeometry(0.206, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    scalpCapGeo.scale(1.02, 1.05, 1.08);
    const scalpCap = new THREE.Mesh(scalpCapGeo, hairMat);
    scalpCap.position.set(0, 0.05, -0.01);
    centerPartGroup.add(scalpCap);

    [-1, 1].forEach((dir) => {
      // Curtain bang sweep framing the face
      const bangCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 0.015, 0.255, 0.14),
        new THREE.Vector3(dir * 0.13, 0.18, 0.15),
        new THREE.Vector3(dir * 0.195, 0.02, 0.09),
        new THREE.Vector3(dir * 0.205, -0.24, 0.05),
        new THREE.Vector3(dir * 0.185, -0.52, 0.07),
      ]);
      const bangGeo = new THREE.TubeGeometry(bangCurve, 32, 0.055, 16, false);
      bangGeo.scale(0.65, 1.0, 1.15);
      const bangMesh = new THREE.Mesh(bangGeo, hairMat);
      bangMesh.castShadow = true;
      centerPartGroup.add(bangMesh);

      // Side & back long flowing volume
      const backStrandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 0.12, 0.18, -0.06),
        new THREE.Vector3(dir * 0.19, -0.08, -0.09),
        new THREE.Vector3(dir * 0.18, -0.38, -0.10),
        new THREE.Vector3(dir * 0.15, -0.64, -0.06),
      ]);
      const backStrandGeo = new THREE.TubeGeometry(backStrandCurve, 28, 0.085, 16, false);
      const backStrand = new THREE.Mesh(backStrandGeo, hairMat);
      backStrand.castShadow = true;
      centerPartGroup.add(backStrand);
    });
    headGroup.add(centerPartGroup);
    hairVariantGroupsRef.current.center_part = centerPartGroup;

    // 2. Glamour Waves (Image 3 style)
    const glamourWavesGroup = new THREE.Group();
    glamourWavesGroup.add(scalpCap.clone());
    [-1, 1].forEach((dir) => {
      const waveCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 0.03, 0.25, 0.14),
        new THREE.Vector3(dir * 0.18, 0.14, 0.12),
        new THREE.Vector3(dir * 0.23, -0.04, 0.08),
        new THREE.Vector3(dir * 0.18, -0.24, 0.11),
        new THREE.Vector3(dir * 0.24, -0.44, 0.08),
        new THREE.Vector3(dir * 0.19, -0.62, 0.10),
      ]);
      const waveGeo = new THREE.TubeGeometry(waveCurve, 36, 0.068, 16, false);
      const waveMesh = new THREE.Mesh(waveGeo, hairMat);
      waveMesh.castShadow = true;
      glamourWavesGroup.add(waveMesh);
    });
    const backCascadeGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.72, 24);
    backCascadeGeo.scale(1.0, 1.0, 0.55);
    const backCascade = new THREE.Mesh(backCascadeGeo, hairMat);
    backCascade.position.set(0, -0.22, -0.12);
    glamourWavesGroup.add(backCascade);
    headGroup.add(glamourWavesGroup);
    hairVariantGroupsRef.current.glamour_waves = glamourWavesGroup;

    // 3. Modern Swept Quiff / Streetwear Crop (Image 2 style)
    const sweptQuiffGroup = new THREE.Group();
    const shortCapGeo = new THREE.SphereGeometry(0.204, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.54);
    shortCapGeo.scale(1.02, 1.04, 1.08);
    const shortCap = new THREE.Mesh(shortCapGeo, hairMat);
    shortCap.position.set(0, 0.055, -0.01);
    sweptQuiffGroup.add(shortCap);

    // Sculpted swept front quiff locks
    for (let q = -2; q <= 2; q++) {
      const quiffCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(q * 0.045, 0.21, 0.12),
        new THREE.Vector3(q * 0.05 + 0.03, 0.295 + (2 - Math.abs(q)) * 0.015, 0.16),
        new THREE.Vector3(q * 0.055 + 0.06, 0.27, 0.04),
      ]);
      const quiffGeo = new THREE.TubeGeometry(quiffCurve, 20, 0.044, 12, false);
      const quiffLock = new THREE.Mesh(quiffGeo, hairMat);
      quiffLock.castShadow = true;
      sweptQuiffGroup.add(quiffLock);
    }
    headGroup.add(sweptQuiffGroup);
    hairVariantGroupsRef.current.swept_quiff = sweptQuiffGroup;

    // 4. ChicChin-Length Bob
    const sleekBobGroup = new THREE.Group();
    sleekBobGroup.add(scalpCap.clone());
    [-1, 1].forEach((dir) => {
      const bobCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 0.03, 0.25, 0.13),
        new THREE.Vector3(dir * 0.18, 0.12, 0.11),
        new THREE.Vector3(dir * 0.20, -0.08, 0.07),
        new THREE.Vector3(dir * 0.15, -0.24, 0.09),
      ]);
      const bobGeo = new THREE.TubeGeometry(bobCurve, 28, 0.062, 16, false);
      const bobMesh = new THREE.Mesh(bobGeo, hairMat);
      sleekBobGroup.add(bobMesh);
    });
    headGroup.add(sleekBobGroup);
    hairVariantGroupsRef.current.sleek_bob = sleekBobGroup;

    avatarGroup.add(headGroup);

    // =========================================================================
    // ORGANIC NECK, TORSO & LIMBS (Smooth Lathe & Tapered Anatomical Meshes)
    // =========================================================================
    // Neck & Collarbone transition
    const neckGeo = new THREE.CylinderGeometry(0.082, 0.098, 0.22, 32);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 1.12, -0.01);
    neckMesh.castShadow = true;
    avatarGroup.add(neckMesh);

    // Smooth Anatomical Torso (LatheGeometry from hips -> waist -> bust/chest -> shoulders)
    const torsoPoints: THREE.Vector2[] = isFem
      ? [
          new THREE.Vector2(0.01, 0.0),   // Pelvis base
          new THREE.Vector2(0.19, 0.04),  // Lower hip
          new THREE.Vector2(0.225, 0.16), // Full hip curve
          new THREE.Vector2(0.165, 0.36), // Sculpted waist
          new THREE.Vector2(0.215, 0.56), // Bust contour
          new THREE.Vector2(0.23, 0.72),  // Upper chest
          new THREE.Vector2(0.19, 0.80),  // Shoulder slope
          new THREE.Vector2(0.09, 0.83),  // Base of neck
        ]
      : [
          new THREE.Vector2(0.01, 0.0),
          new THREE.Vector2(0.19, 0.05),
          new THREE.Vector2(0.205, 0.18),
          new THREE.Vector2(0.195, 0.38),
          new THREE.Vector2(0.235, 0.58),
          new THREE.Vector2(0.26, 0.74),
          new THREE.Vector2(0.21, 0.81),
          new THREE.Vector2(0.095, 0.84),
        ];

    const torsoGeo = new THREE.LatheGeometry(torsoPoints, 48);
    torsoGeo.scale(1.08, 1.0, 0.72);
    const torsoMesh = new THREE.Mesh(torsoGeo, skinMat);
    torsoMesh.position.set(0, 0.25, 0);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    avatarGroup.add(torsoMesh);

    // Sculpted Arms & Hands
    const shoulderX = isFem ? 0.265 : 0.295;
    [-1, 1].forEach((dir) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(dir * shoulderX, 0.98, 0);
      armGroup.rotation.z = dir * -0.14;

      // Deltoid shoulder sphere
      const shoulderBall = new THREE.Mesh(new THREE.SphereGeometry(0.068, 24, 24), skinMat);
      armGroup.add(shoulderBall);

      // Upper arm
      const upperArmGeo = new THREE.CylinderGeometry(0.062, 0.052, 0.34, 24);
      const upperArm = new THREE.Mesh(upperArmGeo, skinMat);
      upperArm.position.set(0, -0.17, 0);
      upperArm.castShadow = true;
      armGroup.add(upperArm);

      // Elbow joint
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.051, 20, 20), skinMat);
      elbow.position.set(0, -0.34, 0);
      armGroup.add(elbow);

      // Forearm (slightly angled forward naturally)
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.34, 0);
      forearmGroup.rotation.x = 0.12;
      forearmGroup.rotation.z = dir * 0.05;

      const forearmGeo = new THREE.CylinderGeometry(0.05, 0.039, 0.32, 24);
      const forearm = new THREE.Mesh(forearmGeo, skinMat);
      forearm.position.set(0, -0.16, 0);
      forearm.castShadow = true;
      forearmGroup.add(forearm);

      // Sculpted Palm + Thumb
      const handGeo = new THREE.SphereGeometry(0.044, 20, 20);
      handGeo.scale(0.85, 1.35, 0.55);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.set(0, -0.34, 0.01);
      forearmGroup.add(hand);

      const thumbGeo = new THREE.CapsuleGeometry(0.011, 0.025, 8, 12);
      const thumb = new THREE.Mesh(thumbGeo, skinMat);
      thumb.position.set(dir * -0.028, -0.33, 0.022);
      thumb.rotation.z = dir * 0.45;
      forearmGroup.add(thumb);

      armGroup.add(forearmGroup);
      avatarGroup.add(armGroup);
    });

    // Sculpted Legs (Thigh -> Knee -> Calf -> Ankle)
    [-1, 1].forEach((dir) => {
      const legX = dir * 0.118;
      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.095, 0.068, 0.48, 28);
      const thigh = new THREE.Mesh(thighGeo, skinMat);
      thigh.position.set(legX, 0.05, 0);
      thigh.castShadow = true;
      avatarGroup.add(thigh);

      // Knee
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.066, 20, 20), skinMat);
      knee.position.set(legX, -0.19, 0.008);
      avatarGroup.add(knee);

      // Calf
      const calfGeo = new THREE.CylinderGeometry(0.066, 0.046, 0.48, 28);
      const calf = new THREE.Mesh(calfGeo, skinMat);
      calf.position.set(legX, -0.43, 0);
      calf.castShadow = true;
      avatarGroup.add(calf);
    });

    // =========================================================================
    // FORM-FITTING 3D GARMENT MESHES (WITH LIVE ITEM TEXTURE WRAPPING)
    // =========================================================================

    // 1. TOP / BLOUSE / SWEATER GROUP
    const topGroup = new THREE.Group();
    const topMat = new THREE.MeshStandardMaterial({
      color: 0xe2725b,
      roughness: 0.52,
      metalness: 0.05,
    });
    const topProfile: THREE.Vector2[] = isFem
      ? [
          new THREE.Vector2(0.195, 0.24),
          new THREE.Vector2(0.176, 0.36),
          new THREE.Vector2(0.228, 0.56),
          new THREE.Vector2(0.242, 0.73),
          new THREE.Vector2(0.202, 0.805),
          new THREE.Vector2(0.105, 0.835),
        ]
      : [
          new THREE.Vector2(0.208, 0.22),
          new THREE.Vector2(0.205, 0.38),
          new THREE.Vector2(0.248, 0.58),
          new THREE.Vector2(0.272, 0.745),
          new THREE.Vector2(0.22, 0.815),
          new THREE.Vector2(0.11, 0.84),
        ];
    const topBodyGeo = new THREE.LatheGeometry(topProfile, 48);
    topBodyGeo.scale(1.09, 1.0, 0.74);
    const topBodyMesh = new THREE.Mesh(topBodyGeo, topMat);
    topBodyMesh.position.set(0, 0.25, 0);
    topBodyMesh.castShadow = true;
    topBodyMesh.receiveShadow = true;
    topGroup.add(topBodyMesh);

    // Fitted Top Sleeves
    [-1, 1].forEach((dir) => {
      const sleeveGeo = new THREE.CylinderGeometry(0.072, 0.064, 0.22, 24);
      const sleeve = new THREE.Mesh(sleeveGeo, topMat);
      sleeve.position.set(dir * (shoulderX + 0.015), 0.90, 0);
      sleeve.rotation.z = dir * -0.14;
      sleeve.castShadow = true;
      topGroup.add(sleeve);
    });

    // Neckline Ribbing Collar
    const collarGeo = new THREE.TorusGeometry(0.098, 0.014, 16, 36);
    collarGeo.scale(1.05, 0.85, 1.0);
    const collar = new THREE.Mesh(collarGeo, topMat);
    collar.rotation.x = Math.PI / 2 + 0.12;
    collar.position.set(0, 1.075, 0.01);
    topGroup.add(collar);

    avatarGroup.add(topGroup);
    garmentRefs.current.topGroup = topGroup;
    garmentRefs.current.topMat = topMat;

    // 2. BOTTOMS / TAILORED TROUSERS / DENIM GROUP (Image 2 style)
    const bottomGroup = new THREE.Group();
    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0x3b4d6b,
      roughness: 0.65,
      metalness: 0.05,
    });

    // High-waisted hip yoke
    const hipYokeProfile: THREE.Vector2[] = [
      new THREE.Vector2(0.19, 0.0),
      new THREE.Vector2(0.236, 0.14),
      new THREE.Vector2(0.18, 0.31),
    ];
    const hipYokeGeo = new THREE.LatheGeometry(hipYokeProfile, 40);
    hipYokeGeo.scale(1.1, 1.0, 0.75);
    const hipYoke = new THREE.Mesh(hipYokeGeo, bottomMat);
    hipYoke.position.set(0, 0.24, 0);
    hipYoke.castShadow = true;
    bottomGroup.add(hipYoke);

    // Belt detail at waist
    const beltGeo = new THREE.CylinderGeometry(0.185, 0.192, 0.04, 36);
    beltGeo.scale(1.1, 1.0, 0.76);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x231a16, roughness: 0.35, metalness: 0.3 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0, 0.54, 0);
    bottomGroup.add(belt);

    // Tailored trouser legs + ankle cuffs
    [-1, 1].forEach((dir) => {
      const legX = dir * 0.118;
      const pantLegProfile: THREE.Vector2[] = [
        new THREE.Vector2(0.068, 0.0),   // Ankle cuff
        new THREE.Vector2(0.082, 0.12),  // Lower calf
        new THREE.Vector2(0.092, 0.35),  // Knee
        new THREE.Vector2(0.105, 0.65),  // Mid thigh
        new THREE.Vector2(0.116, 0.88),  // Upper hip
      ];
      const pantLegGeo = new THREE.LatheGeometry(pantLegProfile, 32);
      const pantLeg = new THREE.Mesh(pantLegGeo, bottomMat);
      pantLeg.position.set(legX, -0.58, 0);
      pantLeg.castShadow = true;
      pantLeg.receiveShadow = true;
      bottomGroup.add(pantLeg);

      // Rolled cuff detail
      const cuffGeo = new THREE.TorusGeometry(0.068, 0.012, 12, 28);
      const cuff = new THREE.Mesh(cuffGeo, bottomMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.set(legX, -0.57, 0);
      bottomGroup.add(cuff);
    });

    avatarGroup.add(bottomGroup);
    garmentRefs.current.bottomGroup = bottomGroup;
    garmentRefs.current.bottomMat = bottomMat;

    // 3. FORM-FITTING SCULPTED DRESS GROUP (Image 3 style with full texture wrap)
    const dressGroup = new THREE.Group();
    const dressMat = new THREE.MeshStandardMaterial({
      color: 0xe2725b,
      roughness: 0.45,
      metalness: 0.06,
      side: THREE.DoubleSide,
    });

    const dressProfile: THREE.Vector2[] = [
      new THREE.Vector2(0.36, -0.42),  // Flowing A-line skirt hem
      new THREE.Vector2(0.31, -0.18),  // Mid skirt
      new THREE.Vector2(0.245, 0.08),  // Hip contour
      new THREE.Vector2(0.172, 0.36),  // Cinched waist
      new THREE.Vector2(0.228, 0.56),  // Bodice bust
      new THREE.Vector2(0.238, 0.72),  // Upper bodice
      new THREE.Vector2(0.19, 0.80),   // Shoulder straps
      new THREE.Vector2(0.105, 0.83),  // Sweetheart / scoop neckline
    ];
    const dressGeo = new THREE.LatheGeometry(dressProfile, 56);
    dressGeo.scale(1.09, 1.0, 0.76);
    const dressMesh = new THREE.Mesh(dressGeo, dressMat);
    dressMesh.position.set(0, 0.25, 0);
    dressMesh.castShadow = true;
    dressMesh.receiveShadow = true;
    dressGroup.add(dressMesh);

    // Cap sleeves for dress
    [-1, 1].forEach((dir) => {
      const capSleeveGeo = new THREE.CylinderGeometry(0.072, 0.068, 0.14, 24);
      const capSleeve = new THREE.Mesh(capSleeveGeo, dressMat);
      capSleeve.position.set(dir * (shoulderX + 0.01), 0.94, 0);
      capSleeve.rotation.z = dir * -0.14;
      dressGroup.add(capSleeve);
    });

    avatarGroup.add(dressGroup);
    garmentRefs.current.dressGroup = dressGroup;
    garmentRefs.current.dressMat = dressMat;

    // 4. LAYERED OUTERWEAR JACKET / BLAZER GROUP (Image 2 style with open front, lapels & full sleeves)
    const outerwearGroup = new THREE.Group();
    const outerwearMat = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.48,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    // Open-front tailored jacket shell (thetaLength < 2*PI leaves front zipper/lapel opening!)
    const jacketProfile: THREE.Vector2[] = [
      new THREE.Vector2(0.245, 0.14),  // Jacket hem
      new THREE.Vector2(0.215, 0.36),  // Waist taper
      new THREE.Vector2(0.258, 0.58),  // Chest
      new THREE.Vector2(0.278, 0.75),  // Shoulders
      new THREE.Vector2(0.14, 0.845),  // Collar base
    ];
    // Start angle at 0.35 rad and sweep 2*PI - 0.7 rad so the front center shows the inner top!
    const jacketShellGeo = new THREE.LatheGeometry(
      jacketProfile,
      44,
      Math.PI * 0.62,
      Math.PI * 1.76
    );
    jacketShellGeo.scale(1.12, 1.0, 0.78);
    const jacketShell = new THREE.Mesh(jacketShellGeo, outerwearMat);
    jacketShell.position.set(0, 0.25, 0);
    jacketShell.castShadow = true;
    jacketShell.receiveShadow = true;
    outerwearGroup.add(jacketShell);

    // Structured Collar / Hood Rim
    const jacketCollarGeo = new THREE.TorusGeometry(0.125, 0.026, 16, 32, Math.PI * 1.45);
    const jacketCollar = new THREE.Mesh(jacketCollarGeo, outerwearMat);
    jacketCollar.rotation.x = Math.PI / 2 - 0.15;
    jacketCollar.rotation.z = Math.PI * 0.78;
    jacketCollar.position.set(0, 1.09, -0.01);
    outerwearGroup.add(jacketCollar);

    // Full-length tailored jacket sleeves + ribbed cuffs
    [-1, 1].forEach((dir) => {
      const jArmGroup = new THREE.Group();
      jArmGroup.position.set(dir * (shoulderX + 0.012), 0.98, 0);
      jArmGroup.rotation.z = dir * -0.14;

      const jUpperGeo = new THREE.CylinderGeometry(0.078, 0.068, 0.36, 24);
      const jUpper = new THREE.Mesh(jUpperGeo, outerwearMat);
      jUpper.position.set(0, -0.17, 0);
      jUpper.castShadow = true;
      jArmGroup.add(jUpper);

      const jLowerGroup = new THREE.Group();
      jLowerGroup.position.set(0, -0.34, 0);
      jLowerGroup.rotation.x = 0.12;
      jLowerGroup.rotation.z = dir * 0.05;

      const jLowerGeo = new THREE.CylinderGeometry(0.066, 0.055, 0.29, 24);
      const jLower = new THREE.Mesh(jLowerGeo, outerwearMat);
      jLower.position.set(0, -0.14, 0);
      jLower.castShadow = true;
      jLowerGroup.add(jLower);

      jArmGroup.add(jLowerGroup);
      outerwearGroup.add(jArmGroup);
    });

    avatarGroup.add(outerwearGroup);
    garmentRefs.current.outerwearGroup = outerwearGroup;
    garmentRefs.current.outerwearMat = outerwearMat;

    // 5. DETAILED 3D SNEAKERS / FOOTWEAR GROUP (Image 2 & 3 style with white midsole, upper & tongue)
    const shoesGroup = new THREE.Group();
    const shoesMat = new THREE.MeshStandardMaterial({
      color: 0x3c2f2f,
      roughness: 0.38,
      metalness: 0.12,
    });
    const soleMat = new THREE.MeshStandardMaterial({
      color: 0xf8f6f2,
      roughness: 0.5,
    });

    [-1, 1].forEach((dir) => {
      const shoeItem = new THREE.Group();
      shoeItem.position.set(dir * 0.118, -0.66, 0.035);

      // Thick sculpted white sneaker midsole
      const soleGeo = new THREE.BoxGeometry(0.115, 0.042, 0.25);
      const sole = new THREE.Mesh(soleGeo, soleMat);
      sole.position.set(0, -0.025, 0.015);
      sole.castShadow = true;
      shoeItem.add(sole);

      // Rounded toe cap
      const toeGeo = new THREE.SphereGeometry(0.058, 20, 16);
      toeGeo.scale(1.0, 0.65, 1.35);
      const toe = new THREE.Mesh(toeGeo, soleMat);
      toe.position.set(0, -0.012, 0.11);
      shoeItem.add(toe);

      // Main colored shoe upper
      const upperGeo = new THREE.CylinderGeometry(0.055, 0.062, 0.095, 24);
      upperGeo.scale(1.0, 1.0, 1.65);
      const upper = new THREE.Mesh(upperGeo, shoesMat);
      upper.position.set(0, 0.025, 0.0);
      upper.castShadow = true;
      shoeItem.add(upper);

      // Padded sneaker tongue
      const tongueGeo = new THREE.BoxGeometry(0.06, 0.065, 0.022);
      const tongue = new THREE.Mesh(tongueGeo, shoesMat);
      tongue.position.set(0, 0.065, 0.055);
      tongue.rotation.x = -0.35;
      shoeItem.add(tongue);

      shoesGroup.add(shoeItem);
    });

    avatarGroup.add(shoesGroup);
    garmentRefs.current.shoesGroup = shoesGroup;
    garmentRefs.current.shoesMat = shoesMat;

    // 6. ACCESSORIES (Golden Pendant Necklace + Designer Crossbody / Earrings)
    const accessoryGroup = new THREE.Group();
    const accessoryMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.18,
      metalness: 0.88,
    });

    // Layered Necklace Chain
    const necklaceGeo = new THREE.TorusGeometry(0.105, 0.008, 16, 40);
    const necklace = new THREE.Mesh(necklaceGeo, accessoryMat);
    necklace.rotation.x = Math.PI / 2 + 0.18;
    necklace.position.set(0, 1.06, 0.018);
    accessoryGroup.add(necklace);

    // Golden Star Pendant
    const pendantGeo = new THREE.OctahedronGeometry(0.024, 0);
    const pendant = new THREE.Mesh(pendantGeo, accessoryMat);
    pendant.position.set(0, 1.02, 0.125);
    accessoryGroup.add(pendant);

    // Hoop Earrings
    [-1, 1].forEach((dir) => {
      const hoopGeo = new THREE.TorusGeometry(0.024, 0.004, 12, 24);
      const hoop = new THREE.Mesh(hoopGeo, accessoryMat);
      hoop.rotation.y = Math.PI / 2;
      hoop.position.set(dir * 0.195, 1.33, 0.0);
      accessoryGroup.add(hoop);
    });

    avatarGroup.add(accessoryGroup);
    garmentRefs.current.accessoryGroup = accessoryGroup;
    garmentRefs.current.accessoryMat = accessoryMat;
  };

  /**
   * Builds the 3D Stage Platform (Holographic Neon Rings like Image 2 vs Warm Atelier)
   */
  const buildStageEnvironment = (preset: StagePreset) => {
    const scene = sceneRef.current;
    const stageGroup = stageGroupRef.current;
    if (!scene || !stageGroup) return;

    while (stageGroup.children.length > 0) {
      stageGroup.remove(stageGroup.children[0]);
    }

    if (preset === 'hologram') {
      // Dark futuristic MEFE AVATAR STUDIO stage matching Image 2
      scene.background = new THREE.Color('#0E101D');

      // Dark reflective floor disc
      const floorGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.08, 64);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x121526,
        roughness: 0.25,
        metalness: 0.6,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.set(0, -0.73, 0);
      floor.receiveShadow = true;
      stageGroup.add(floor);

      // Concentric glowing cyan & magenta holographic rings (exact match to Image 2)
      const ringSpecs = [
        { r: 0.65, tube: 0.015, color: 0x38bdf8 },
        { r: 0.92, tube: 0.012, color: 0xe879f9 },
        { r: 1.22, tube: 0.018, color: 0x22d3ee },
        { r: 1.52, tube: 0.012, color: 0xf43f5e },
        { r: 1.85, tube: 0.016, color: 0x38bdf8 },
      ];
      ringSpecs.forEach((spec) => {
        const rGeo = new THREE.TorusGeometry(spec.r, spec.tube, 16, 96);
        const rMat = new THREE.MeshBasicMaterial({
          color: spec.color,
        });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, -0.685, 0);
        stageGroup.add(ring);
      });
    } else if (preset === 'atelier') {
      scene.background = new THREE.Color('#F5ECE2');
      const pedGeo = new THREE.CylinderGeometry(1.15, 1.28, 0.14, 64);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0xe6d7c8,
        roughness: 0.4,
        metalness: 0.1,
      });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.set(0, -0.76, 0);
      ped.receiveShadow = true;
      stageGroup.add(ped);

      const goldRimGeo = new THREE.TorusGeometry(1.16, 0.018, 16, 96);
      const goldRimMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: 0.8,
      });
      const goldRim = new THREE.Mesh(goldRimGeo, goldRimMat);
      goldRim.rotation.x = Math.PI / 2;
      goldRim.position.set(0, -0.69, 0);
      stageGroup.add(goldRim);
    } else {
      scene.background = new THREE.Color('#1B1618');
      const runwayGeo = new THREE.CylinderGeometry(1.3, 1.4, 0.12, 64);
      const runwayMat = new THREE.MeshStandardMaterial({
        color: 0x2a201f,
        roughness: 0.3,
        metalness: 0.4,
      });
      const runway = new THREE.Mesh(runwayGeo, runwayMat);
      runway.position.set(0, -0.75, 0);
      runway.receiveShadow = true;
      stageGroup.add(runway);

      const warmRimGeo = new THREE.TorusGeometry(1.31, 0.02, 16, 96);
      const warmRimMat = new THREE.MeshBasicMaterial({ color: 0xe2725b });
      const warmRim = new THREE.Mesh(warmRimGeo, warmRimMat);
      warmRim.rotation.x = Math.PI / 2;
      warmRim.position.set(0, -0.69, 0);
      stageGroup.add(warmRim);
    }
  };

  /**
   * Initialize Three.js WebGL Scene, Studio Lights & Animation Loop
   */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.55, 4.2);
    camera.lookAt(0, 0.35, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4-Point Studio Portrait & Full-Body Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff8f0, 0x2a2438, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5eb, 1.85);
    keyLight.position.set(2.6, 3.8, 3.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
    fillLight.position.set(-2.8, 2.0, 2.2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xe879f9, 1.35, 10);
    rimLight.position.set(0, 2.4, -2.5);
    scene.add(rimLight);

    // Groups
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);
    stageGroupRef.current = stageGroup;

    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;

    buildStageEnvironment(stagePreset);
    buildStylizedCharacter(bodyArchetype);

    // Animation Loop
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (avatarGroupRef.current) {
        if (autoRotateRef.current && !isDraggingRef.current) {
          targetRotationYRef.current += 0.0045;
        }
        avatarGroupRef.current.rotation.y +=
          (targetRotationYRef.current - avatarGroupRef.current.rotation.y) * 0.1;

        // Subtle lifelike breathing motion
        avatarGroupRef.current.position.y = Math.sin(elapsed * 2.1) * 0.012;
      }

      // Smooth camera interpolation for Full Body / Outfit / Portrait Close-Up
      if (cameraRef.current) {
        cameraRef.current.position.z +=
          (cameraPosZRef.current - cameraRef.current.position.z) * 0.12;
        cameraRef.current.position.y +=
          (cameraTargetYRef.current + 0.15 - cameraRef.current.position.y) * 0.12;
        cameraRef.current.lookAt(0, cameraTargetYRef.current, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  // Rebuild character when archetype changes
  useEffect(() => {
    buildStylizedCharacter(bodyArchetype);
  }, [bodyArchetype]);

  // Rebuild stage when stage preset changes
  useEffect(() => {
    buildStageEnvironment(stagePreset);
  }, [stagePreset]);

  // Update Camera Presets (Full Body vs Outfit vs Face Portrait like Image 4)
  useEffect(() => {
    if (cameraPreset === 'portrait') {
      cameraTargetYRef.current = 1.36;
      cameraPosZRef.current = 1.45;
      setZoomLevel(1.45);
    } else if (cameraPreset === 'outfit') {
      cameraTargetYRef.current = 0.45;
      cameraPosZRef.current = 2.95;
      setZoomLevel(2.95);
    } else {
      cameraTargetYRef.current = 0.35;
      cameraPosZRef.current = 4.2;
      setZoomLevel(4.2);
    }
  }, [cameraPreset]);

  // Update Skin Tone, Hair Color, Eye Color & Hair Style live
  useEffect(() => {
    const skinObj = SKIN_TONES.find((s) => s.hex === skinTone) || SKIN_TONES[1];
    skinMaterialsRef.current.forEach((mat) => {
      mat.color.set(skinTone);
      mat.needsUpdate = true;
    });
    lipMaterialsRef.current.forEach((mat) => {
      mat.color.set(skinObj.lipHex);
      mat.needsUpdate = true;
    });
  }, [skinTone]);

  useEffect(() => {
    hairMaterialsRef.current.forEach((mat) => {
      mat.color.set(hairColor);
      mat.needsUpdate = true;
    });
  }, [hairColor]);

  useEffect(() => {
    const eyeObj = EYE_COLORS.find((e) => e.id === eyeColorId) || EYE_COLORS[0];
    const newIrisTex = createIrisTexture(eyeObj.hex, eyeObj.innerHex);
    irisMaterialsRef.current.forEach((mat) => {
      mat.map = newIrisTex;
      mat.needsUpdate = true;
    });
  }, [eyeColorId, bodyArchetype]);

  useEffect(() => {
    (Object.keys(hairVariantGroupsRef.current) as HairStyleId[]).forEach((key) => {
      const grp = hairVariantGroupsRef.current[key];
      if (grp) {
        grp.visible = key === hairStyle;
      }
    });
  }, [hairStyle, bodyArchetype]);

  const getItemColorHex = (item: ClosetItem | null | undefined, fallback = '#E2725B'): string => {
    const raw = item?.colors?.[0];
    if (!raw) return fallback;
    if (raw.startsWith('#')) return raw;
    const map: Record<string, string> = {
      terracotta: '#E2725B',
      red: '#C84B31',
      rust: '#B3541E',
      cream: '#F5EBE1',
      beige: '#E8D8C8',
      white: '#F8F6F2',
      black: '#1E1A18',
      cocoa: '#3C2F2F',
      brown: '#5C4033',
      camel: '#C19A6B',
      tan: '#D2B48C',
      gold: '#D4AF37',
      navy: '#25364A',
      blue: '#3B6998',
      denim: '#4A6B82',
      sage: '#7A9A8B',
      emerald: '#2D6A4F',
      green: '#4F772D',
      olive: '#606C38',
      blush: '#E5989B',
      pink: '#D8839A',
      lavender: '#9D8189',
    };
    const key = raw.toLowerCase().trim();
    for (const [k, hex] of Object.entries(map)) {
      if (key.includes(k)) return hex;
    }
    return fallback;
  };

  /**
   * Helper: Applies a ClosetItem (or custom uploaded photo) onto a 3D Garment Material
   * Uses an HTMLImageElement with crossOrigin='anonymous' and falls back cleanly if CORS blocks raw pixels
   */
  const applyItemTextureToMaterial = (
    mat: THREE.MeshStandardMaterial | null,
    item: ClosetItem | null,
    overridePhotoUrl?: string | null
  ) => {
    if (!mat) return;
    if (!item && !overridePhotoUrl) {
      mat.map = null;
      mat.needsUpdate = true;
      return;
    }

    const baseColor = getItemColorHex(item, '#E2725B');
    const itemName = item?.name || 'Custom Design';
    const imgUrl = overridePhotoUrl || item?.transparentPngUrl || item?.imageUrl;

    // Set immediate fallback canvas texture first so there is zero delay
    mat.color.set('#FFFFFF');
    mat.map = buildGarmentCanvasTexture(baseColor, itemName, textureWrapMode, null);
    mat.needsUpdate = true;

    if (imgUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const richTex = buildGarmentCanvasTexture(
          baseColor,
          itemName,
          textureWrapMode,
          img
        );
        mat.color.set('#FFFFFF');
        mat.map = richTex;
        mat.needsUpdate = true;
      };
      img.onerror = () => {
        // Fallback if remote URL disallows canvas read
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        loader.load(
          imgUrl,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            mat.color.set('#FFFFFF');
            mat.map = tex;
            mat.needsUpdate = true;
          },
          undefined,
          () => {
            mat.color.set(baseColor);
            mat.needsUpdate = true;
          }
        );
      };
      img.src = imgUrl;
    }
  };

  /**
   * Synchronize equipped Closet Items & Custom Photo Try-On with the 3D Garment Meshes
   */
  useEffect(() => {
    const refs = garmentRefs.current;

    // 1. Dress vs Top + Bottom visibility
    const hasCustomDress = customTryOnPhoto?.targetSlot === 'dress';
    const showDress = Boolean(selectedDress || hasCustomDress);

    if (refs.dressGroup) {
      refs.dressGroup.visible = showDress;
      if (showDress) {
        applyItemTextureToMaterial(
          refs.dressMat,
          selectedDress,
          hasCustomDress ? customTryOnPhoto?.dataUrl : null
        );
      }
    }

    if (refs.topGroup) {
      const hasCustomTop = customTryOnPhoto?.targetSlot === 'tops';
      const showTop = !showDress && Boolean(selectedTop || hasCustomTop);
      refs.topGroup.visible = showTop;
      if (showTop) {
        applyItemTextureToMaterial(
          refs.topMat,
          selectedTop,
          hasCustomTop ? customTryOnPhoto?.dataUrl : null
        );
      }
    }

    if (refs.bottomGroup) {
      const hasCustomBottom = customTryOnPhoto?.targetSlot === 'bottoms';
      const showBottom = !showDress && Boolean(selectedBottom || hasCustomBottom);
      refs.bottomGroup.visible = showBottom;
      if (showBottom) {
        applyItemTextureToMaterial(
          refs.bottomMat,
          selectedBottom,
          hasCustomBottom ? customTryOnPhoto?.dataUrl : null
        );
      }
    }

    // 2. Outerwear Jacket
    if (refs.outerwearGroup) {
      const hasCustomOuter = customTryOnPhoto?.targetSlot === 'outerwear';
      const showOuter = Boolean(selectedOuterwear || hasCustomOuter);
      refs.outerwearGroup.visible = showOuter;
      if (showOuter) {
        applyItemTextureToMaterial(
          refs.outerwearMat,
          selectedOuterwear,
          hasCustomOuter ? customTryOnPhoto?.dataUrl : null
        );
      }
    }

    // 3. Shoes
    if (refs.shoesGroup && refs.shoesMat) {
      refs.shoesGroup.visible = Boolean(selectedShoes);
      if (selectedShoes) {
        refs.shoesMat.color.set(getItemColorHex(selectedShoes, '#3C2F2F'));
        refs.shoesMat.needsUpdate = true;
      }
    }

    // 4. Accessories
    if (refs.accessoryGroup && refs.accessoryMat) {
      refs.accessoryGroup.visible = Boolean(selectedAccessory);
      if (selectedAccessory) {
        refs.accessoryMat.color.set(getItemColorHex(selectedAccessory, '#D4AF37'));
        refs.accessoryMat.needsUpdate = true;
      }
    }
  }, [
    selectedTop,
    selectedBottom,
    selectedDress,
    selectedOuterwear,
    selectedShoes,
    selectedAccessory,
    customTryOnPhoto,
    textureWrapMode,
    bodyArchetype,
  ]);

  // Pointer Drag Handlers for 360° Rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMouseXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMouseXRef.current;
    previousMouseXRef.current = e.clientX;
    targetRotationYRef.current += deltaX * 0.012;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(1.3, Math.min(5.6, +(prev + delta).toFixed(2)));
      cameraPosZRef.current = next;
      return next;
    });
  };

  // Equip or unequip a ClosetItem and immediately show feedback on the 3D Avatar
  const handleSelectClosetItem = (item: ClosetItem) => {
    setCustomTryOnPhoto(null);
    setLastEquippedLabel(item.name);

    switch (item.category) {
      case 'tops':
        setSelectedDress(null);
        setSelectedTop((prev) => (prev?.itemId === item.itemId ? null : item));
        break;
      case 'bottoms':
        setSelectedDress(null);
        setSelectedBottom((prev) => (prev?.itemId === item.itemId ? null : item));
        break;
      case 'dresses':
        setSelectedDress((prev) => {
          const next = prev?.itemId === item.itemId ? null : item;
          if (next) {
            setSelectedTop(null);
            setSelectedBottom(null);
          }
          return next;
        });
        break;
      case 'outerwear':
        setSelectedOuterwear((prev) => (prev?.itemId === item.itemId ? null : item));
        break;
      case 'shoes':
        setSelectedShoes((prev) => (prev?.itemId === item.itemId ? null : item));
        break;
      case 'accessories':
        setSelectedAccessory((prev) => (prev?.itemId === item.itemId ? null : item));
        break;
    }
  };

  // Upload any clothing photo from device to wrap directly onto the 3D Avatar (like Image 3)
  const handleUploadPhotoTryOn = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const slot: 'dress' | 'tops' | 'outerwear' | 'bottoms' =
        activeCategoryTab === 'dresses'
          ? 'dress'
          : activeCategoryTab === 'outerwear'
          ? 'outerwear'
          : activeCategoryTab === 'bottoms'
          ? 'bottoms'
          : 'dress'; // Default to full dress/outfit wrap like Image 3 if on shoes/accessories
      if (slot === 'dress') {
        setSelectedTop(null);
        setSelectedBottom(null);
      }
      setCustomTryOnPhoto({
        dataUrl,
        targetSlot: slot,
        label: file.name.replace(/\.[^.]+$/, ''),
      });
      setLastEquippedLabel(`Custom Photo: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Import custom .glb / .gltf 3D character model (Blender / ReadyPlayerMe compatible)
  const handleImportGltfModel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !avatarGroupRef.current) return;

    const url = URL.createObjectURL(file);
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const avatarGroup = avatarGroupRef.current;
        if (!avatarGroup) return;

        if (customGltfRef.current) {
          avatarGroup.remove(customGltfRef.current);
        }

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 2.25 / Math.max(size.y, 0.01);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -box.min.y * scale - 0.68, -center.z * scale);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        avatarGroup.add(model);
        customGltfRef.current = model;
        setCustomModelName(file.name);
        URL.revokeObjectURL(url);
      },
      undefined,
      () => {
        URL.revokeObjectURL(url);
      }
    );
  };

  // Snapshot Download
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `mefe-3d-avatar-${Date.now()}.png`;
    a.click();
  };

  // Save current 3D Avatar Look as an Outfit
  const handleSaveCurrentLook = () => {
    if (!onSaveOutfit) return;
    const equippedIds = [
      selectedTop?.itemId,
      selectedBottom?.itemId,
      selectedDress?.itemId,
      selectedOuterwear?.itemId,
      selectedShoes?.itemId,
      selectedAccessory?.itemId,
    ].filter(Boolean) as string[];

    if (equippedIds.length === 0) return;

    const canvasImage = rendererRef.current?.domElement.toDataURL('image/png') || null;
    onSaveOutfit({
      userId: user.uid,
      name: outfitTitle.trim() || `3D Studio Look (${new Date().toLocaleDateString()})`,
      itemIds: equippedIds,
      moodTarget: 'Confident & Empowered',
      scheduledDates: [new Date().toISOString().split('T')[0]],
      avatarCanvasState: {},
      previewImageUrl: canvasImage,
    });
    setOutfitTitle('');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const equippedCount = [
    selectedTop,
    selectedBottom,
    selectedDress,
    selectedOuterwear,
    selectedShoes,
    selectedAccessory,
  ].filter(Boolean).length;

  const filteredClosetItems = closetItems.filter(
    (item) => item.category === activeCategoryTab
  );

  return (
    <div className="pb-24 pt-2 space-y-5">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-[#121526] via-[#1E1B2E] to-cocoa-900 rounded-3xl p-5 text-white shadow-warm-lg relative overflow-hidden border border-cyan-500/20">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <img
              src="./mefe-logo.jpg"
              alt="MEFE"
              className="w-12 h-12 rounded-2xl object-cover border border-amber-300/60 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  Interactive 3D Character Studio
                </span>
                <span className="text-[10px] text-amber-300 font-semibold">
                  • Live Texture Wrap
                </span>
              </div>
              <h1 className="font-display font-bold text-xl sm:text-2xl mt-0.5 tracking-wide">
                MEFE AVATAR STUDIO
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Upload Any Photo to Wrap on Avatar */}
            <input
              ref={photoTryOnInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadPhotoTryOn}
              className="hidden"
            />
            <button
              onClick={() => photoTryOnInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-terracotta transition-all"
              title="Upload any clothing photo or pattern to see it wrapped on the 3D avatar"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Try Photo on Avatar</span>
            </button>

            {/* Optional Blender / ReadyPlayerMe .GLB Import */}
            <input
              ref={gltfInputRef}
              type="file"
              accept=".glb,.gltf"
              onChange={handleImportGltfModel}
              className="hidden"
            />
            <button
              onClick={() => gltfInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15"
              title="Import a custom Blender or ReadyPlayerMe .glb/.gltf 3D character"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-300" />
              <span>Import .GLB</span>
            </button>

            <button
              onClick={handleCaptureSnapshot}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Snapshot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: 3D Holographic Stage (Left) + Customization & Closet Try-On (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Columns: Interactive 3D Viewport */}
        <div className="lg:col-span-7 bg-[#0E101D] rounded-3xl border border-cocoa-800/80 shadow-warm-lg overflow-hidden flex flex-col">
          {/* Top Neon Stage Header & Camera Angle Presets */}
          <div className="px-4 py-3 bg-[#14182B] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCameraPreset('full')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  cameraPreset === 'full'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                Full Stage
              </button>
              <button
                onClick={() => setCameraPreset('outfit')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  cameraPreset === 'outfit'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                Outfit Focus
              </button>
              <button
                onClick={() => setCameraPreset('portrait')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  cameraPreset === 'portrait'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Face Close-Up</span>
              </button>
            </div>

            {/* Stage Backdrop Switcher */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'hologram', label: 'Neon Studio' },
                  { id: 'atelier', label: 'Warm Atelier' },
                  { id: 'runway', label: 'Runway' },
                ] as { id: StagePreset; label: string }[]
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStagePreset(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    stagePreset === st.id
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3D WebGL Viewport Container */}
          <div className="relative w-full h-[500px] sm:h-[550px] select-none">
            {/* Glowing "MEFE AVATAR STUDIO" Stage Marquee (Matching Image 2) */}
            {stagePreset === 'hologram' && (
              <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none z-10">
                <div className="px-5 py-1.5 rounded-2xl bg-[#0B0E1A]/80 backdrop-blur-md border border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.28)]">
                  <span className="font-display font-extrabold text-xs sm:text-sm tracking-[0.22em] bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-transparent">
                    MEFE AVATAR STUDIO
                  </span>
                </div>
              </div>
            )}

            <div
              ref={mountRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />

            {/* Floating Camera & Rotation Controls */}
            <div className="absolute top-14 right-3 flex flex-col gap-1.5 z-10">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2.5 rounded-xl backdrop-blur-md border shadow-sm transition-all ${
                  autoRotate
                    ? 'bg-terracotta-500 text-white border-terracotta-400'
                    : 'bg-slate-900/80 text-white border-white/15 hover:bg-slate-800'
                }`}
                title={autoRotate ? 'Pause 360° Turntable' : 'Start 360° Turntable'}
              >
                {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleZoom(-0.45)}
                className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white border border-white/15 shadow-sm hover:bg-slate-800 transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleZoom(0.45)}
                className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white border border-white/15 shadow-sm hover:bg-slate-800 transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  targetRotationYRef.current = 0;
                  setCameraPreset('full');
                }}
                className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white border border-white/15 shadow-sm hover:bg-slate-800 transition-all"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Active Item Texture Badge */}
            {(lastEquippedLabel || customModelName) && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15 text-white text-[11px] z-10">
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold truncate">
                    {customModelName
                      ? `Custom 3D Model: ${customModelName}`
                      : `Viewing on 3D Avatar: ${lastEquippedLabel}`}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-300 font-bold ml-2 shrink-0">
                  Drag to rotate 360°
                </span>
              </div>
            )}
          </div>

          {/* Save 3D Outfit Bar */}
          {onSaveOutfit && (
            <div className="p-4 bg-white border-t border-warm-border flex flex-col sm:flex-row gap-2.5 items-center">
              <input
                type="text"
                value={outfitTitle}
                onChange={(e) => setOutfitTitle(e.target.value)}
                placeholder="Name this 3D Avatar look (e.g., Friday Night Fit)..."
                className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-warm-50 border border-warm-border text-xs text-cocoa-900 focus:outline-none focus:border-terracotta-400"
              />
              <button
                onClick={handleSaveCurrentLook}
                disabled={equippedCount === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white font-bold text-xs shadow-terracotta transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Save 3D Look to Outfits</span>
              </button>
            </div>
          )}

          {savedToast && (
            <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold text-center">
              3D Avatar Look saved with snapshot to your Outfits & Calendar!
            </div>
          )}
        </div>

        {/* Right 5 Columns: Character Sculpt, Hair/Eyes, Texture Wrap Mode & Closet Items */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Character Face, Hair & Body Customization */}
          <div className="bg-white rounded-3xl p-4 border border-warm-border shadow-warm-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-terracotta-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-cocoa-800">
                  3D Character Sculpt & Features
                </h3>
              </div>
              {/* Archetype Toggle */}
              <div className="flex bg-warm-100 p-0.5 rounded-xl">
                <button
                  onClick={() => setBodyArchetype('feminine')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    bodyArchetype === 'feminine'
                      ? 'bg-white text-cocoa-900 shadow-sm'
                      : 'text-cocoa-500'
                  }`}
                >
                  Feminine
                </button>
                <button
                  onClick={() => setBodyArchetype('streetwear')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    bodyArchetype === 'streetwear'
                      ? 'bg-white text-cocoa-900 shadow-sm'
                      : 'text-cocoa-500'
                  }`}
                >
                  Streetwear
                </button>
              </div>
            </div>

            {/* 3D Hairstyle Selector */}
            <div>
              <p className="text-[11px] font-semibold text-cocoa-500 mb-1.5">3D Sculpted Hairstyle</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'center_part', label: 'Sleek Part' },
                    { id: 'glamour_waves', label: 'Glam Waves' },
                    { id: 'swept_quiff', label: 'Swept Quiff' },
                    { id: 'sleek_bob', label: 'Chic Bob' },
                  ] as { id: HairStyleId; label: string }[]
                ).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setHairStyle(style.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      hairStyle === style.id
                        ? 'bg-terracotta-500 text-white border-terracotta-500 shadow-sm'
                        : 'bg-warm-50 text-cocoa-700 border-warm-border hover:bg-warm-100'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone, Hair Color & Eye Iris Color */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <p className="text-[10px] font-bold uppercase text-cocoa-400 mb-1.5">Skin Tone</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSkinTone(tone.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        skinTone === tone.hex
                          ? 'border-terracotta-500 scale-110 ring-2 ring-terracotta-200'
                          : 'border-white shadow-sm'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                      title={tone.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-cocoa-400 mb-1.5">Hair Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.id}
                      onClick={() => setHairColor(hc.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        hairColor === hc.hex
                          ? 'border-terracotta-500 scale-110 ring-2 ring-terracotta-200'
                          : 'border-white shadow-sm'
                      }`}
                      style={{ backgroundColor: hc.hex }}
                      title={hc.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-cocoa-400 mb-1.5">Eye Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {EYE_COLORS.map((ec) => (
                    <button
                      key={ec.id}
                      onClick={() => setEyeColorId(ec.id)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        eyeColorId === ec.id
                          ? 'border-terracotta-500 scale-110 ring-2 ring-terracotta-200'
                          : 'border-white shadow-sm'
                      }`}
                      style={{
                        background: `radial-gradient(circle, ${ec.innerHex} 30%, ${ec.hex} 90%)`,
                      }}
                      title={ec.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Garment Texture Projection Mode & Closet Picker */}
          <div className="bg-white rounded-3xl p-4 border border-warm-border shadow-warm-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-terracotta-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-cocoa-800">
                  Try Closet Items on 3D Avatar
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-terracotta-600">
                {equippedCount} Equipped
              </span>
            </div>

            {/* Garment Image Texture Wrap Mode */}
            <div className="bg-warm-50 p-2.5 rounded-2xl border border-warm-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-cocoa-700">
                <Wand2 className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                <span>Photo Wrap:</span>
              </div>
              <div className="flex gap-1">
                {(
                  [
                    { id: 'pattern_wrap', label: 'Full Pattern' },
                    { id: 'front_graphic', label: 'Front Print' },
                    { id: 'tinted_weave', label: 'Fabric Blend' },
                  ] as { id: TextureWrapMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setTextureWrapMode(m.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      textureWrapMode === m.id
                        ? 'bg-cocoa-900 text-white'
                        : 'bg-white text-cocoa-600 hover:bg-warm-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {(
                ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'] as ClothingCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryTab(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    activeCategoryTab === cat
                      ? 'bg-terracotta-500 text-white shadow-sm'
                      : 'bg-warm-100 text-cocoa-600 hover:bg-warm-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Closet Items Grid — Clicking ANY item wraps its photo & color onto the 3D Avatar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
              {filteredClosetItems.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-cocoa-400">
                  No items in <span className="font-bold capitalize">{activeCategoryTab}</span> yet.
                  Add items in My Closet or click <b>"Try Photo on Avatar"</b> above!
                </div>
              ) : (
                filteredClosetItems.map((item) => {
                  const isEquipped =
                    selectedTop?.itemId === item.itemId ||
                    selectedBottom?.itemId === item.itemId ||
                    selectedDress?.itemId === item.itemId ||
                    selectedOuterwear?.itemId === item.itemId ||
                    selectedShoes?.itemId === item.itemId ||
                    selectedAccessory?.itemId === item.itemId;

                  return (
                    <button
                      key={item.itemId}
                      onClick={() => handleSelectClosetItem(item)}
                      className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all ${
                        isEquipped
                          ? 'border-terracotta-500 ring-2 ring-terracotta-500/30 shadow-warm-md'
                          : 'border-warm-border hover:border-cocoa-300 bg-warm-50'
                      }`}
                    >
                      <div className="aspect-square w-full bg-warm-100 overflow-hidden relative">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isEquipped && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span
                          className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: getItemColorHex(item) }}
                        />
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-[11px] font-bold text-cocoa-900 truncate">{item.name}</p>
                        <p className="text-[9px] text-terracotta-600 font-semibold truncate">
                          {isEquipped ? 'Wearing on 3D Avatar' : 'Click to try on 3D'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
