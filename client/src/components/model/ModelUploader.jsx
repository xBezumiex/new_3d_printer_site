// Компонент загрузки 3D моделей
import { useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useModel } from '../../context/ModelContext';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = import.meta.env.VITE_MAX_FILE_SIZE || 52428800; // 50MB

export default function ModelUploader() {
  const fileInputRef = useRef(null);
  const { setModel, setIsLoading, setLoadError, isLoading, loadError } = useModel();

  // Расчет объема и веса модели
  const calculateVolumeAndWeight = (geometry, material, infill) => {
    let volume = 0;

    if (geometry.isBufferGeometry) {
      const position = geometry.attributes.position;
      const index = geometry.index;

      if (index) {
        // Indexed geometry
        for (let i = 0; i < index.count; i += 3) {
          const a = new THREE.Vector3().fromBufferAttribute(position, index.getX(i));
          const b = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 1));
          const c = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 2));

          volume += Math.abs(a.dot(b.cross(c))) / 6;
        }
      } else {
        // Non-indexed geometry
        for (let i = 0; i < position.count; i += 3) {
          const a = new THREE.Vector3().fromBufferAttribute(position, i);
          const b = new THREE.Vector3().fromBufferAttribute(position, i + 1);
          const c = new THREE.Vector3().fromBufferAttribute(position, i + 2);

          volume += Math.abs(a.dot(b.cross(c))) / 6;
        }
      }
    }

    // Конвертация из условных единиц в см³
    volume = Math.abs(volume) / 1000;

    // Расчет веса (используем значения из контекста, если они есть)
    const density = material?.density || 1.24; // PLA по умолчанию
    const infillFactor = (infill || 20) / 100;
    const weight = volume * density * infillFactor;

    return {
      volume: Math.max(0.01, volume).toFixed(2),
      weight: Math.max(0.01, weight).toFixed(2),
    };
  };

  // Обработка загруженной модели
  const handleModelLoaded = (object3d, file) => {
    let mesh;
    if (object3d.isMesh) {
      mesh = object3d;
    } else if (object3d.isBufferGeometry || object3d.isGeometry) {
      mesh = new THREE.Mesh(
        object3d,
        new THREE.MeshPhongMaterial({
          color: 0x3b82f6,
          shininess: 30,
          flatShading: false,
          side: THREE.DoubleSide,
        })
      );
    } else {
      const firstMesh = object3d.getObjectByProperty
        ? object3d.getObjectByProperty('type', 'Mesh')
        : null;
      if (firstMesh) {
        mesh = firstMesh.clone();
      } else {
        mesh = object3d;
      }
    }

    // Расчет объема и веса
    let geometry = null;
    if (mesh.geometry) {
      geometry = mesh.geometry;
    } else if (mesh.children && mesh.children.length > 0) {
      const firstChild = mesh.children.find((child) => child.geometry);
      geometry = firstChild?.geometry;
    }

    let volumeData = { volume: 0, weight: 0 };
    if (geometry) {
      volumeData = calculateVolumeAndWeight(geometry);
    }

    // Сохраняем модель в контекст
    setModel({
      object: mesh,
      fileName: file.name,
      fileSize: file.size,
      ...volumeData,
    });

    toast.success(`Модель "${file.name}" загружена успешно!`);
    setIsLoading(false);
    setLoadError(null);
  };

  // Обработчик загрузки файла
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadError(null);

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      const error = `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      setLoadError(error);
      toast.error(error);
      setIsLoading(false);
      return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    const supportedFormats = ['stl', 'obj', 'ply', 'gltf', 'glb'];

    if (!supportedFormats.includes(extension)) {
      const error = 'Неподдерживаемый формат файла. Поддерживаются: STL, OBJ, PLY, GLTF, GLB';
      setLoadError(error);
      toast.error(error);
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      const error = 'Ошибка чтения файла';
      setLoadError(error);
      toast.error(error);
      setIsLoading(false);
    };

    try {
      switch (extension) {
        case 'stl':
          reader.onload = (event) => {
            try {
              const arrayBuffer = event.target.result;
              const stlLoader = new STLLoader();
              const geometry = stlLoader.parse(arrayBuffer);
              geometry.computeVertexNormals();
              const material = new THREE.MeshPhongMaterial({
                color: 0x3b82f6,
                shininess: 30,
                side: THREE.DoubleSide,
              });
              const mesh = new THREE.Mesh(geometry, material);
              handleModelLoaded(mesh, file);
            } catch (err) {
              console.error(err);
              const error = 'Ошибка парсинга STL: ' + err.message;
              setLoadError(error);
              toast.error(error);
              setIsLoading(false);
            }
          };
          reader.readAsArrayBuffer(file);
          break;

        case 'obj':
          reader.onload = (event) => {
            try {
              const text = event.target.result;
              const objLoader = new OBJLoader();
              const obj = objLoader.parse(text);
              handleModelLoaded(obj, file);
            } catch (err) {
              console.error(err);
              const error = 'Ошибка парсинга OBJ: ' + err.message;
              setLoadError(error);
              toast.error(error);
              setIsLoading(false);
            }
          };
          reader.readAsText(file);
          break;

        case 'ply':
          reader.onload = (event) => {
            try {
              const contents = event.target.result;
              const plyLoader = new PLYLoader();
              const geometry = plyLoader.parse(contents);
              geometry.computeVertexNormals();
              const material = new THREE.MeshPhongMaterial({
                color: 0x3b82f6,
                shininess: 30,
                side: THREE.DoubleSide,
              });
              const mesh = new THREE.Mesh(geometry, material);
              handleModelLoaded(mesh, file);
            } catch (err) {
              console.error(err);
              const error = 'Ошибка парсинга PLY: ' + err.message;
              setLoadError(error);
              toast.error(error);
              setIsLoading(false);
            }
          };
          reader.readAsArrayBuffer(file);
          break;

        case 'gltf':
        case 'glb':
          reader.onload = (event) => {
            try {
              const data = event.target.result;
              const gltfLoader = new GLTFLoader();
              if (extension === 'glb') {
                gltfLoader.parse(
                  data,
                  '',
                  (gltf) => {
                    handleModelLoaded(gltf.scene || gltf.scenes?.[0] || gltf, file);
                  },
                  (err) => {
                    console.error(err);
                    const error = 'Ошибка парсинга GLB: ' + (err.message || err);
                    setLoadError(error);
                    toast.error(error);
                    setIsLoading(false);
                  }
                );
              } else {
                const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
                gltfLoader.parse(
                  text,
                  '',
                  (gltf) => {
                    handleModelLoaded(gltf.scene || gltf.scenes?.[0] || gltf, file);
                  },
                  (err) => {
                    console.error(err);
                    const error = 'Ошибка парсинга GLTF: ' + (err.message || err);
                    setLoadError(error);
                    toast.error(error);
                    setIsLoading(false);
                  }
                );
              }
            } catch (err) {
              console.error(err);
              const error = 'Ошибка при загрузке GLTF: ' + err.message;
              setLoadError(error);
              toast.error(error);
              setIsLoading(false);
            }
          };
          if (extension === 'glb') reader.readAsArrayBuffer(file);
          else reader.readAsText(file);
          break;

        default:
          const error = 'Неподдерживаемый формат файла';
          setLoadError(error);
          toast.error(error);
          setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      const error = 'Ошибка обработки файла: ' + err.message;
      setLoadError(error);
      toast.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.obj,.ply,.gltf,.glb"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />

        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {isLoading ? 'Загрузка...' : 'Загрузите 3D модель'}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Поддерживаются форматы: STL, OBJ, PLY, GLTF, GLB
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Максимальный размер: {MAX_FILE_SIZE / 1024 / 1024}MB
        </p>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-700 dark:text-gray-300">Обработка файла...</span>
        </div>
      )}
    </div>
  );
}
