import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterMode } from '../types/portfolio';

export type MiniKrishActionType = 'greet' | 'thumbsup' | 'wave' | 'jumpspin' | 'groove';

export interface MiniKrishActionSignal {
  type: MiniKrishActionType;
  nonce: number;
}

interface HeroMiniKrish3DProps {
  mode: CharacterMode;
  actionSignal: MiniKrishActionSignal | null;
  heroHovering?: boolean;
  onToyTap: (triggeredAction: MiniKrishActionType) => void;
}

const _targetHeadRot = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _pointerNdc = new THREE.Vector2();

function isSoftwareRenderer(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

function createFloralShirtTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm cream base matching Krish's floral shirt
  ctx.fillStyle = '#F2E5CF';
  ctx.fillRect(0, 0, 512, 512);

  // Delicate ink botanical leaves & blooms
  ctx.strokeStyle = '#3B3F46';
  ctx.fillStyle = '#535861';
  ctx.lineWidth = 2.2;

  const drawFlower = (cx: number, cy: number, s: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(s, s);
    for (let p = 0; p < 6; p++) {
      ctx.save();
      ctx.rotate((p / 6) * Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(10, -18, 0, -30);
      ctx.quadraticCurveTo(-10, -18, 0, 0);
      ctx.fillStyle = 'rgba(83, 88, 97, 0.16)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#2B2E35';
    ctx.fill();
    ctx.restore();
  };

  const drawLeafSprig = (cx: number, cy: number, s: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.quadraticCurveTo(4, 0, 0, -28);
    ctx.stroke();
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i === 0 ? -12 : 12, i * 11, 11, 4.5, i === 0 ? -0.5 : 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(66, 72, 80, 0.18)';
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  const motifs = [
    [68, 72, 0.85, 0.2],
    [195, 115, 0.95, 0.9],
    [340, 66, 0.8, 1.4],
    [455, 130, 0.9, 0.5],
    [115, 225, 1.0, 2.1],
    [268, 250, 0.82, 0.4],
    [405, 240, 0.95, 1.2],
    [55, 375, 0.88, 1.7],
    [195, 390, 0.92, 0.1],
    [335, 365, 1.0, 2.5],
    [455, 415, 0.84, 0.8],
    [130, 475, 0.78, 1.3],
    [290, 480, 0.85, 2.0],
  ];

  motifs.forEach(([x, y, s, r], idx) => {
    if (idx % 2 === 0) drawFlower(x, y, s, r);
    else drawLeafSprig(x, y, s, r);
  });

  // Button placket vertical seam
  ctx.strokeStyle = 'rgba(30, 30, 35, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, maxAniso || 1);
  texture.needsUpdate = true;
  return texture;
}

export function HeroMiniKrish3D({
  mode,
  actionSignal,
  heroHovering = false,
  onToyTap,
}: HeroMiniKrish3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const modeRef = useRef<CharacterMode>(mode);
  const heroHoveringRef = useRef<boolean>(heroHovering);
  heroHoveringRef.current = heroHovering;
  const onToyTapRef = useRef(onToyTap);
  onToyTapRef.current = onToyTap;

  const animRef = useRef({
    pointerX: 0,
    pointerY: 0,
    isHovered: false,
    characterHovered: false,
    isDragging: false,
    dragStartX: 0,
    dragSpinVel: 0,
    manualYaw: -0.14,
    jumpY: 0,
    jumpVel: 0,
    squash: 1,
    spinRemaining: 0,
    greetTimer: 0,
    thumbsPulseTimer: 0,
    waveTimer: 0,
    grooveTimer: 0,
    soundwaveTimer: 0,
    winkTimer: 0,
    blinkTimer: 2.0,
    blinkProgress: 0,
    wanderBlend: 1,
    hasGreetedTap: false,
  });

  const triggerPoseAction = (type: MiniKrishActionType) => {
    const a = animRef.current;
    if (type === 'greet') {
      a.greetTimer = 1.45;
      a.jumpVel = Math.max(a.jumpVel, 1.85);
      a.squash = 0.94;
      a.winkTimer = 0.24;
    } else if (type === 'thumbsup') {
      a.thumbsPulseTimer = 1.1;
      a.jumpVel = Math.max(a.jumpVel, 3.2);
      a.squash = 0.86;
      a.winkTimer = 0.42;
    } else if (type === 'wave') {
      a.waveTimer = 1.65;
      a.jumpVel = Math.max(a.jumpVel, 2.4);
    } else if (type === 'jumpspin') {
      a.jumpVel = 6.0;
      a.squash = 0.78;
      a.spinRemaining += Math.PI * 2;
      a.winkTimer = 0.35;
    } else if (type === 'groove') {
      a.grooveTimer = 2.8;
      a.jumpVel = Math.max(a.jumpVel, 2.5);
    }
    if (modeRef.current === 'campaigns') {
      a.soundwaveTimer = 1.3;
    }
  };

  useEffect(() => {
    modeRef.current = mode;
    const a = animRef.current;
    a.jumpVel = Math.max(a.jumpVel, 2.9);
    a.squash = 0.88;
    a.winkTimer = 0.35;
    if (mode === 'campaigns') {
      a.soundwaveTimer = 1.4;
    }
  }, [mode]);

  useEffect(() => {
    if (actionSignal && actionSignal.nonce > 0) {
      triggerPoseAction(actionSignal.type);
    }
  }, [actionSignal]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let createdRenderer: THREE.WebGLRenderer | null = null;
    const candidateOpts: THREE.WebGLRendererParameters[] = [
      { antialias: true, alpha: true, powerPreference: 'default' },
      { antialias: false, alpha: true, powerPreference: 'default' },
      { antialias: false, alpha: true },
    ];
    for (const opts of candidateOpts) {
      try {
        createdRenderer = new THREE.WebGLRenderer(opts);
        break;
      } catch {
        createdRenderer = null;
      }
    }

    if (!createdRenderer) {
      setWebglFailed(true);
      return;
    }

    const renderer: THREE.WebGLRenderer = createdRenderer;
    setWebglFailed(false);
    const isSoftwareGl = isSoftwareRenderer(renderer);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 440;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 6.9);
    camera.lookAt(0, -0.05, 0);

    let envTarget: THREE.WebGLRenderTarget | null = null;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envTarget.texture;
      scene.environmentIntensity = 0.55;
      roomEnv.dispose();
      pmremGenerator.dispose();
    } catch {
      envTarget = null;
    }

    // Warm/Cool Studio 3-point lighting
    scene.add(new THREE.HemisphereLight(0xf3efe6, 0x3b322c, 0.78));

    const keyLight = new THREE.DirectionalLight(0xfff6eb, 1.65);
    keyLight.position.set(2.8, 4.2, 4.4);
    scene.add(keyLight);

    const rimVermilion = new THREE.PointLight(0xd9381e, 11, 10, 1.5);
    rimVermilion.position.set(-2.5, 0.8, -1.6);
    scene.add(rimVermilion);

    const coolFill = new THREE.DirectionalLight(0xdbe4f0, 0.75);
    coolFill.position.set(-2.4, 2.0, 2.2);
    scene.add(coolFill);

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const floralTex = createFloralShirtTexture(maxAniso);
    texturesToDispose.push(floralTex);

    // Materials (varied roughness & metalness contrast)
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xc98c66,
      roughness: 0.56,
      metalness: 0.02,
      clearcoat: 0.08,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x16161a,
      roughness: 0.82,
      metalness: 0.04,
    });
    const glassesFrameMat = new THREE.MeshPhysicalMaterial({
      color: 0x111114,
      roughness: 0.22,
      metalness: 0.35,
      clearcoat: 0.75,
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xfbf8f2,
      roughness: 0.2,
    });
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x121010,
      roughness: 0.15,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      map: floralTex,
      roughness: 0.8,
      metalness: 0.02,
    });
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xefe1c9,
      roughness: 0.78,
      metalness: 0.02,
    });
    const cargoMat = new THREE.MeshStandardMaterial({
      color: 0x353336,
      roughness: 0.86,
      metalness: 0.03,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xefe7da,
      roughness: 0.55,
      metalness: 0.05,
    });
    const packMat = new THREE.MeshStandardMaterial({
      color: 0x1d1d22,
      roughness: 0.74,
      metalness: 0.06,
    });
    const vermilionMat = new THREE.MeshPhysicalMaterial({
      color: 0xd9381e,
      roughness: 0.28,
      metalness: 0.25,
      clearcoat: 0.5,
    });
    const metalAccentMat = new THREE.MeshStandardMaterial({
      color: 0xd6d9e0,
      roughness: 0.22,
      metalness: 0.88,
    });
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x111113,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });

    materialsToDispose.push(
      skinMat,
      hairMat,
      glassesFrameMat,
      lensMat,
      eyeWhiteMat,
      pupilMat,
      shirtMat,
      collarMat,
      cargoMat,
      shoeMat,
      packMat,
      vermilionMat,
      metalAccentMat,
      shadowMat,
    );

    // Ground Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.92, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    geometriesToDispose.push(shadowGeo);
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -1.78, 0);
    scene.add(shadowMesh);

    // Stage Mover (handles roaming patrol + jump height)
    const stageMover = new THREE.Group();
    scene.add(stageMover);

    // Character Root (handles spin + squash-stretch)
    const characterRoot = new THREE.Group();
    characterRoot.position.y = -1.75; // Pivot near feet so legs stay grounded!
    stageMover.add(characterRoot);

    // === 1. LEGS & SNEAKERS (Charcoal Cargo Pants + Cream Sneakers) ===
    const thighGeo = new THREE.CapsuleGeometry(0.175, 0.56, 8, 20);
    const pocketGeo = new THREE.BoxGeometry(0.12, 0.24, 0.22);
    const shoeBodyGeo = new THREE.BoxGeometry(0.26, 0.16, 0.44);
    const soleGeo = new THREE.BoxGeometry(0.28, 0.06, 0.47);
    const shoeStripeGeo = new THREE.BoxGeometry(0.27, 0.05, 0.12);
    geometriesToDispose.push(thighGeo, pocketGeo, shoeBodyGeo, soleGeo, shoeStripeGeo);

    const buildLeg = (side: -1 | 1) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(side * 0.23, 0.96, 0);

      const legMesh = new THREE.Mesh(thighGeo, cargoMat);
      legMesh.position.set(0, -0.44, 0);
      legPivot.add(legMesh);

      const cargoPocket = new THREE.Mesh(pocketGeo, cargoMat);
      cargoPocket.position.set(side * 0.14, -0.34, 0.02);
      legPivot.add(cargoPocket);

      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.84, 0.09);
      shoeGroup.add(new THREE.Mesh(shoeBodyGeo, shoeMat));
      const sole = new THREE.Mesh(soleGeo, collarMat);
      sole.position.y = -0.07;
      const stripe = new THREE.Mesh(shoeStripeGeo, side === 1 ? vermilionMat : cargoMat);
      stripe.position.set(0, 0.01, -0.04);
      shoeGroup.add(sole, stripe);
      legPivot.add(shoeGroup);

      return legPivot;
    };

    const leftLeg = buildLeg(-1);
    const rightLeg = buildLeg(1);
    characterRoot.add(leftLeg, rightLeg);

    // === 2. TORSO (Cream Floral Shirt + Collar + Backpack) ===
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.0, 0);
    characterRoot.add(torsoGroup);

    const waistGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.18, 24);
    geometriesToDispose.push(waistGeo);
    const waistMesh = new THREE.Mesh(waistGeo, cargoMat);
    waistMesh.position.set(0, 0.02, 0);
    torsoGroup.add(waistMesh);

    const shirtGeo = new THREE.CylinderGeometry(0.42, 0.39, 0.78, 28);
    shirtGeo.scale(1.12, 1, 0.78);
    geometriesToDispose.push(shirtGeo);
    const shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
    shirtMesh.position.set(0, 0.44, 0);
    torsoGroup.add(shirtMesh);

    // Shirt Collar Flaps
    const collarGeo = new THREE.BoxGeometry(0.22, 0.12, 0.16);
    geometriesToDispose.push(collarGeo);
    const collarL = new THREE.Mesh(collarGeo, collarMat);
    collarL.position.set(-0.14, 0.81, 0.18);
    collarL.rotation.set(0.25, 0.3, -0.35);
    const collarR = new THREE.Mesh(collarGeo, collarMat);
    collarR.position.set(0.14, 0.81, 0.18);
    collarR.rotation.set(0.25, -0.3, 0.35);
    torsoGroup.add(collarL, collarR);

    // Backpack + Signature Shoulder Straps with Vermilion Accent Loops
    const packGeo = new THREE.BoxGeometry(0.68, 0.74, 0.34);
    geometriesToDispose.push(packGeo);
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 0.46, -0.38);
    torsoGroup.add(packMesh);

    const strapGeo = new THREE.TorusGeometry(0.32, 0.055, 10, 24, Math.PI * 1.15);
    strapGeo.rotateY(Math.PI / 2);
    geometriesToDispose.push(strapGeo);
    const strapL = new THREE.Mesh(strapGeo, packMat);
    strapL.position.set(-0.27, 0.56, -0.02);
    const strapR = new THREE.Mesh(strapGeo, packMat);
    strapR.position.set(0.27, 0.56, -0.02);
    torsoGroup.add(strapL, strapR);

    const strapTrimGeo = new THREE.BoxGeometry(0.06, 0.16, 0.05);
    geometriesToDispose.push(strapTrimGeo);
    const strapTrim = new THREE.Mesh(strapTrimGeo, vermilionMat);
    strapTrim.position.set(0.27, 0.68, 0.28);
    torsoGroup.add(strapTrim);

    // === 3. HEAD, WAVY HAIR, BLINKING EYES & SIGNATURE RECTANGULAR GLASSES ===
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.94, 0.02);
    torsoGroup.add(headPivot);

    const neckGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.22, 20);
    geometriesToDispose.push(neckGeo);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 0.02, -0.02);
    headPivot.add(neckMesh);

    const headGeo = new THREE.SphereGeometry(0.46, 40, 32);
    headGeo.scale(0.95, 1.08, 0.96);
    geometriesToDispose.push(headGeo);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 0.44, 0);
    headPivot.add(headMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.1, 16, 14);
    earGeo.scale(0.5, 0.95, 0.55);
    geometriesToDispose.push(earGeo);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.43, 0.42, -0.02);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.43, 0.42, -0.02);
    headPivot.add(earL, earR);

    // Sculpted Textured Hair (Swept volume matching Krish's hairstyle)
    const hairGroup = new THREE.Group();
    headPivot.add(hairGroup);
    const hairMainGeo = new THREE.SphereGeometry(0.48, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    hairMainGeo.scale(0.98, 1.0, 1.02);
    geometriesToDispose.push(hairMainGeo);
    const hairMain = new THREE.Mesh(hairMainGeo, hairMat);
    hairMain.position.set(0, 0.51, -0.04);
    hairMain.rotation.x = -0.22;
    hairGroup.add(hairMain);

    const quiffGeo = new THREE.CapsuleGeometry(0.16, 0.34, 8, 16);
    quiffGeo.rotateZ(Math.PI / 2.2);
    geometriesToDispose.push(quiffGeo);
    const quiff = new THREE.Mesh(quiffGeo, hairMat);
    quiff.position.set(0.05, 0.87, 0.15);
    quiff.rotation.y = 0.25;
    hairGroup.add(quiff);

    const sideHairGeo = new THREE.BoxGeometry(0.12, 0.24, 0.34);
    geometriesToDispose.push(sideHairGeo);
    const sideL = new THREE.Mesh(sideHairGeo, hairMat);
    sideL.position.set(-0.4, 0.58, -0.08);
    const sideR = new THREE.Mesh(sideHairGeo, hairMat);
    sideR.position.set(0.4, 0.58, -0.08);
    hairGroup.add(sideL, sideR);

    // Expressive Blinking Eyes + Brows
    const scleraGeo = new THREE.SphereGeometry(0.075, 18, 14);
    scleraGeo.scale(1.0, 0.88, 0.6);
    const pupilGeo = new THREE.SphereGeometry(0.042, 16, 12);
    pupilGeo.scale(1, 1, 0.6);
    const browGeo = new THREE.BoxGeometry(0.16, 0.036, 0.04);
    geometriesToDispose.push(scleraGeo, pupilGeo, browGeo);

    const makeEye = (x: number) => {
      const grp = new THREE.Group();
      grp.position.set(x, 0.48, 0.41);
      grp.add(new THREE.Mesh(scleraGeo, eyeWhiteMat));
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0, 0.035);
      grp.add(pupil);
      return { grp, pupil };
    };
    const leftEye = makeEye(-0.16);
    const rightEye = makeEye(0.16);
    const leftEyeGroup = leftEye.grp;
    const rightEyeGroup = rightEye.grp;
    const leftPupil = leftEye.pupil;
    const rightPupil = rightEye.pupil;
    headPivot.add(leftEyeGroup, rightEyeGroup);

    const browL = new THREE.Mesh(browGeo, hairMat);
    browL.position.set(-0.16, 0.59, 0.42);
    browL.rotation.z = 0.06;
    const browR = new THREE.Mesh(browGeo, hairMat);
    browR.position.set(0.16, 0.59, 0.42);
    browR.rotation.z = -0.06;
    headPivot.add(browL, browR);

    // Signature Thick Rectangular Eyeglasses
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.48, 0.465);
    const topBarGeo = new THREE.BoxGeometry(0.24, 0.035, 0.035);
    const botBarGeo = new THREE.BoxGeometry(0.22, 0.022, 0.028);
    const sideBarGeo = new THREE.BoxGeometry(0.028, 0.14, 0.032);
    const bridgeGeo = new THREE.BoxGeometry(0.1, 0.03, 0.03);
    const lensGeo = new THREE.PlaneGeometry(0.2, 0.12);
    geometriesToDispose.push(topBarGeo, botBarGeo, sideBarGeo, bridgeGeo, lensGeo);

    [-0.17, 0.17].forEach((fx) => {
      const fTop = new THREE.Mesh(topBarGeo, glassesFrameMat);
      fTop.position.set(fx, 0.065, 0);
      const fBot = new THREE.Mesh(botBarGeo, glassesFrameMat);
      fBot.position.set(fx, -0.06, 0);
      const fIn = new THREE.Mesh(sideBarGeo, glassesFrameMat);
      fIn.position.set(fx + (fx < 0 ? 0.1 : -0.1), 0, 0);
      const fOut = new THREE.Mesh(sideBarGeo, glassesFrameMat);
      fOut.position.set(fx + (fx < 0 ? -0.11 : 0.11), 0, 0);
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(fx, 0, -0.005);
      glassesGroup.add(fTop, fBot, fIn, fOut, lens);
    });
    const bridgeMesh = new THREE.Mesh(bridgeGeo, glassesFrameMat);
    bridgeMesh.position.set(0, 0.05, 0);
    glassesGroup.add(bridgeMesh);
    headPivot.add(glassesGroup);

    // Nose & Confident Smirk
    const noseGeo = new THREE.CapsuleGeometry(0.032, 0.07, 6, 12);
    geometriesToDispose.push(noseGeo);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.position.set(0, 0.37, 0.45);
    noseMesh.rotation.x = 0.2;
    headPivot.add(noseMesh);

    const smileCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 0.25, 0.42),
      new THREE.Vector3(0.0, 0.22, 0.44),
      new THREE.Vector3(0.11, 0.25, 0.41),
    ]);
    const smileGeo = new THREE.TubeGeometry(smileCurve, 20, 0.012, 8, false);
    geometriesToDispose.push(smileGeo);
    headPivot.add(new THREE.Mesh(smileGeo, hairMat));

    // === 4. ARTICULATED RIGHT ARM (Thumbs-up + Smartwatch + Wave + Megaphone!) ===
    const sleeveGeo = new THREE.CylinderGeometry(0.135, 0.145, 0.28, 20);
    const forearmGeo = new THREE.CapsuleGeometry(0.095, 0.34, 8, 16);
    const watchGeo = new THREE.BoxGeometry(0.14, 0.08, 0.15);
    const fistGeo = new THREE.BoxGeometry(0.16, 0.15, 0.14);
    const thumbGeo = new THREE.CapsuleGeometry(0.042, 0.11, 6, 12);
    geometriesToDispose.push(sleeveGeo, forearmGeo, watchGeo, fistGeo, thumbGeo);

    const rightShoulderPivot = new THREE.Group();
    rightShoulderPivot.position.set(0.5, 0.72, 0);
    torsoGroup.add(rightShoulderPivot);

    const rSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    rSleeve.position.set(0.06, -0.1, 0);
    rSleeve.rotation.z = 0.28;
    rightShoulderPivot.add(rSleeve);

    const rightElbowPivot = new THREE.Group();
    rightElbowPivot.position.set(0.14, -0.26, 0.06);
    rightShoulderPivot.add(rightElbowPivot);

    const rArm = new THREE.Mesh(forearmGeo, skinMat);
    rArm.position.set(0, -0.2, 0);
    rightElbowPivot.add(rArm);

    const smartwatch = new THREE.Mesh(watchGeo, packMat);
    smartwatch.position.set(0, -0.34, 0.02);
    rightElbowPivot.add(smartwatch);

    const rightHandGroup = new THREE.Group();
    rightHandGroup.position.set(0, -0.44, 0.04);
    rightHandGroup.add(new THREE.Mesh(fistGeo, skinMat));
    const thumb = new THREE.Mesh(thumbGeo, skinMat);
    thumb.position.set(-0.04, 0.12, 0.02);
    thumb.rotation.z = 0.22;
    rightHandGroup.add(thumb);
    rightElbowPivot.add(rightHandGroup);

    // === 5. ARTICULATED LEFT ARM (Casual + Mode Props!) ===
    const leftShoulderPivot = new THREE.Group();
    leftShoulderPivot.position.set(-0.5, 0.72, 0);
    torsoGroup.add(leftShoulderPivot);

    const lSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    lSleeve.position.set(-0.06, -0.1, 0);
    lSleeve.rotation.z = -0.28;
    leftShoulderPivot.add(lSleeve);

    const leftElbowPivot = new THREE.Group();
    leftElbowPivot.position.set(-0.14, -0.26, 0.02);
    leftShoulderPivot.add(leftElbowPivot);

    const lArm = new THREE.Mesh(forearmGeo, skinMat);
    lArm.position.set(0, -0.2, 0);
    leftElbowPivot.add(lArm);

    const leftFist = new THREE.Mesh(fistGeo, skinMat);
    leftFist.position.set(0, -0.44, 0.02);
    leftElbowPivot.add(leftFist);

    // === 6. MODE-SPECIFIC PHYSICAL PROPS (Attached directly to Mini-Krish!) ===
    // Prop A: Brand Strategy -> Floating & Held Strategy Blocks
    const strategyProp = new THREE.Group();
    const blockGeo = new THREE.BoxGeometry(0.24, 0.16, 0.24);
    geometriesToDispose.push(blockGeo);
    const blk1 = new THREE.Mesh(blockGeo, glassesFrameMat);
    const blk2 = new THREE.Mesh(blockGeo, vermilionMat);
    blk2.position.set(0.03, 0.16, 0.02);
    blk2.rotation.y = 0.35;
    const blk3 = new THREE.Mesh(blockGeo, collarMat);
    blk3.position.set(-0.02, 0.32, -0.01);
    blk3.rotation.y = -0.25;
    strategyProp.add(blk1, blk2, blk3);
    strategyProp.position.set(-0.06, -0.38, 0.22);
    leftElbowPivot.add(strategyProp);

    // Prop B: Creative Direction -> Director's Viewfinder held near eye/hand
    const viewfinderProp = new THREE.Group();
    const vfBodyGeo = new THREE.BoxGeometry(0.26, 0.18, 0.14);
    const vfLensGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.14, 20);
    vfLensGeo.rotateX(Math.PI / 2);
    geometriesToDispose.push(vfBodyGeo, vfLensGeo);
    viewfinderProp.add(new THREE.Mesh(vfBodyGeo, glassesFrameMat));
    const vfLens = new THREE.Mesh(vfLensGeo, vermilionMat);
    vfLens.position.z = 0.11;
    viewfinderProp.add(vfLens);
    viewfinderProp.position.set(0.06, -0.44, 0.14);
    leftElbowPivot.add(viewfinderProp);

    // Prop C: Campaigns -> Vermilion Megaphone + Animated 3D Soundwave Rings!
    const megaphoneProp = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.22, 0.44, 24, 1, true);
    coneGeo.rotateX(-Math.PI / 2);
    const handleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 12);
    geometriesToDispose.push(coneGeo, handleGeo);
    const coneMesh = new THREE.Mesh(coneGeo, vermilionMat);
    coneMesh.position.set(0, 0.06, 0.18);
    const handleMesh = new THREE.Mesh(handleGeo, glassesFrameMat);
    handleMesh.position.set(0, -0.06, 0.08);
    megaphoneProp.add(coneMesh, handleMesh);
    megaphoneProp.position.set(0.02, -0.44, 0.16);
    leftElbowPivot.add(megaphoneProp);

    const waveRingGeo = new THREE.TorusGeometry(0.22, 0.018, 10, 32);
    geometriesToDispose.push(waveRingGeo);
    const waveRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const rMat = new THREE.MeshBasicMaterial({
        color: 0xd9381e,
        transparent: true,
        opacity: 0,
      });
      materialsToDispose.push(rMat);
      const ring = new THREE.Mesh(waveRingGeo, rMat);
      ring.position.set(0, 0.06, 0.48 + i * 0.2);
      megaphoneProp.add(ring);
      waveRings.push(ring);
    }

    // Prop D: Founder (Adbabu) -> Vermilion Briefcase + Founder Cap Badge
    const briefcaseProp = new THREE.Group();
    const caseGeo = new THREE.BoxGeometry(0.46, 0.34, 0.14);
    const latchGeo = new THREE.BoxGeometry(0.1, 0.05, 0.16);
    geometriesToDispose.push(caseGeo, latchGeo);
    briefcaseProp.add(new THREE.Mesh(caseGeo, vermilionMat));
    const latch = new THREE.Mesh(latchGeo, metalAccentMat);
    latch.position.y = 0.08;
    briefcaseProp.add(latch);
    briefcaseProp.position.set(-0.08, -0.58, 0.06);
    briefcaseProp.rotation.y = Math.PI / 2;
    leftElbowPivot.add(briefcaseProp);

    const founderPinGeo = new THREE.OctahedronGeometry(0.065, 0);
    founderPinGeo.scale(1, 1, 0.45);
    geometriesToDispose.push(founderPinGeo);
    const founderPin = new THREE.Mesh(founderPinGeo, vermilionMat);
    founderPin.position.set(-0.22, 0.62, 0.32);
    torsoGroup.add(founderPin);

    if (!isSoftwareGl) {
      try {
        renderer.compile(scene, camera);
      } catch {
        // Ignore shader prewarm failure
      }
    }

    const canvasEl = renderer.domElement;
    let pointerDownMoved = false;
    let lastRaycastTime = 0;

    const updatePointerRelative = (clientX: number, clientY: number) => {
      const rect = canvasEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.44;
      const spanX = Math.max(rect.width * 0.9, window.innerWidth * 0.42);
      const spanY = Math.max(rect.height * 0.85, window.innerHeight * 0.42);
      animRef.current.pointerX = THREE.MathUtils.clamp((clientX - centerX) / spanX, -1, 1);
      animRef.current.pointerY = THREE.MathUtils.clamp((clientY - centerY) / spanY, -1, 1);
    };

    const onWindowPointerMove = (e: PointerEvent) => {
      updatePointerRelative(e.clientX, e.clientY);

      if (animRef.current.isDragging) {
        const dx = e.clientX - animRef.current.dragStartX;
        animRef.current.dragStartX = e.clientX;
        if (Math.abs(dx) > 1) pointerDownMoved = true;
        animRef.current.manualYaw += dx * 0.015;
        animRef.current.dragSpinVel = dx * 0.05;
        return;
      }

      // Throttled raycast when pointer is over the canvas to detect mesh hover
      const now = performance.now();
      if (now - lastRaycastTime >= 45) {
        lastRaycastTime = now;
        const rect = canvasEl.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (inside && rect.width > 0 && rect.height > 0) {
          _pointerNdc.set(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1,
          );
          _raycaster.setFromCamera(_pointerNdc, camera);
          const hits = _raycaster.intersectObject(characterRoot, true);
          const hitChar = hits.length > 0;
          if (hitChar && !animRef.current.characterHovered && animRef.current.greetTimer <= 0) {
            // Subtle attentive greet when cursor moves directly onto the figurine
            animRef.current.greetTimer = 0.95;
          }
          animRef.current.characterHovered = hitChar;
        } else {
          animRef.current.characterHovered = false;
        }
      }
    };

    const onCanvasPointerDown = (e: PointerEvent) => {
      updatePointerRelative(e.clientX, e.clientY);
      animRef.current.isDragging = true;
      animRef.current.dragStartX = e.clientX;
      pointerDownMoved = false;
    };

    const onWindowPointerUp = (e: PointerEvent) => {
      if (animRef.current.isDragging && !pointerDownMoved) {
        const rect = canvasEl.getBoundingClientRect();
        let hitDirect = false;
        if (rect.width > 0 && rect.height > 0) {
          _pointerNdc.set(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1,
          );
          _raycaster.setFromCamera(_pointerNdc, camera);
          hitDirect = _raycaster.intersectObject(characterRoot, true).length > 0;
        }

        let picked: MiniKrishActionType;
        if (!animRef.current.hasGreetedTap || hitDirect) {
          if (!animRef.current.hasGreetedTap) {
            picked = 'greet';
            animRef.current.hasGreetedTap = true;
          } else {
            const choices: MiniKrishActionType[] = ['thumbsup', 'wave', 'jumpspin', 'groove'];
            picked = choices[Math.floor(Math.random() * choices.length)];
          }
        } else {
          picked = 'greet';
        }
        triggerPoseAction(picked);
        onToyTapRef.current(picked);
      }
      animRef.current.isDragging = false;
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    let restoreTimer: number | null = null;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        if (!disposed) {
          setRetryNonce((c) => c + 1);
        }
      }, 400);
    };
    const onContextRestored = () => {
      if (restoreTimer !== null) {
        window.clearTimeout(restoreTimer);
        restoreTimer = null;
      }
      setWebglFailed(false);
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    canvasEl.addEventListener('pointerdown', onCanvasPointerDown);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('resize', onResize);
    canvasEl.addEventListener('webglcontextlost', onContextLost);
    canvasEl.addEventListener('webglcontextrestored', onContextRestored);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const a = animRef.current;
      const activeMode = modeRef.current;
      const isEngaged =
        heroHoveringRef.current || a.isHovered || a.characterHovered || a.greetTimer > 0;

      // 1. Gentle Stage Roaming + Responsive Cursor Lean
      a.wanderBlend = THREE.MathUtils.damp(
        a.wanderBlend,
        a.characterHovered || a.greetTimer > 0 ? 0.22 : heroHoveringRef.current ? 0.45 : 1,
        5,
        delta,
      );
      const walkSpeed = a.grooveTimer > 0 ? 5.6 : 2.1;
      const wanderX = reducedMotion
        ? 0
        : Math.sin(elapsed * 0.85) * 0.4 * a.wanderBlend + a.pointerX * (isEngaged ? 0.16 : 0.08);
      const wanderZ = reducedMotion
        ? 0
        : Math.cos(elapsed * 0.65) * 0.14 * a.wanderBlend + (a.characterHovered ? 0.14 : 0);
      const idleBounceY = reducedMotion
        ? 0
        : Math.abs(Math.sin(elapsed * walkSpeed)) * (a.grooveTimer > 0 ? 0.14 : 0.05);

      // Subtle rim highlight boost when pointer hovers directly on figurine
      rimVermilion.intensity = THREE.MathUtils.damp(
        rimVermilion.intensity,
        a.characterHovered ? 16 : 11,
        8,
        delta,
      );

      // 2. Gravity Jump + Squash & Stretch
      if (a.jumpY > 0 || a.jumpVel > 0) {
        a.jumpY += a.jumpVel * delta;
        a.jumpVel -= 17 * delta;
        if (a.jumpY <= 0) {
          a.jumpY = 0;
          a.jumpVel = 0;
          a.squash = 0.82;
        }
      }
      a.squash = THREE.MathUtils.damp(a.squash, 1, 10, delta);
      const stretchY = a.squash;
      const stretchXZ = 1 / Math.sqrt(Math.max(0.7, stretchY));
      characterRoot.scale.set(stretchXZ, stretchY, stretchXZ);

      stageMover.position.set(wanderX, idleBounceY + a.jumpY, wanderZ);
      shadowMesh.position.set(wanderX, -1.78, wanderZ);
      const hRatio = Math.max(0.45, 1 - (idleBounceY + a.jumpY) * 0.38);
      shadowMesh.scale.setScalar(hRatio);
      shadowMat.opacity = 0.17 * hRatio;

      // 3. Spin + Drag Momentum + Cursor Orientation
      if (a.spinRemaining > 0.01) {
        const step = Math.min(a.spinRemaining, delta * 12.5);
        a.manualYaw += step;
        a.spinRemaining -= step;
      } else if (!a.isDragging) {
        a.manualYaw += a.dragSpinVel * delta * 10;
        a.dragSpinVel = THREE.MathUtils.damp(a.dragSpinVel, 0, 5, delta);
        const targetIdle = Math.round(a.manualYaw / (Math.PI * 2)) * (Math.PI * 2) - 0.14;
        a.manualYaw = THREE.MathUtils.damp(a.manualYaw, targetIdle, 2.5, delta);
      }

      const walkTurnY = reducedMotion ? 0 : Math.cos(elapsed * 0.85) * 0.14 * a.wanderBlend;
      const cursorBodyYaw = a.pointerX * (isEngaged ? 0.32 : 0.22);
      characterRoot.rotation.y = THREE.MathUtils.damp(
        characterRoot.rotation.y,
        a.manualYaw + walkTurnY + cursorBodyYaw,
        7,
        delta,
      );

      // Groove, Greeting Lean & Idle Torso Sway
      let grooveSwayZ = 0;
      if (a.grooveTimer > 0) {
        a.grooveTimer = Math.max(0, a.grooveTimer - delta);
        grooveSwayZ = Math.sin(elapsed * 9) * 0.1;
      }
      const greetActive = a.greetTimer > 0;
      if (a.greetTimer > 0) {
        a.greetTimer = Math.max(0, a.greetTimer - delta);
      }

      torsoGroup.rotation.z = THREE.MathUtils.damp(
        torsoGroup.rotation.z,
        grooveSwayZ + (isEngaged ? -a.pointerX * 0.04 : 0),
        9,
        delta,
      );
      torsoGroup.rotation.y = THREE.MathUtils.damp(
        torsoGroup.rotation.y,
        a.pointerX * 0.16,
        8,
        delta,
      );
      torsoGroup.rotation.x = THREE.MathUtils.damp(
        torsoGroup.rotation.x,
        a.jumpY > 0.05 ? -0.1 : greetActive || a.characterHovered ? 0.08 : 0.03,
        8,
        delta,
      );

      // 4. Leg Walk Cycle
      const legSwing =
        a.jumpY > 0.1
          ? 0.45
          : reducedMotion
            ? 0
            : Math.sin(elapsed * walkSpeed) * (a.grooveTimer > 0 ? 0.24 : 0.16 * a.wanderBlend);
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, legSwing, 10, delta);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, -legSwing, 10, delta);

      // 5. Head Cursor Tracking + Subtle Greeting Nod + Eye Pupil Gaze
      const greetNod =
        greetActive && !reducedMotion ? Math.sin(a.greetTimer * Math.PI * 3.4) * 0.15 : 0;
      _targetHeadRot.set(
        a.pointerY * (isEngaged ? 0.26 : 0.18) +
          greetNod +
          (a.grooveTimer > 0 && !reducedMotion ? Math.sin(elapsed * 9) * 0.1 : 0),
        a.pointerX * (isEngaged ? 0.42 : 0.3),
      );
      headPivot.rotation.x = THREE.MathUtils.damp(headPivot.rotation.x, _targetHeadRot.x, 9, delta);
      headPivot.rotation.y = THREE.MathUtils.damp(headPivot.rotation.y, _targetHeadRot.y, 9, delta);
      headPivot.rotation.z = THREE.MathUtils.damp(
        headPivot.rotation.z,
        a.characterHovered ? -a.pointerX * 0.08 : 0,
        7,
        delta,
      );

      // Eye pupils follow cursor smoothly behind rectangular glasses
      const targetPupilX = THREE.MathUtils.clamp(a.pointerX * 0.025, -0.026, 0.026);
      const targetPupilY = THREE.MathUtils.clamp(-a.pointerY * 0.022, -0.022, 0.022);
      leftPupil.position.x = THREE.MathUtils.damp(leftPupil.position.x, targetPupilX, 12, delta);
      leftPupil.position.y = THREE.MathUtils.damp(leftPupil.position.y, targetPupilY, 12, delta);
      rightPupil.position.x = THREE.MathUtils.damp(rightPupil.position.x, targetPupilX, 12, delta);
      rightPupil.position.y = THREE.MathUtils.damp(rightPupil.position.y, targetPupilY, 12, delta);

      // Friendly eyebrow perk on hover or greeting
      const browPerk = greetActive || a.characterHovered ? 0.028 : 0;
      browL.position.y = THREE.MathUtils.damp(browL.position.y, 0.59 + browPerk, 10, delta);
      browR.position.y = THREE.MathUtils.damp(browR.position.y, 0.59 + browPerk, 10, delta);

      // 6. Articulated Right Arm (Wave / Subtle Greeting / Thumbs-Up)
      if (a.waveTimer > 0) {
        a.waveTimer = Math.max(0, a.waveTimer - delta);
        rightShoulderPivot.rotation.z = THREE.MathUtils.damp(rightShoulderPivot.rotation.z, 2.35, 10, delta);
        rightShoulderPivot.rotation.x = THREE.MathUtils.damp(rightShoulderPivot.rotation.x, -0.3, 10, delta);
        rightElbowPivot.rotation.z = Math.sin(elapsed * 14) * 0.45;
        rightElbowPivot.rotation.x = THREE.MathUtils.damp(rightElbowPivot.rotation.x, -0.4, 10, delta);
      } else if (greetActive) {
        rightShoulderPivot.rotation.z = THREE.MathUtils.damp(rightShoulderPivot.rotation.z, 1.85, 9, delta);
        rightShoulderPivot.rotation.x = THREE.MathUtils.damp(rightShoulderPivot.rotation.x, -0.38, 9, delta);
        rightElbowPivot.rotation.z = reducedMotion ? 0.15 : Math.sin(elapsed * 10.5) * 0.32;
        rightElbowPivot.rotation.x = THREE.MathUtils.damp(rightElbowPivot.rotation.x, -0.55, 9, delta);
      } else if (a.thumbsPulseTimer > 0) {
        a.thumbsPulseTimer = Math.max(0, a.thumbsPulseTimer - delta);
        const pump = Math.sin(elapsed * 12) * 0.22;
        rightShoulderPivot.rotation.z = THREE.MathUtils.damp(rightShoulderPivot.rotation.z, 0.52, 10, delta);
        rightShoulderPivot.rotation.x = THREE.MathUtils.damp(rightShoulderPivot.rotation.x, -0.85, 10, delta);
        rightElbowPivot.rotation.x = THREE.MathUtils.damp(rightElbowPivot.rotation.x, -1.6 + pump, 12, delta);
        rightElbowPivot.rotation.z = THREE.MathUtils.damp(rightElbowPivot.rotation.z, 0.2, 10, delta);
      } else {
        // Default signature confident thumbs-up pose
        const idleBob = reducedMotion ? 0 : Math.sin(elapsed * 2.5) * 0.05;
        rightShoulderPivot.rotation.z = THREE.MathUtils.damp(rightShoulderPivot.rotation.z, 0.38, 8, delta);
        rightShoulderPivot.rotation.x = THREE.MathUtils.damp(rightShoulderPivot.rotation.x, -0.58, 8, delta);
        rightElbowPivot.rotation.x = THREE.MathUtils.damp(rightElbowPivot.rotation.x, -1.42 + idleBob, 8, delta);
        rightElbowPivot.rotation.z = THREE.MathUtils.damp(rightElbowPivot.rotation.z, 0.26, 8, delta);
      }

      // 7. Articulated Left Arm + Mode-Specific Physical Props
      const targetLeftShoulderX =
        activeMode === 'creative'
          ? -1.15
          : activeMode === 'campaigns'
            ? -0.95
            : activeMode === 'strategist'
              ? -0.65
              : 0.08;
      const targetLeftElbowX =
        activeMode === 'creative'
          ? -1.25
          : activeMode === 'campaigns'
            ? -1.05
            : activeMode === 'strategist'
              ? -0.95
              : -0.15;
      const leftGrooveBob = a.grooveTimer > 0 ? Math.cos(elapsed * 9) * 0.25 : 0;

      leftShoulderPivot.rotation.x = THREE.MathUtils.damp(
        leftShoulderPivot.rotation.x,
        targetLeftShoulderX + leftGrooveBob,
        8,
        delta,
      );
      leftShoulderPivot.rotation.z = THREE.MathUtils.damp(
        leftShoulderPivot.rotation.z,
        activeMode === 'founder' ? -0.18 : -0.12,
        8,
        delta,
      );
      leftElbowPivot.rotation.x = THREE.MathUtils.damp(
        leftElbowPivot.rotation.x,
        targetLeftElbowX,
        8,
        delta,
      );

      // Scale mode props smoothly
      const setPropScale = (obj: THREE.Object3D, show: boolean) => {
        const s = THREE.MathUtils.damp(obj.scale.x, show ? 1 : 0.001, 10, delta);
        obj.scale.setScalar(s);
        obj.visible = s > 0.02;
      };
      setPropScale(strategyProp, activeMode === 'strategist');
      setPropScale(viewfinderProp, activeMode === 'creative');
      setPropScale(megaphoneProp, activeMode === 'campaigns');
      setPropScale(briefcaseProp, activeMode === 'founder');
      setPropScale(founderPin, activeMode === 'founder');

      // Soundwave animation when in Campaigns mode
      if (a.soundwaveTimer > 0) {
        a.soundwaveTimer = Math.max(0, a.soundwaveTimer - delta);
      }
      waveRings.forEach((ring, i) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (activeMode === 'campaigns' && a.soundwaveTimer > 0) {
          const phase = ((elapsed * 2.5 - i * 0.28) % 1 + 1) % 1;
          ring.scale.setScalar(0.8 + phase * 1.3);
          ring.position.z = 0.45 + phase * 0.55;
          mat.opacity = (1 - phase) * 0.75;
        } else {
          mat.opacity = 0;
        }
      });

      // 8. Eyes: Wink & Natural Blink
      if (a.winkTimer > 0) {
        a.winkTimer -= delta;
        leftEyeGroup.scale.y = THREE.MathUtils.damp(leftEyeGroup.scale.y, 0.1, 18, delta);
        rightEyeGroup.scale.y = THREE.MathUtils.damp(rightEyeGroup.scale.y, 1.12, 12, delta);
      } else {
        a.blinkTimer -= delta;
        if (a.blinkTimer <= 0) {
          a.blinkProgress += delta * 11;
          const bScale =
            a.blinkProgress < 1
              ? Math.max(0.08, 1 - a.blinkProgress)
              : Math.min(1, a.blinkProgress - 1);
          leftEyeGroup.scale.y = bScale;
          rightEyeGroup.scale.y = bScale;
          if (a.blinkProgress >= 2) {
            a.blinkProgress = 0;
            a.blinkTimer = 2.5 + Math.random() * 2.5;
            leftEyeGroup.scale.y = 1;
            rightEyeGroup.scale.y = 1;
          }
        } else {
          leftEyeGroup.scale.y = THREE.MathUtils.damp(leftEyeGroup.scale.y, 1, 9, delta);
          rightEyeGroup.scale.y = THREE.MathUtils.damp(rightEyeGroup.scale.y, 1, 9, delta);
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onWindowPointerMove);
      canvasEl.removeEventListener('pointerdown', onCanvasPointerDown);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('resize', onResize);
      canvasEl.removeEventListener('webglcontextlost', onContextLost);
      canvasEl.removeEventListener('webglcontextrestored', onContextRestored);
      if (restoreTimer !== null) {
        window.clearTimeout(restoreTimer);
      }
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
      envTarget?.dispose();
      renderer.dispose();
      try {
        if (!renderer.getContext().isContextLost()) {
          renderer.forceContextLoss();
        }
      } catch {
        // Ignore forceContextLoss errors on cleanup
      }
    };
  }, [retryNonce]);

  if (webglFailed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center border border-[#111113]/20 bg-[#E7E1D5]/50 p-6 text-center">
        <p className="font-mono-tech text-xs font-bold text-[#D9381E] uppercase">
          3D VIEW PAUSED
        </p>
        <p className="mt-2 max-w-xs text-sm font-semibold text-[#111113]">
          The interactive 3D Mini-Krish toy needs a fresh graphics context.
        </p>
        <button
          type="button"
          onClick={() => {
            setWebglFailed(false);
            setRetryNonce((c) => c + 1);
          }}
          className="font-mono-tech mt-4 cursor-pointer bg-[#111113] px-4 py-2 text-xs font-bold text-[#F3EFE6] uppercase hover:bg-[#D9381E]"
        >
          Reload 3D Toy
        </button>
      </div>
    );
  }

  return (
    <div
      data-cursor="PLAY"
      onMouseEnter={() => {
        animRef.current.isHovered = true;
      }}
      onMouseLeave={() => {
        animRef.current.isHovered = false;
        animRef.current.characterHovered = false;
      }}
      role="button"
      tabIndex={0}
      aria-label={`Interactive 3D Mini-Krish figurine in ${mode} mode. Click for a greeting or action, or drag to spin.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerPoseAction('greet');
          onToyTap('greet');
        }
      }}
      className="relative h-full w-full cursor-grab active:cursor-grabbing select-none"
    >
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}
