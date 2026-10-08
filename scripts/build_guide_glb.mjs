import fs from 'fs';
import path from 'path';

// Polyfill FileReader for Three.js GLTFExporter in Node.js
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64');
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
}
globalThis.FileReader = NodeFileReader;

const THREE = await import('three');
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

console.log('Compiling Master Reference Arunai Engineering College 3D Campus Guide GLB...');

// Master Character Root Group
const root = new THREE.Group();
root.name = 'CampusGuideModel';

// Ground Contact Shadow (Soft diffused ambient occlusion on floor)
const shadowGeo = new THREE.CircleGeometry(0.58, 36);
const shadowMat = new THREE.MeshBasicMaterial({
  color: 0x240d12,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});
const shadow = new THREE.Mesh(shadowGeo, shadowMat);
shadow.name = 'groundShadow';
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.005;
root.add(shadow);

// ==========================================
// MASTER CHARACTER MATERIALS & PBR PALETTE
// ==========================================
const skinMat = new THREE.MeshStandardMaterial({
  name: 'SkinMat',
  color: 0xf3caa9,
  roughness: 0.58,
  metalness: 0.0,
  emissive: 0x22130f,
  emissiveIntensity: 0.12,
});

const hairMat = new THREE.MeshStandardMaterial({
  name: 'HairMat',
  color: 0x3d251d,
  roughness: 0.44,
  metalness: 0.06,
  emissive: 0x160c08,
  emissiveIntensity: 0.10,
});

const maroonBlazerMat = new THREE.MeshStandardMaterial({
  name: 'MaroonBlazerMat',
  color: 0x611424,
  roughness: 0.40,
  metalness: 0.04,
});

const creamPipingMat = new THREE.MeshStandardMaterial({
  name: 'CreamPipingMat',
  color: 0xebd8b3,
  roughness: 0.28,
  metalness: 0.22,
});

const whiteShirtMat = new THREE.MeshStandardMaterial({
  name: 'WhiteShirtMat',
  color: 0xfcfbf8,
  roughness: 0.44,
  metalness: 0.02,
});

const creamTrousersMat = new THREE.MeshStandardMaterial({
  name: 'CreamTrousersMat',
  color: 0xeae6dc,
  roughness: 0.46,
  metalness: 0.02,
});

const shoeMat = new THREE.MeshStandardMaterial({
  name: 'ShoeMat',
  color: 0x141213,
  roughness: 0.20,
  metalness: 0.38,
});

const shoeSoleMat = new THREE.MeshStandardMaterial({
  name: 'ShoeSoleMat',
  color: 0x241d1a,
  roughness: 0.65,
  metalness: 0.10,
});

const goldAccentMat = new THREE.MeshStandardMaterial({
  name: 'GoldAccentMat',
  color: 0xd9b360,
  roughness: 0.16,
  metalness: 0.88,
});

const badgeShieldMat = new THREE.MeshStandardMaterial({
  name: 'BadgeShieldMat',
  color: 0x611424,
  roughness: 0.32,
  metalness: 0.12,
});

const glassesFrameMat = new THREE.MeshStandardMaterial({
  name: 'GlassesFrameMat',
  color: 0x242226,
  roughness: 0.26,
  metalness: 0.22,
});

const glassLensMat = new THREE.MeshStandardMaterial({
  name: 'GlassLensMat',
  color: 0xeef7fc,
  roughness: 0.08,
  metalness: 0.15,
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
});

const eyeWhiteMat = new THREE.MeshStandardMaterial({
  name: 'EyeWhiteMat',
  color: 0xfffefa,
  roughness: 0.15,
  metalness: 0.0,
  emissive: 0x444444,
  emissiveIntensity: 0.25,
});

const irisMat = new THREE.MeshStandardMaterial({
  name: 'IrisMat',
  color: 0x6e432a,
  roughness: 0.20,
  metalness: 0.04,
  emissive: 0x28150c,
  emissiveIntensity: 0.20,
});

const pupilMat = new THREE.MeshBasicMaterial({ name: 'PupilMat', color: 0x080708 });
const eyeGleamMat = new THREE.MeshBasicMaterial({ name: 'EyeGleamMat', color: 0xffffff });

const lipMat = new THREE.MeshStandardMaterial({
  name: 'LipMat',
  color: 0xc6747b,
  roughness: 0.52,
  metalness: 0.02,
  emissive: 0x281216,
  emissiveIntensity: 0.10,
});

const browMat = new THREE.MeshStandardMaterial({
  name: 'BrowMat',
  color: 0x3d241c,
  roughness: 0.55,
  metalness: 0.0,
});

