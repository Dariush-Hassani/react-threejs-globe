import * as THREE from "three";
import texture from "./texture.png";

const radius = 4.5;
export const xAxis = new THREE.Vector3(1, 0, 0);
export const yAxis = new THREE.Vector3(0, 1, 0);
export const initialCamera = (camera) => {
  camera.position.z = 13;
  camera.position.x = 0;
  camera.position.y = 0;
  camera.lookAt(0, 0, 0);
};

export const initLights = (scene) => {
  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(0, 0, 10);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  scene.add(light.target);

  const plight1 = new THREE.PointLight(0xff0000, 0.5);
  plight1.position.set(7, 5, 5);
  scene.add(plight1);

  const plight2 = new THREE.PointLight(0xff0000, 0.5);
  plight2.position.set(7, -5, 5);
  scene.add(plight2);

  const plight3 = new THREE.PointLight(0x0000ff, 0.4);
  plight3.position.set(-7, 5, 5);
  scene.add(plight3);

  const plight4 = new THREE.PointLight(0x0000ff, 0.4);
  plight4.position.set(-7, -5, 5);
  scene.add(plight4);
};

export const createGlobe = (scene, meshes, setLoading) => {
  const loadManager = new THREE.LoadingManager();
  loadManager.onLoad = () => {
    setLoading(false);
  };
  let loader = new THREE.TextureLoader(loadManager);
  let geometry = new THREE.SphereGeometry(radius, 60, 60);
  let material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 1,
    map: loader.load(texture),
  });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.name = "sphere";
  mesh.rotateY(Math.PI);
  meshes.add(mesh);
  scene.add(meshes);
};

export const initRings = (scene) => {
  let tStart = 0;
  let tEnd = 2 * Math.PI;
  let color = 0x8cade6;
  let dRadius = 0.025;
  let opacities = [0.9, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  opacities.forEach((x, i) => {
    let geo = new THREE.RingGeometry(
      radius + i * dRadius,
      radius + (i + 1) * dRadius,
      100,
      1,
      tStart,
      tEnd
    );
    let mat = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: x,
    });
    let ringMesh = new THREE.Mesh(geo, mat);
    scene.add(ringMesh);
  });
};

export const raycastMouseDown = (
  e,
  camera,
  scene,
  setClickOnSphere,
  setStartPoint
) => {
  let mouse = { x: 0, y: 0 };
  if (e.type === "mousedown") {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  } else if (e.type === "touchstart") {
    mouse.x = +(e.targetTouches[0].pageX / window.innerWidth) * 2 + -1;
    mouse.y = -(e.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
  }
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children, true);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i]?.object?.name === "sphere") {
      setStartPoint({ x: mouse.x, y: mouse.y });
      setClickOnSphere(true);
      break;
    }
  }
};

export const mouseMove = (
  e,
  clickOnSphere,
  startPoint,
  setStartPoint,
  meshes
) => {
  if (!clickOnSphere) return;
  let mouse = { x: 0, y: 0 };
  if (e.type === "mousemove") {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  } else if (e.type === "touchmove") {
    mouse.x = +(e.targetTouches[0].pageX / window.innerWidth) * 2 + -1;
    mouse.y = -(e.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
  }
  let dy = startPoint.y - mouse.y;
  let dx = startPoint.x - mouse.x;
  setStartPoint({ x: mouse.x, y: mouse.y });
  meshes.rotateOnWorldAxis(xAxis, (dy * Math.PI) / 3);
  meshes.rotateOnWorldAxis(yAxis, -(dx * Math.PI));
};

export const resize = (camera,renderer) => {
  if (window.innerWidth >= window.innerHeight) {
    let aspectRatio = window.innerWidth / window.innerHeight;
    let frustumSize = 13;
    camera.left = (frustumSize * aspectRatio) / -2;
    camera.right = (frustumSize * aspectRatio) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  } else {
    let aspect = window.innerHeight / window.innerWidth;
    let frustumSize = 13;
    camera.left = frustumSize / -2;
    camera.right = frustumSize / 2;
    camera.top = (frustumSize * aspect) / 2;
    camera.bottom = (-frustumSize * aspect) / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};
