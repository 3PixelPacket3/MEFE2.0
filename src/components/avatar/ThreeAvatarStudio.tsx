import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Save,
  ArrowLeft,
  RotateCcw,
  Camera,
  Layers,
  Check,
  X,
  Palette,
  Maximize2
} from 'lucide-react';
import { ClosetItem, ClothingCategory, Outfit, UserProfile } from '../../types';
import { useTranslation } from '../../i18n';
import { getCherStylistDialogue } from '../../services/analytics';
import { speechService } from '../../services/speech';

interface ThreeAvatarStudioProps {
  closetItems: ClosetItem[];
  user: UserProfile;
  onSaveOutfit: (outfit: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const ThreeAvatarStudio: React.FC<ThreeAvatarStudioProps> = ({
  closetItems,
  user,
  onSaveOutfit,
  onClose
}) => {
  const { t, language } = useTranslation();

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Equipped clothing items
  const [equippedItems, setEquippedItems] = useState<{
    tops?: ClosetItem;
    bottoms?: ClosetItem;
    dresses?: ClosetItem;
    outerwear?: ClosetItem;
    shoes?: ClosetItem;
    accessories?: ClosetItem;
  }>({});

  // Active category tab for wardrobe rack
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>('tops');

  // Avatar customization
  const [skinTone, setSkinTone] = useState(user.avatarConfig.skinTone || '#E4B698');
  const [hairColor, setHairColor] = useState(user.avatarConfig.hairColor || '#3C2F2F');
  const [hairStyle, setHairStyle] = useState(user.avatarConfig.hairStyle || 'sleek_bob');

  // Viewport & Shading mode
  const [shadingMode, setShadingMode] = useState<'material' | 'solid' | 'wireframe'>('material');
  const [cameraView, setCameraView] = useState<'full' | 'upper' | 'lower'>('full');

  // Stylist voice & dialogue
  const [dialogue, setDialogue] = useState<string>(
    "Welcome to the 3D Clueless Fitting Studio! Pick any wardrobe item below to wrap and project it onto your 3D avatar."
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Save Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [moodTarget, setMoodTarget] = useState('High Confidence & Pure Radiance');
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);

  // Three.js instances ref
  const threeRefs = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    avatarGroup: THREE.Group;
    bodyMeshes: THREE.Mesh[];
    hairMesh: THREE.Mesh | null;
    garmentMeshes: {
      topMesh?: THREE.Mesh;
      bottomMesh?: THREE.Mesh;
      dressMesh?: THREE.Mesh;
      outerwearMesh?: THREE.Mesh;
      shoesMesh?: THREE.Mesh;
      accessoriesMesh?: THREE.Mesh;
    };
  } | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FAF6F0');

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.3, 3.8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio Lighting (Blender Studio Lighting setup)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Terracotta Rim Light for 90s aesthetic fashion contour
    const rimLight = new THREE.DirectionalLight(0xE2725B, 1.2);
    rimLight.position.set(-3, 2.5, -2);
    scene.add(rimLight);

    const softFill = new THREE.DirectionalLight(0xffe8dc, 0.6);
    softFill.position.set(0, -1, 2);
    scene.add(softFill);

    // Ground pedestal / shadow catcher
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xEFE6DC,
      roughness: 0.6,
      metalness: 0.1
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Subtle floor circular glow
    const glowGeo = new THREE.RingGeometry(1.3, 1.6, 48);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xE2725B, side: THREE.DoubleSide, opacity: 0.35, transparent: true });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.005;
    scene.add(glow);

    // 5. Construct 3D Fashion Mannequin
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    const bodyMeshes: THREE.Mesh[] = [];

    // Skin Material
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinTone),
      roughness: 0.65,
      metalness: 0.08,
    });

    // Head
    const headGeo = new THREE.SphereGeometry(0.16, 32, 28);
    headGeo.scale(0.9, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.position.set(0, 1.82, 0);
    headMesh.castShadow = true;
    avatarGroup.add(headMesh);
    bodyMeshes.push(headMesh);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.14, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.set(0, 1.66, 0);
    avatarGroup.add(neckMesh);
    bodyMeshes.push(neckMesh);

    // Torso (Fashion mannequin sculpted hourglass)
    const chestGeo = new THREE.CylinderGeometry(0.22, 0.17, 0.32, 32);
    chestGeo.scale(1.15, 1, 0.85);
    const chestMesh = new THREE.Mesh(chestGeo, skinMaterial);
    chestMesh.position.set(0, 1.44, 0);
    chestMesh.castShadow = true;
    avatarGroup.add(chestMesh);
    bodyMeshes.push(chestMesh);

    // Waist / Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.17, 0.23, 0.28, 32);
    pelvisGeo.scale(1.2, 1, 0.9);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, skinMaterial);
    pelvisMesh.position.set(0, 1.16, 0);
    pelvisMesh.castShadow = true;
    avatarGroup.add(pelvisMesh);
    bodyMeshes.push(pelvisMesh);

    // Arms
    const createArm = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      const upperGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.38, 20);
      const upper = new THREE.Mesh(upperGeo, skinMaterial);
      upper.position.y = -0.18;
      armGroup.add(upper);
      bodyMeshes.push(upper);

      const lowerGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.35, 20);
      const lower = new THREE.Mesh(lowerGeo, skinMaterial);
      lower.position.y = -0.48;
      armGroup.add(lower);
      bodyMeshes.push(lower);

      const sign = isLeft ? -1 : 1;
      armGroup.position.set(sign * 0.28, 1.55, 0);
      armGroup.rotation.z = sign * 0.12;
      armGroup.rotation.x = -0.05;
      return armGroup;
    };
    avatarGroup.add(createArm(true));
    avatarGroup.add(createArm(false));

    // Legs
    const createLeg = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      const thighGeo = new THREE.CylinderGeometry(0.09, 0.065, 0.52, 24);
      const thigh = new THREE.Mesh(thighGeo, skinMaterial);
      thigh.position.y = -0.24;
      thigh.castShadow = true;
      legGroup.add(thigh);
      bodyMeshes.push(thigh);

      const calfGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.52, 24);
      const calf = new THREE.Mesh(calfGeo, skinMaterial);
      calf.position.y = -0.72;
      calf.castShadow = true;
      legGroup.add(calf);
      bodyMeshes.push(calf);

      // Foot
      const footGeo = new THREE.BoxGeometry(0.08, 0.06, 0.18);
      const foot = new THREE.Mesh(footGeo, skinMaterial);
      foot.position.set(0, -1.0, 0.04);
      legGroup.add(foot);
      bodyMeshes.push(foot);

      const sign = isLeft ? -1 : 1;
      legGroup.position.set(sign * 0.11, 1.05, 0);
      return legGroup;
    };
    avatarGroup.add(createLeg(true));
    avatarGroup.add(createLeg(false));

    // Hair Mesh
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: 0.5,
      metalness: 0.1
    });
    const hairGeo = new THREE.SphereGeometry(0.18, 32, 24);
    hairGeo.scale(1.05, 1.15, 1.1);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 1.88, -0.02);
    avatarGroup.add(hairMesh);

    threeRefs.current = {
      renderer,
      scene,
      camera,
      avatarGroup,
      bodyMeshes,
      hairMesh,
      garmentMeshes: {}
    };

    // Orbit Drag Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !threeRefs.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      threeRefs.current.avatarGroup.rotation.y += deltaX * 0.012;
      camera.position.y = Math.max(0.6, Math.min(2.2, camera.position.y - deltaY * 0.005));
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(1.8, Math.min(5.5, camera.position.z + e.deltaY * 0.003));
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !threeRefs.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (dom.parentElement) dom.parentElement.removeChild(dom);
      renderer.dispose();
    };
  }, []);

  // Update skin tone and hair color in real-time
  useEffect(() => {
    if (!threeRefs.current) return;
    const { bodyMeshes, hairMesh } = threeRefs.current;
    const col = new THREE.Color(skinTone);
    bodyMeshes.forEach(mesh => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color = col;
      }
    });
    if (hairMesh && hairMesh.material instanceof THREE.MeshStandardMaterial) {
      hairMesh.material.color = new THREE.Color(hairColor);
    }
  }, [skinTone, hairColor]);

  // Adjust Camera Views
  useEffect(() => {
    if (!threeRefs.current) return;
    const { camera } = threeRefs.current;
    if (cameraView === 'full') {
      camera.position.set(0, 1.3, 3.8);
      camera.lookAt(0, 1.1, 0);
    } else if (cameraView === 'upper') {
      camera.position.set(0, 1.55, 2.2);
      camera.lookAt(0, 1.5, 0);
    } else if (cameraView === 'lower') {
      camera.position.set(0, 0.75, 2.4);
      camera.lookAt(0, 0.6, 0);
    }
  }, [cameraView]);

  // Texture Helper: loads image from item URL or generates high-res canvas fabric pattern
  const createGarmentMaterial = (item: ClosetItem, colorHex?: string) => {
    const isWire = shadingMode === 'wireframe';
    const isSolid = shadingMode === 'solid';

    if (isWire) {
      return new THREE.MeshStandardMaterial({ wireframe: true, color: 0x3C2F2F });
    }

    const baseCol = colorHex || (
      item.colors.some(c => c.includes('terracotta') || c.includes('orange')) ? '#E2725B' :
      item.colors.some(c => c.includes('cocoa') || c.includes('brown')) ? '#3C2F2F' :
      item.colors.some(c => c.includes('amber') || c.includes('gold')) ? '#D4AF37' :
      item.colors.some(c => c.includes('indigo') || c.includes('blue')) ? '#2A4365' : '#EFE6DC'
    );

    // Create custom fabric texture canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base tone
    ctx.fillStyle = baseCol;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle luxury weave pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }
    for (let j = 0; j < 512; j += 8) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(512, j);
      ctx.stroke();
    }

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.RepeatWrapping;
    canvasTexture.repeat.set(3, 3);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(isSolid ? 0xDDDDDD : 0xFFFFFF),
      map: isSolid ? null : canvasTexture,
      roughness: 0.55,
      metalness: 0.12,
    });

    // Attempt to load photo texture directly
    if (!isSolid && item.imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(
        item.imageUrl,
        (loadedTex) => {
          loadedTex.wrapS = THREE.RepeatWrapping;
          loadedTex.wrapT = THREE.RepeatWrapping;
          loadedTex.repeat.set(1.5, 1.5);
          material.map = loadedTex;
          material.needsUpdate = true;
        },
        undefined,
        () => {
          // Fallback to high-res canvas fabric pattern on CORS restrictions
        }
      );
    }

    return material;
  };

  // Live 3D Garment Mesh Syncing: projects chosen items onto the 3D avatar
  useEffect(() => {
    if (!threeRefs.current) return;
    const { avatarGroup, garmentMeshes } = threeRefs.current;

    // Helper to replace mesh
    const updateMesh = (
      key: keyof typeof garmentMeshes,
      item: ClosetItem | undefined,
      createGeo: () => THREE.BufferGeometry,
      pos: [number, number, number],
      scale: [number, number, number] = [1, 1, 1]
    ) => {
      // Remove old
      if (garmentMeshes[key]) {
        avatarGroup.remove(garmentMeshes[key]!);
        garmentMeshes[key]?.geometry.dispose();
        delete garmentMeshes[key];
      }

      // Add new if equipped
      if (item) {
        const geo = createGeo();
        const mat = createGarmentMaterial(item);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pos);
        mesh.scale.set(...scale);
        mesh.castShadow = true;
        avatarGroup.add(mesh);
        garmentMeshes[key] = mesh;
      }
    };

    // 1. Top Mesh (Blazer / Turtleneck / Shirt)
    updateMesh(
      'topMesh',
      equippedItems.tops,
      () => {
        const geo = new THREE.CylinderGeometry(0.24, 0.185, 0.35, 32);
        geo.scale(1.2, 1, 0.92);
        return geo;
      },
      [0, 1.43, 0]
    );

    // 2. Bottom Mesh (Trousers / Denim)
    updateMesh(
      'bottomMesh',
      equippedItems.bottoms,
      () => {
        const groupGeo = new THREE.CylinderGeometry(0.21, 0.16, 0.72, 32);
        groupGeo.scale(1.15, 1, 0.95);
        return groupGeo;
      },
      [0, 0.88, 0]
    );

    // 3. Dress Mesh (Silk Slip / Midi)
    updateMesh(
      'dressMesh',
      equippedItems.dresses,
      () => {
        const dressGeo = new THREE.CylinderGeometry(0.23, 0.34, 0.92, 32);
        dressGeo.scale(1.15, 1, 0.9);
        return dressGeo;
      },
      [0, 1.15, 0]
    );

    // 4. Outerwear Mesh (Vintage Blazer / Trench)
    updateMesh(
      'outerwearMesh',
      equippedItems.outerwear,
      () => {
        const outGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.44, 32);
        outGeo.scale(1.25, 1, 0.98);
        return outGeo;
      },
      [0, 1.44, 0]
    );

    // 5. Shoes Mesh (Loafers / Heels)
    updateMesh(
      'shoesMesh',
      equippedItems.shoes,
      () => {
        const shoeGeo = new THREE.BoxGeometry(0.36, 0.08, 0.22);
        return shoeGeo;
      },
      [0, 0.05, 0.03]
    );

    // 6. Accessories Mesh (Gold Hoops / Jewelry)
    updateMesh(
      'accessoriesMesh',
      equippedItems.accessories,
      () => {
        const hoopGeo = new THREE.TorusGeometry(0.045, 0.008, 16, 32);
        return hoopGeo;
      },
      [0.17, 1.83, 0]
    );

  }, [equippedItems, shadingMode]);

  // Handle Equipping / Unequipping Clothing Item
  const handleToggleGarment = (item: ClosetItem) => {
    const cat = item.category as keyof typeof equippedItems;
    const isCurrentlyEquipped = equippedItems[cat]?.itemId === item.itemId;

    const nextEquipped = {
      ...equippedItems,
      [cat]: isCurrentlyEquipped ? undefined : item
    };
    setEquippedItems(nextEquipped);

    // Update dialogue with Cher fashion wisdom
    const equippedList = Object.values(nextEquipped).filter(Boolean) as ClosetItem[];
    if (equippedList.length > 0) {
      const speech = getCherStylistDialogue(
        equippedList.map(i => i.name),
        moodTarget,
        user.displayName
      );
      setDialogue(speech);
      handleSpeak(speech);
    }
  };

  const handleSpeak = (textToSpeak: string = dialogue) => {
    setIsSpeaking(true);
    speechService.speak(
      textToSpeak,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleStopSpeech = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  // Capture 3D Rendered Snapshot
  const handleCaptureSnapshot = () => {
    if (!threeRefs.current) return;
    const dataUrl = threeRefs.current.renderer.domElement.toDataURL('image/png');
    setSnapshotDataUrl(dataUrl);
    setIsSaveModalOpen(true);
  };

  const handleSaveOutfit = () => {
    const itemIds = Object.values(equippedItems)
      .filter((i): i is ClosetItem => Boolean(i))
      .map(i => i.itemId);

    if (itemIds.length === 0) return;

    onSaveOutfit({
      userId: user.uid,
      name: outfitName.trim() || '3D Styled Ensemble #' + Math.floor(Math.random() * 100),
      itemIds,
      moodTarget: moodTarget.trim() || 'Empowered & Iconic',
      scheduledDates: [new Date().toISOString().split('T')[0]],
      avatarCanvasState: {},
      previewImageUrl: snapshotDataUrl || Object.values(equippedItems)[0]?.imageUrl || null
    });

    setIsSaveModalOpen(false);
    onClose();
  };

  const categoryOptions: ClothingCategory[] = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
  const rackItems = closetItems.filter(i => i.category === activeCategory);
  const activeCount = Object.values(equippedItems).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-warm-bg flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Studio Header Bar */}
      <header className="p-3 sm:p-4 bg-white/95 border-b border-warm-border flex items-center justify-between shadow-warm-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-warm-100 text-cocoa-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-cocoa-900 leading-tight">
              3D Avatar Studio (Three.js Viewport)
            </h2>
            <p className="text-[11px] text-terracotta-600 font-semibold">
              Interactive 360° Mannequin • Real-Time Garment Mapping
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEquippedItems({})}
            className="p-2 rounded-xl text-cocoa-400 hover:text-cocoa-700 hover:bg-warm-100 text-xs font-semibold flex items-center gap-1"
            title="Reset All Layers"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCaptureSnapshot}
            disabled={activeCount === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-terracotta transition-all ${
              activeCount > 0
                ? 'bg-terracotta-500 hover:bg-terracotta-600 text-white'
                : 'bg-warm-200 text-cocoa-400 cursor-not-allowed'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Capture 3D Outfit</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side (Desktop) / Top 60% (Mobile): Interactive Three.js 3D Viewport */}
        <div className="flex-[3] relative bg-gradient-to-b from-warm-50 via-warm-100/50 to-warm-200/50 flex flex-col justify-between overflow-hidden">
          {/* Three.js Canvas Container */}
          <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

          {/* Top HUD: Camera Angles & Shading Modes (Blender Viewport style) */}
          <div className="relative z-10 p-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Camera Views */}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-warm-border shadow-sm pointer-events-auto">
              {(['full', 'upper', 'lower'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setCameraView(view)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-xl capitalize transition-all ${
                    cameraView === view
                      ? 'bg-cocoa-600 text-white shadow-sm'
                      : 'text-cocoa-600 hover:bg-warm-100'
                  }`}
                >
                  {view === 'full' ? 'Full Body' : view === 'upper' ? 'Torso' : 'Legs'}
                </button>
              ))}
            </div>

            {/* Shading / Render Modes */}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-warm-border shadow-sm pointer-events-auto">
              {(['material', 'solid', 'wireframe'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setShadingMode(mode)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-xl capitalize transition-all ${
                    shadingMode === mode
                      ? 'bg-terracotta-500 text-white shadow-terracotta'
                      : 'text-cocoa-600 hover:bg-warm-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Mannequin Customization Floating Bar (Skin & Hair) */}
          <div className="relative z-10 px-3 pb-2 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-warm-border shadow-sm pointer-events-auto text-[11px] font-semibold text-cocoa-700">
              <span className="text-cocoa-500">Skin:</span>
              {[
                { name: 'Porcelain', color: '#F8E4D9' },
                { name: 'Warm Ivory', color: '#E4B698' },
                { name: 'Terracotta', color: '#C98565' },
                { name: 'Rich Espresso', color: '#68402D' },
              ].map(tone => (
                <button
                  key={tone.color}
                  onClick={() => setSkinTone(tone.color)}
                  style={{ backgroundColor: tone.color }}
                  className={`w-4 h-4 rounded-full border ${
                    skinTone === tone.color ? 'ring-2 ring-terracotta-500 scale-110' : 'border-black/20'
                  }`}
                />
              ))}

              <span className="ml-2 text-cocoa-500">Hair:</span>
              {[
                { name: 'Cocoa', color: '#3C2F2F' },
                { name: 'Auburn', color: '#883A2D' },
                { name: 'Honey', color: '#C68B45' },
              ].map(hair => (
                <button
                  key={hair.color}
                  onClick={() => setHairColor(hair.color)}
                  style={{ backgroundColor: hair.color }}
                  className={`w-4 h-4 rounded-full border ${
                    hairColor === hair.color ? 'ring-2 ring-terracotta-500 scale-110' : 'border-black/20'
                  }`}
                />
              ))}
            </div>

            <span className="text-[10px] text-cocoa-400 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-warm-border pointer-events-auto">
              Drag to Orbit 360° • Scroll to Zoom
            </span>
          </div>

          {/* Cher Horowitz Stylist Speech Bubble & Voice Trigger */}
          <div className="relative z-10 m-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-warm-border shadow-warm-md flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-terracotta-100 flex items-center justify-center text-terracotta-600 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold text-terracotta-700 tracking-wide uppercase">
                  Cher 90s Stylist Advice
                </span>
                <span className="text-[10px] text-cocoa-400 font-medium">
                  Web Speech TTS
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-cocoa-800 leading-snug italic">
                "{dialogue}"
              </p>
            </div>

            <button
              onClick={() => (isSpeaking ? handleStopSpeech() : handleSpeak())}
              className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                isSpeaking
                  ? 'bg-cocoa-600 text-white animate-pulse'
                  : 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-terracotta'
              }`}
              title={isSpeaking ? t('stopVoice') : t('playVoice')}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right Side (Desktop) / Bottom 40% (Mobile): Wardrobe Rack with Live Projection */}
        <div className="flex-[2] bg-white border-t md:border-t-0 md:border-l border-warm-border flex flex-col overflow-hidden max-h-[45vh] md:max-h-none">
          {/* Active Equipped Garments Pill Summary */}
          <div className="p-3 border-b border-warm-border bg-warm-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-cocoa-800 uppercase tracking-wider">
              Equipped on 3D Avatar ({activeCount})
            </span>
            <span className="text-[11px] text-cocoa-400">
              Tap below to layer or remove
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-2.5 border-b border-warm-border overflow-x-auto no-scrollbar bg-white">
            {categoryOptions.map((cat) => {
              const count = closetItems.filter(i => i.category === cat).length;
              const isEquippedInCat = Boolean(equippedItems[cat]);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all flex items-center gap-1 ${
                    activeCategory === cat
                      ? 'bg-cocoa-600 text-white shadow-sm'
                      : 'bg-warm-50 hover:bg-warm-100 text-cocoa-600 border border-warm-border'
                  }`}
                >
                  <span>{cat} ({count})</span>
                  {isEquippedInCat && (
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Wardrobe Items Grid */}
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {rackItems.map((item) => {
              const isEquipped = equippedItems[item.category]?.itemId === item.itemId;
              return (
                <div
                  key={item.itemId}
                  onClick={() => handleToggleGarment(item)}
                  className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all aspect-square bg-warm-50 ${
                    isEquipped
                      ? 'border-terracotta-500 ring-2 ring-terracotta-500/50 shadow-terracotta scale-95'
                      : 'border-warm-border hover:border-terracotta-300'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/70 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                    <p className="text-[10px] font-bold truncate leading-tight">{item.name}</p>
                    <span className="text-[9px] text-terracotta-200 capitalize">
                      {item.emotionalTags[0]}
                    </span>
                  </div>

                  {isEquipped && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save 3D Outfit Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-warm-border">
            <h3 className="font-bold text-lg text-cocoa-900 mb-1">Save 3D Outfit Look</h3>
            <p className="text-xs text-cocoa-400 mb-3">
              Bundling your {activeCount} layered 3D wardrobe pieces
            </p>

            {snapshotDataUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-warm-border mb-3 bg-warm-100">
                <img
                  src={snapshotDataUrl}
                  alt="3D Viewport Render"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Outfit Title
                </label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g. 3D Executive Runway Chic"
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Target Emotional Vibe
                </label>
                <input
                  type="text"
                  value={moodTarget}
                  onChange={(e) => setMoodTarget(e.target.value)}
                  placeholder="e.g. High Confidence & Power"
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-100 font-bold text-xs text-cocoa-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOutfit}
                  className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta"
                >
                  Save to Outfits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