// ==========================================
// HUMANOID SKELETAL RIG & BODY HIERARCHY
// ==========================================

// 1. HIPS / PELVIS
const pelvis = new THREE.Group();
pelvis.name = 'pelvis';
pelvis.position.y = 0.90;
root.add(pelvis);

// Belt & Gold Buckle
const beltGeo = new THREE.CylinderGeometry(0.192, 0.186, 0.052, 24);
const beltMesh = new THREE.Mesh(beltGeo, shoeMat);
beltMesh.name = 'beltMesh';
pelvis.add(beltMesh);

// Belt loops around waist
for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
  const loop = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.056, 0.012), creamTrousersMat);
  loop.position.set(Math.sin(angle) * 0.19, 0, Math.cos(angle) * 0.19);
  loop.rotation.y = angle;
  pelvis.add(loop);
}

const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.040, 0.016), goldAccentMat);
buckleMesh.name = 'buckleMesh';
buckleMesh.position.set(0, 0, 0.190);
pelvis.add(buckleMesh);

// 2. SPINE & CHEST (TORSO GROUP)
const torsoGroup = new THREE.Group();
torsoGroup.name = 'torsoGroup';
torsoGroup.position.set(0, 0.03, 0);
pelvis.add(torsoGroup);

// Tailored Maroon Blazer Body (Front & 360 Turnaround)
const torsoGeo = new THREE.CylinderGeometry(0.235, 0.188, 0.44, 24);
const torsoMesh = new THREE.Mesh(torsoGeo, maroonBlazerMat);
torsoMesh.name = 'torsoMesh';
torsoMesh.position.y = 0.22;
torsoGroup.add(torsoMesh);

// Center Back Tailoring Seam (Visible from Back Turnaround)
const backSeam = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.44, 0.010), maroonBlazerMat);
backSeam.name = 'backSeam';
backSeam.position.set(0, 0.22, -0.215);
torsoGroup.add(backSeam);

// Back Shoulder Yoke (Visible from Back Turnaround)
const backYoke = new THREE.Mesh(new THREE.CylinderGeometry(0.236, 0.230, 0.08, 24, 1, false, Math.PI * 0.75, Math.PI * 0.5), maroonBlazerMat);
backYoke.name = 'backYoke';
backYoke.position.y = 0.38;
torsoGroup.add(backYoke);

// Lower Blazer Skirt / Hem
const jacketSkirtGeo = new THREE.CylinderGeometry(0.196, 0.225, 0.16, 24);
const jacketSkirt = new THREE.Mesh(jacketSkirtGeo, maroonBlazerMat);
jacketSkirt.name = 'jacketSkirt';
jacketSkirt.position.y = -0.05;
torsoGroup.add(jacketSkirt);

// Center Back Hem Vent (Slit in blazer skirt at rear)
const backVent = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.14, 0.012), creamPipingMat);
backVent.name = 'backVent';
backVent.position.set(0, -0.06, -0.216);
torsoGroup.add(backVent);

// Cream Piping around jacket hem
const hemPipingGeo = new THREE.TorusGeometry(0.225, 0.008, 8, 28);
const hemPiping = new THREE.Mesh(hemPipingGeo, creamPipingMat);
hemPiping.name = 'hemPiping';
hemPiping.rotation.x = Math.PI / 2;
hemPiping.position.y = -0.13;
torsoGroup.add(hemPiping);

// Inner Crisp White Dress Shirt
const shirtGeo = new THREE.BoxGeometry(0.135, 0.33, 0.04);
const shirtMesh = new THREE.Mesh(shirtGeo, whiteShirtMat);
shirtMesh.name = 'shirtMesh';
shirtMesh.position.set(0, 0.26, 0.120);
torsoGroup.add(shirtMesh);

// Structured Shirt Collar Tips
const collarGeo = new THREE.BoxGeometry(0.052, 0.052, 0.016);
const leftCollar = new THREE.Mesh(collarGeo, whiteShirtMat);
leftCollar.name = 'leftCollar';
leftCollar.position.set(-0.046, 0.41, 0.116);
leftCollar.rotation.set(0.1, 0, -0.35);
torsoGroup.add(leftCollar);

const rightCollar = new THREE.Mesh(collarGeo, whiteShirtMat);
rightCollar.name = 'rightCollar';
rightCollar.position.set(0.046, 0.41, 0.116);
rightCollar.rotation.set(0.1, 0, 0.35);
torsoGroup.add(rightCollar);

