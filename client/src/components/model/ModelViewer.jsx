// 3D Model Viewer с Three.js
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const GRID_Y = 0;      // Y координата плоскости платформы
const FIT_SIZE = 50;   // Размер (единиц) в который вписывается модель

const ModelViewer = forwardRef(function ModelViewer({ modelObject, userScale = 1, className = '' }, ref) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const prevModelObjectRef = useRef(null);
  const baseScaleRef = useRef(1);
  const origCenterRef = useRef(new THREE.Vector3());
  const origBboxMinRef = useRef(new THREE.Vector3());

  // Инициализация Three.js сцены
  useEffect(() => {
    if (sceneRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(80, 55, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(500, 500);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(60, 80, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xaabbcc, 0.3);
    dirLight2.position.set(-40, 20, -40);
    scene.add(dirLight2);

    // Платформа (сетка)
    const gridHelper = new THREE.GridHelper(120, 12, 0x999999, 0xdddddd);
    gridHelper.position.y = GRID_Y;
    scene.add(gridHelper);

    // Плоскость под сеткой (для теней)
    const planeGeo = new THREE.PlaneGeometry(120, 120);
    const planeMat = new THREE.MeshLambertMaterial({ color: 0xe8edf2 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = GRID_Y - 0.05;
    plane.receiveShadow = true;
    scene.add(plane);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 15, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 10;
    controls.maxDistance = 1000;
    controls.update();
    controlsRef.current = controls;

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current = null;
      }
      prevModelObjectRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  // Добавление canvas в DOM и настройка ресайза
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const mount = mountRef.current;
    if (!mount || !renderer || !camera) return;

    if (!mount.contains(renderer.domElement)) {
      mount.appendChild(renderer.domElement);
    }

    const setSize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    setSize();

    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [modelObject]);

  // Размещение модели на платформе + обновление масштаба
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Новая модель — полная замена
    if (modelObject !== prevModelObjectRef.current) {
      if (modelRef.current) {
        scene.remove(modelRef.current);
        try {
          modelRef.current.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach(m => m?.dispose && m.dispose());
            }
          });
        } catch (e) {}
        modelRef.current = null;
      }

      prevModelObjectRef.current = modelObject;

      if (!modelObject) return;

      // Сбросить трансформы перед расчётом bbox
      modelObject.position.set(0, 0, 0);
      modelObject.rotation.set(0, 0, 0);
      modelObject.scale.setScalar(1);

      const bbox = new THREE.Box3().setFromObject(modelObject);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      baseScaleRef.current = FIT_SIZE / maxDim;
      origCenterRef.current = center.clone();
      origBboxMinRef.current = bbox.min.clone();

      const wrapper = new THREE.Group();
      wrapper.add(modelObject);
      wrapper.traverse(child => {
        if (child.isMesh) child.castShadow = true;
      });

      scene.add(wrapper);
      modelRef.current = wrapper;
    }

    // Применить масштаб: модель всегда стоит на платформе
    if (modelRef.current) {
      const totalScale = baseScaleRef.current * userScale;
      const c = origCenterRef.current;
      const m = origBboxMinRef.current;

      modelRef.current.scale.setScalar(totalScale);
      // Центрировать по XZ
      modelRef.current.position.x = -c.x * totalScale;
      modelRef.current.position.z = -c.z * totalScale;
      // Нижняя грань модели точно на платформе (GRID_Y)
      modelRef.current.position.y = GRID_Y - m.y * totalScale;
    }
  }, [modelObject, userScale]);

  // Управление видом камеры и вращением модели извне
  useImperativeHandle(ref, () => ({
    setView(preset) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls) return;
      const d = 110;
      const y = 20;
      switch (preset) {
        case 'front':  camera.position.set(0,  y,  d); break;
        case 'back':   camera.position.set(0,  y, -d); break;
        case 'left':   camera.position.set(-d, y,  0); break;
        case 'right':  camera.position.set(d,  y,  0); break;
        case 'top':    camera.position.set(0,  d,  1); break;
        default:       camera.position.set(80, 55, 80); break;
      }
      controls.target.set(0, 15, 0);
      controls.update();
    },
    // Вращение самой модели вокруг оси (не камеры)
    rotateModel(axis, deg) {
      const wrapper = modelRef.current;
      if (!wrapper || wrapper.children.length === 0) return;

      const inner = wrapper.children[0];
      const angle = (deg * Math.PI) / 180;
      const ax =
        axis === 'x' ? new THREE.Vector3(1, 0, 0) :
        axis === 'y' ? new THREE.Vector3(0, 1, 0) :
                       new THREE.Vector3(0, 0, 1);

      // Поворачиваем внутренний объект
      const q = new THREE.Quaternion().setFromAxisAngle(ax, angle);
      inner.quaternion.premultiply(q);
      inner.updateMatrixWorld(true);

      // Пересчитываем bbox повёрнутого объекта (при масштабе 1)
      wrapper.scale.setScalar(1);
      wrapper.position.set(0, 0, 0);
      const bbox = new THREE.Box3().setFromObject(wrapper);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // Обновляем базовый масштаб и сохранённые параметры
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      baseScaleRef.current = FIT_SIZE / maxDim;
      origCenterRef.current = center.clone();
      origBboxMinRef.current = bbox.min.clone();

      // Применяем масштаб и ставим на платформу
      const totalScale = baseScaleRef.current * userScale;
      wrapper.scale.setScalar(totalScale);
      wrapper.position.x = -center.x * totalScale;
      wrapper.position.z = -center.z * totalScale;
      wrapper.position.y = GRID_Y - bbox.min.y * totalScale;
    },
  }));

  return (
    <div
      ref={mountRef}
      className={`w-full h-full rounded-lg ${className}`}
      style={{ minHeight: '280px' }}
    />
  );
});

export default ModelViewer;