// Maroon Tie with Structured Windsor Knot
const tieKnotGeo = new THREE.ConeGeometry(0.025, 0.038, 12);
const tieKnot = new THREE.Mesh(tieKnotGeo, maroonBlazerMat);
tieKnot.name = 'tieKnot';
tieKnot.rotation.x = Math.PI;
tieKnot.position.set(0, 0.38, 0.128);
torsoGroup.add(tieKnot);

const tieBodyGeo = new THREE.BoxGeometry(0.044, 0.26, 0.016);
const tieBody = new THREE.Mesh(tieBodyGeo, maroonBlazerMat);
tieBody.name = 'tieBody';
tieBody.position.set(0, 0.24, 0.130);
torsoGroup.add(tieBody);

// Lapels with Cream Piping
const createLapel = (isRight) => {
  const group = new THREE.Group();
  group.name = isRight ? 'rightLapelGroup' : 'leftLapelGroup';
  const xSign = isRight ? 1 : -1;

  const lapelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.28, 0.018), maroonBlazerMat);
  lapelMesh.name = isRight ? 'rightLapelMesh' : 'leftLapelMesh';
  group.add(lapelMesh);

  const piping = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.29, 8), creamPipingMat);
  piping.name = isRight ? 'rightLapelPiping' : 'leftLapelPiping';
  piping.position.x = xSign * 0.033;
  group.add(piping);

  group.position.set(xSign * 0.084, 0.28, 0.126);
  group.rotation.z = xSign * 0.20;
  return group;
};
torsoGroup.add(createLapel(false));
torsoGroup.add(createLapel(true));

// Cream/Gold Buttons
const buttonGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.008, 16);
const topButton = new THREE.Mesh(buttonGeo, creamPipingMat);
topButton.name = 'topButton';
topButton.rotation.x = Math.PI / 2;
topButton.position.set(0, 0.16, 0.187);
torsoGroup.add(topButton);

const bottomButton = new THREE.Mesh(buttonGeo, creamPipingMat);
bottomButton.name = 'bottomButton';
bottomButton.rotation.x = Math.PI / 2;
bottomButton.position.set(0, 0.07, 0.187);
torsoGroup.add(bottomButton);

// Pocket Flaps with Cream Piping Trim
const createPocket = (isRight) => {
  const group = new THREE.Group();
  group.name = isRight ? 'rightPocket' : 'leftPocket';
  const xSign = isRight ? 1 : -1;

  const flap = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.019, 0.012), maroonBlazerMat);
  group.add(flap);

  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.004, 0.014), creamPipingMat);
  trim.position.y = -0.008;
  group.add(trim);

  group.position.set(xSign * 0.138, 0.05, 0.167);
  group.rotation.y = xSign * 0.22;
  return group;
};
torsoGroup.add(createPocket(false));
torsoGroup.add(createPocket(true));

// Official AEC Shield Crest on Left Chest Pocket
const aecBadgeGroup = new THREE.Group();
aecBadgeGroup.name = 'aecBadgeGroup';
aecBadgeGroup.position.set(0.108, 0.29, 0.147);

// Outer Cream Shield Trim
const badgeOuter = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.090, 0.006), creamPipingMat);
badgeOuter.name = 'badgeOuter';
aecBadgeGroup.add(badgeOuter);

// Inner Maroon Shield Face
const badgeInner = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.078, 0.008), badgeShieldMat);
badgeInner.name = 'badgeInner';
badgeInner.position.z = 0.002;
aecBadgeGroup.add(badgeInner);

// Gold Crest Emblem / Collegiate Tower & Star Icon
const badgeEmblem = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.042, 0.010), goldAccentMat);
badgeEmblem.name = 'badgeEmblem';
badgeEmblem.position.z = 0.004;
aecBadgeGroup.add(badgeEmblem);

torsoGroup.add(aecBadgeGroup);

// 3. NECK GROUP
const neckGroup = new THREE.Group();
neckGroup.name = 'neckGroup';
neckGroup.position.set(0, 0.44, 0);
torsoGroup.add(neckGroup);

const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.086, 0.11, 20), skinMat);
neckMesh.name = 'neckMesh';
neckMesh.position.y = 0.055;
neckGroup.add(neckMesh);

// 4. HEAD GROUP & FACIAL FEATURES
const headGroup = new THREE.Group();
headGroup.name = 'headGroup';
headGroup.position.set(0, 0.11, 0);
neckGroup.add(headGroup);

// Stylized Cranium & Jawline
const headGeo = new THREE.SphereGeometry(0.180, 32, 32);
headGeo.scale(1.0, 1.14, 1.05);
const head = new THREE.Mesh(headGeo, skinMat);
head.name = 'head';
head.position.y = 0.12;
headGroup.add(head);

// Defined Chin & Jaw
const chinGeo = new THREE.SphereGeometry(0.078, 20, 20);
chinGeo.scale(1.1, 0.86, 1.0);
const chin = new THREE.Mesh(chinGeo, skinMat);
chin.name = 'chin';
chin.position.set(0, 0.02, 0.118);
headGroup.add(chin);

// Sculpted Nose with bridge and rounded tip (Smooth organic shading)
const nose = new THREE.Group();
nose.name = 'nose';

const noseBridge = new THREE.Mesh(
  new THREE.CylinderGeometry(0.009, 0.013, 0.052, 16),
  skinMat
);
noseBridge.name = 'noseBridge';
noseBridge.rotation.x = -Math.PI / 2 + 0.18;
noseBridge.position.set(0, 0.122, 0.186);
nose.add(noseBridge);

const noseTipGeo = new THREE.SphereGeometry(0.014, 16, 16);
noseTipGeo.scale(1.0, 0.88, 1.1);
const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
noseTip.name = 'noseTip';
noseTip.position.set(0, 0.100, 0.198);
nose.add(noseTip);

headGroup.add(nose);

// Animated Expressive Mouth
const mouthGroup = new THREE.Group();
mouthGroup.name = 'mouthGroup';
mouthGroup.position.set(0, 0.052, 0.160);
headGroup.add(mouthGroup);

const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.010, 0.012), lipMat);
upperLip.name = 'upperLip';
upperLip.position.y = 0.005;
mouthGroup.add(upperLip);

const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.011, 0.012), lipMat);
lowerLip.name = 'lowerLip';
lowerLip.position.y = -0.005;
mouthGroup.add(lowerLip);

const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.008, 0.008), eyeWhiteMat);
teeth.name = 'teeth';
teeth.position.z = -0.004;
mouthGroup.add(teeth);

// Expressive Eyes (Hazels with Dual Specular Catchlights & Crisp Sclera)
const createEye = (isRight) => {
  const eyePivot = new THREE.Group();
  eyePivot.name = isRight ? 'rightEye' : 'leftEye';
  const xOffset = isRight ? 0.064 : -0.064;
  eyePivot.position.set(xOffset, 0.142, 0.155);

  const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.036, 20, 20), eyeWhiteMat);
  eyeball.name = isRight ? 'rightEyeball' : 'leftEyeball';
  eyeball.scale.set(1.1, 0.92, 0.85);
  eyePivot.add(eyeball);

  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.021, 24), irisMat);
  iris.name = isRight ? 'rightIris' : 'leftIris';
  iris.position.z = 0.032;
  eyePivot.add(iris);

  const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.010, 20), pupilMat);
  pupil.name = isRight ? 'rightPupil' : 'leftPupil';
  pupil.position.z = 0.034;
  eyePivot.add(pupil);

  const gleam1 = new THREE.Mesh(new THREE.CircleGeometry(0.0050, 12), eyeGleamMat);
  gleam1.position.set(0.006, 0.007, 0.036);
  eyePivot.add(gleam1);

  const gleam2 = new THREE.Mesh(new THREE.CircleGeometry(0.0028, 8), eyeGleamMat);
  gleam2.position.set(-0.005, -0.005, 0.036);
  eyePivot.add(gleam2);

  return eyePivot;
};
headGroup.add(createEye(false));
headGroup.add(createEye(true));

// Animated Eyebrows (Distinct from skin, positioned naturally above eyes with clearance from glasses)
const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.009, 0.008), browMat);
leftBrow.name = 'leftBrow';
leftBrow.position.set(-0.064, 0.186, 0.176);
leftBrow.rotation.z = 0.04;
headGroup.add(leftBrow);

const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.009, 0.008), browMat);
rightBrow.name = 'rightBrow';
rightBrow.position.set(0.064, 0.186, 0.176);
rightBrow.rotation.z = -0.04;
headGroup.add(rightBrow);

// Glasses Group (Thin dark-rimmed spectacles with clear separation and transparent lenses)
const glassesGroup = new THREE.Group();
glassesGroup.name = 'glassesGroup';
glassesGroup.position.set(0, 0.138, 0.174);
headGroup.add(glassesGroup);

const rimGeo = new THREE.TorusGeometry(0.036, 0.0028, 16, 32);
const leftRim = new THREE.Mesh(rimGeo, glassesFrameMat);
leftRim.name = 'leftRim';
leftRim.position.x = -0.064;
leftRim.scale.set(1.04, 0.94, 1.0);
glassesGroup.add(leftRim);

const lensGeo = new THREE.CircleGeometry(0.034, 24);
const leftLens = new THREE.Mesh(lensGeo, glassLensMat);
leftLens.name = 'leftLens';
leftLens.position.set(-0.064, 0, 0.002);
leftLens.scale.set(1.04, 0.94, 1.0);
glassesGroup.add(leftLens);

const rightRim = new THREE.Mesh(rimGeo, glassesFrameMat);
rightRim.name = 'rightRim';
rightRim.position.x = 0.064;
rightRim.scale.set(1.04, 0.94, 1.0);
glassesGroup.add(rightRim);

const rightLens = new THREE.Mesh(lensGeo, glassLensMat);
rightLens.name = 'rightLens';
rightLens.position.set(0.064, 0, 0.002);
rightLens.scale.set(1.04, 0.94, 1.0);
glassesGroup.add(rightLens);

const glassesBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.042, 12), glassesFrameMat);
glassesBridge.name = 'glassesBridge';
glassesBridge.rotation.z = Math.PI / 2;
glassesBridge.position.set(0, 0.010, 0.003);
glassesGroup.add(glassesBridge);

const leftTemple = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.003, 0.185), glassesFrameMat);
leftTemple.name = 'leftTemple';
leftTemple.position.set(-0.108, 0.008, -0.090);
leftTemple.rotation.y = 0.12;
glassesGroup.add(leftTemple);

const rightTemple = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.003, 0.185), glassesFrameMat);
rightTemple.name = 'rightTemple';
rightTemple.position.set(0.108, 0.008, -0.090);
rightTemple.rotation.y = -0.12;
glassesGroup.add(rightTemple);

// Volumized Swept-Up Hairstyle (Clean forehead visibility and distinct separation from skin)
const hairGroup = new THREE.Group();
hairGroup.name = 'hairGroup';
headGroup.add(hairGroup);

const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.194, 28, 28), hairMat);
hairBase.name = 'hairBase';
hairBase.scale.set(1.03, 1.02, 1.04);
hairBase.position.set(0, 0.205, -0.045);
hairGroup.add(hairBase);

// Tapered Nape Neckline (Visible in Back View)
const hairNape = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.080, 0.10, 16), hairMat);
hairNape.name = 'hairNape';
hairNape.position.set(0, 0.04, -0.085);
hairNape.rotation.x = -0.22;
hairGroup.add(hairNape);

// Distinct Swept Quiff Locks (From Front & 3/4 Turnaround Reference - positioned on top/upward)
const createWaveLock = (pos, rot, scale, name) => {
  const lockGeo = new THREE.SphereGeometry(0.088, 16, 16);
  lockGeo.scale(scale[0], scale[1], scale[2]);
  const lockMesh = new THREE.Mesh(lockGeo, hairMat);
  lockMesh.name = name;
  lockMesh.position.set(...pos);
  lockMesh.rotation.set(...rot);
  return lockMesh;
};
hairGroup.add(createWaveLock([0.02, 0.30, 0.06], [0.10, 0.15, -0.25], [1.25, 0.88, 1.15], 'hairLock1'));
hairGroup.add(createWaveLock([0.08, 0.31, 0.04], [0.15, 0.25, -0.35], [1.08, 0.82, 0.98], 'hairLock2'));
hairGroup.add(createWaveLock([-0.05, 0.29, 0.05], [0.05, -0.10, -0.15], [0.98, 0.78, 0.98], 'hairLock3'));
hairGroup.add(createWaveLock([0.01, 0.34, -0.01], [0, 0.10, -0.20], [1.18, 0.88, 1.25], 'hairLock4'));

// Modeled Ears with Natural Placement
const earGeo = new THREE.SphereGeometry(0.038, 16, 16);
earGeo.scale(0.5, 1.15, 0.75);
const leftEar = new THREE.Mesh(earGeo, skinMat);
leftEar.name = 'leftEar';
leftEar.position.set(-0.18, 0.12, 0);
headGroup.add(leftEar);

const rightEar = new THREE.Mesh(earGeo, skinMat);
rightEar.name = 'rightEar';
rightEar.position.set(0.18, 0.12, 0);
headGroup.add(rightEar);

// ==========================================
// ARMS, SKELETAL JOINTS & ARTICULATED DIGITS
// ==========================================
const UPPER_ARM_LEN = 0.28;
const FOREARM_LEN = 0.26;

// Create fully articulated hand with individual digits for Open, Pointing, and Relaxed poses
const createArticulatedHand = (isRight) => {
  const handGroup = new THREE.Group();
  handGroup.name = isRight ? 'rightHand' : 'leftHand';
  const xSign = isRight ? 1 : -1;

  // Palm
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.066, 0.026), skinMat);
  palm.name = isRight ? 'rightPalm' : 'leftPalm';
  palm.position.y = -0.033;
  handGroup.add(palm);

  // Thumb Base Pivot & Mesh
  const thumbGroup = new THREE.Group();
  thumbGroup.name = isRight ? 'rightThumb' : 'leftThumb';
  thumbGroup.position.set(xSign * -0.028, -0.018, 0.010);
  thumbGroup.rotation.set(0.15, xSign * -0.25, xSign * 0.42);

  const thumbMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0075, 0.042, 8), skinMat);
  thumbMesh.position.y = -0.021;
  thumbGroup.add(thumbMesh);
  handGroup.add(thumbGroup);

  // Four Articulated Fingers (Index, Middle, Ring, Pinky) with individual knuckle pivots
  const fingerConfigs = [
    { name: 'Index', len: 0.062, x: -0.018, rX: 0.10 },
    { name: 'Middle', len: 0.068, x: -0.006, rX: 0.12 },
    { name: 'Ring', len: 0.060, x: 0.006, rX: 0.14 },
    { name: 'Pinky', len: 0.050, x: 0.018, rX: 0.16 },
  ];

  fingerConfigs.forEach((cfg) => {
    const fingerPivot = new THREE.Group();
    fingerPivot.name = (isRight ? 'right' : 'left') + cfg.name;
    fingerPivot.position.set(cfg.x * xSign, -0.066, 0.002);
    fingerPivot.rotation.x = cfg.rX;

    const fingerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.006, cfg.len, 8), skinMat);
    fingerMesh.position.y = -cfg.len / 2;
    fingerPivot.add(fingerMesh);

    handGroup.add(fingerPivot);
  });

  return handGroup;
};

// Left Arm Chain: Shoulder -> UpperArm -> Elbow -> Wrist -> Hand
const leftShoulder = new THREE.Group();
leftShoulder.name = 'leftShoulder';
leftShoulder.position.set(-0.24, 0.40, 0);
torsoGroup.add(leftShoulder);

const leftUpperArm = new THREE.Group();
leftUpperArm.name = 'leftUpperArm';
leftShoulder.add(leftUpperArm);

const leftUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, UPPER_ARM_LEN, 18), maroonBlazerMat);
leftUpperArmMesh.name = 'leftUpperArmMesh';
leftUpperArmMesh.position.y = -UPPER_ARM_LEN / 2;
leftUpperArm.add(leftUpperArmMesh);

const leftElbow = new THREE.Group();
leftElbow.name = 'leftElbow';
leftElbow.position.set(0, -UPPER_ARM_LEN, 0);
leftUpperArm.add(leftElbow);

const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.040, FOREARM_LEN, 18), maroonBlazerMat);
leftForearmMesh.name = 'leftForearmMesh';
leftForearmMesh.position.y = -FOREARM_LEN / 2;
leftElbow.add(leftForearmMesh);

const leftCuffPiping = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.006, 8, 24), creamPipingMat);
leftCuffPiping.name = 'leftCuffPiping';
leftCuffPiping.rotation.x = Math.PI / 2;
leftCuffPiping.position.y = -FOREARM_LEN + 0.02;
leftElbow.add(leftCuffPiping);

const leftWrist = new THREE.Group();
leftWrist.name = 'leftWrist';
leftWrist.position.set(0, -FOREARM_LEN, 0);
leftElbow.add(leftWrist);
leftWrist.add(createArticulatedHand(false));

// Right Arm Chain: Shoulder -> UpperArm -> Elbow -> Wrist -> Hand
const rightShoulder = new THREE.Group();
rightShoulder.name = 'rightShoulder';
rightShoulder.position.set(0.24, 0.40, 0);
torsoGroup.add(rightShoulder);

const rightUpperArm = new THREE.Group();
rightUpperArm.name = 'rightUpperArm';
rightShoulder.add(rightUpperArm);

const rightUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, UPPER_ARM_LEN, 18), maroonBlazerMat);
rightUpperArmMesh.name = 'rightUpperArmMesh';
rightUpperArmMesh.position.y = -UPPER_ARM_LEN / 2;
rightUpperArm.add(rightUpperArmMesh);

const rightElbow = new THREE.Group();
rightElbow.name = 'rightElbow';
rightElbow.position.set(0, -UPPER_ARM_LEN, 0);
rightUpperArm.add(rightElbow);

const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.040, FOREARM_LEN, 18), maroonBlazerMat);
rightForearmMesh.name = 'rightForearmMesh';
rightForearmMesh.position.y = -FOREARM_LEN / 2;
rightElbow.add(rightForearmMesh);

const rightCuffPiping = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.006, 8, 24), creamPipingMat);
rightCuffPiping.name = 'rightCuffPiping';
rightCuffPiping.rotation.x = Math.PI / 2;
rightCuffPiping.position.y = -FOREARM_LEN + 0.02;
rightElbow.add(rightCuffPiping);

const rightWrist = new THREE.Group();
rightWrist.name = 'rightWrist';
rightWrist.position.set(0, -FOREARM_LEN, 0);
rightElbow.add(rightWrist);
rightWrist.add(createArticulatedHand(true));

// ==========================================
// LEGS & POLISHED BLACK FORMAL OXFORD SHOES
// ==========================================
const THIGH_LEN = 0.43;
const SHIN_LEN = 0.43;

// Left Leg
const leftHip = new THREE.Group();
leftHip.name = 'leftHip';
leftHip.position.set(-0.098, -0.04, 0);
pelvis.add(leftHip);

const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.070, 0.058, THIGH_LEN, 18), creamTrousersMat);
leftThighMesh.name = 'leftThighMesh';
leftThighMesh.position.y = -THIGH_LEN / 2;
leftHip.add(leftThighMesh);

// Front Sharp Crease Line
const leftThighCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, THIGH_LEN, 0.004), creamPipingMat);
leftThighCrease.name = 'leftThighCrease';
leftThighCrease.position.set(0, -THIGH_LEN / 2, 0.065);
leftHip.add(leftThighCrease);

// Rear Crease Line
const leftThighBackCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, THIGH_LEN, 0.004), creamPipingMat);
leftThighBackCrease.name = 'leftThighBackCrease';
leftThighBackCrease.position.set(0, -THIGH_LEN / 2, -0.065);
leftHip.add(leftThighBackCrease);

const leftKnee = new THREE.Group();
leftKnee.name = 'leftKnee';
leftKnee.position.set(0, -THIGH_LEN, 0);
leftHip.add(leftKnee);

const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.050, SHIN_LEN, 18), creamTrousersMat);
leftShinMesh.name = 'leftShinMesh';
leftShinMesh.position.y = -SHIN_LEN / 2;
leftKnee.add(leftShinMesh);

const leftShinCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, SHIN_LEN, 0.004), creamPipingMat);
leftShinCrease.name = 'leftShinCrease';
leftShinCrease.position.set(0, -SHIN_LEN / 2, 0.054);
leftKnee.add(leftShinCrease);

const leftShinBackCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, SHIN_LEN, 0.004), creamPipingMat);
leftShinBackCrease.name = 'leftShinBackCrease';
leftShinBackCrease.position.set(0, -SHIN_LEN / 2, -0.054);
leftKnee.add(leftShinBackCrease);

// Left Formal Oxford Shoe
const leftShoeGroup = new THREE.Group();
leftShoeGroup.name = 'leftShoeGroup';
leftShoeGroup.position.set(0, -SHIN_LEN - 0.02, 0.04);
leftKnee.add(leftShoeGroup);

const leftShoeBody = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.055, 0.20), shoeMat);
leftShoeBody.name = 'leftShoeBody';
leftShoeGroup.add(leftShoeBody);

// Oxford Toe Cap Seam
const leftToeCap = new THREE.Mesh(new THREE.BoxGeometry(0.099, 0.056, 0.003), shoeSoleMat);
leftToeCap.name = 'leftToeCap';
leftToeCap.position.set(0, 0, 0.065);
leftShoeGroup.add(leftToeCap);

// Shoe Sole Welt
const leftShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.102, 0.012, 0.21), shoeSoleMat);
leftShoeSole.name = 'leftShoeSole';
leftShoeSole.position.set(0, -0.028, 0);
leftShoeGroup.add(leftShoeSole);

// Formal Low Heel
const leftShoeHeel = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.025, 0.07), shoeMat);
leftShoeHeel.name = 'leftShoeHeel';
leftShoeHeel.position.set(0, -0.038, -0.06);
leftShoeGroup.add(leftShoeHeel);

// Right Leg
const rightHip = new THREE.Group();
rightHip.name = 'rightHip';
rightHip.position.set(0.098, -0.04, 0);
pelvis.add(rightHip);

const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.070, 0.058, THIGH_LEN, 18), creamTrousersMat);
rightThighMesh.name = 'rightThighMesh';
rightThighMesh.position.y = -THIGH_LEN / 2;
rightHip.add(rightThighMesh);

const rightThighCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, THIGH_LEN, 0.004), creamPipingMat);
rightThighCrease.name = 'rightThighCrease';
rightThighCrease.position.set(0, -THIGH_LEN / 2, 0.065);
rightHip.add(rightThighCrease);

const rightThighBackCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, THIGH_LEN, 0.004), creamPipingMat);
rightThighBackCrease.name = 'rightThighBackCrease';
rightThighBackCrease.position.set(0, -THIGH_LEN / 2, -0.065);
rightHip.add(rightThighBackCrease);

const rightKnee = new THREE.Group();
rightKnee.name = 'rightKnee';
rightKnee.position.set(0, -THIGH_LEN, 0);
rightHip.add(rightKnee);

const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.050, SHIN_LEN, 18), creamTrousersMat);
rightShinMesh.name = 'rightShinMesh';
rightShinMesh.position.y = -SHIN_LEN / 2;
rightKnee.add(rightShinMesh);

const rightShinCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, SHIN_LEN, 0.004), creamPipingMat);
rightShinCrease.name = 'rightShinCrease';
rightShinCrease.position.set(0, -SHIN_LEN / 2, 0.054);
rightKnee.add(rightShinCrease);

const rightShinBackCrease = new THREE.Mesh(new THREE.BoxGeometry(0.003, SHIN_LEN, 0.004), creamPipingMat);
rightShinBackCrease.name = 'rightShinBackCrease';
rightShinBackCrease.position.set(0, -SHIN_LEN / 2, -0.054);
rightKnee.add(rightShinBackCrease);

// Right Formal Oxford Shoe
const rightShoeGroup = new THREE.Group();
rightShoeGroup.name = 'rightShoeGroup';
rightShoeGroup.position.set(0, -SHIN_LEN - 0.02, 0.04);
rightKnee.add(rightShoeGroup);

const rightShoeBody = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.055, 0.20), shoeMat);
rightShoeBody.name = 'rightShoeBody';
rightShoeGroup.add(rightShoeBody);

const rightToeCap = new THREE.Mesh(new THREE.BoxGeometry(0.099, 0.056, 0.003), shoeSoleMat);
rightToeCap.name = 'rightToeCap';
rightToeCap.position.set(0, 0, 0.065);
rightShoeGroup.add(rightToeCap);

const rightShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.102, 0.012, 0.21), shoeSoleMat);
rightShoeSole.name = 'rightShoeSole';
rightShoeSole.position.set(0, -0.028, 0);
rightShoeGroup.add(rightShoeSole);

const rightShoeHeel = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.025, 0.07), shoeMat);
rightShoeHeel.name = 'rightShoeHeel';
rightShoeHeel.position.set(0, -0.038, -0.06);
rightShoeGroup.add(rightShoeHeel);

// ==========================================
// EXPORT TO BINARY GLB & ASSET WRAPPER
// ==========================================
const exporter = new GLTFExporter();
exporter.parse(
  root,
  (glbBuffer) => {
    const glbPath = path.resolve(process.cwd(), 'public/models/campus_guide.glb');
    fs.mkdirSync(path.dirname(glbPath), { recursive: true });
    fs.writeFileSync(glbPath, Buffer.from(glbBuffer));
    console.log(`Successfully exported Master Reference GLB model to ${glbPath} (${glbBuffer.byteLength} bytes)`);

    // Also export base64 asset TypeScript module for offline/zero-latency loading
    const b64 = Buffer.from(glbBuffer).toString('base64');
    const assetTsContent = `/**
 * Pre-compiled High-Fidelity Arunai Engineering College 3D Campus Guide GLB Model Asset
 * Generated with full humanoid skeletal hierarchy matching the official master character sheet.
 */
export const CAMPUS_GUIDE_GLB_URL = '/models/campus_guide.glb';
export const CAMPUS_GUIDE_GLB_BASE64 = '${b64}';

let cachedArrayBuffer: ArrayBuffer | null = null;

export function getCampusGuideGlbBuffer(): ArrayBuffer {
  if (cachedArrayBuffer) return cachedArrayBuffer;
  const binaryString = atob(CAMPUS_GUIDE_GLB_BASE64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  cachedArrayBuffer = bytes.buffer;
  return cachedArrayBuffer;
}
`;
    const assetPath = path.resolve(process.cwd(), 'src/components/character/campusGuideGlbAsset.ts');
    fs.writeFileSync(assetPath, assetTsContent, 'utf-8');
    console.log(`Successfully generated master GLB asset module at ${assetPath}`);
    process.exit(0);
  },
  (err) => {
    console.error('Error exporting GLB:', err);
    process.exit(1);
  },
  { binary: true }
);
