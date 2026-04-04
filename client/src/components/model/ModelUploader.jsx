import { useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useModel } from '../../context/ModelContext';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = import.meta.env.VITE_MAX_FILE_SIZE || 52428800;

export default function ModelUploader() {
  const fileInputRef = useRef(null);
  const { setModel, setIsLoading, setLoadError, isLoading, loadError } = useModel();

  const calculateVolumeAndWeight = (geometry, material, infill) => {
    let volume = 0;
    if (geometry.isBufferGeometry) {
      const position = geometry.attributes.position;
      const index = geometry.index;
      if (index) {
        for (let i = 0; i < index.count; i += 3) {
          const a = new THREE.Vector3().fromBufferAttribute(position, index.getX(i));
          const b = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 1));
          const c = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 2));
          volume += Math.abs(a.dot(b.cross(c))) / 6;
        }
      } else {
        for (let i = 0; i < position.count; i += 3) {
          const a = new THREE.Vector3().fromBufferAttribute(position, i);
          const b = new THREE.Vector3().fromBufferAttribute(position, i + 1);
          const c = new THREE.Vector3().fromBufferAttribute(position, i + 2);
          volume += Math.abs(a.dot(b.cross(c))) / 6;
        }
      }
    }
    volume = Math.abs(volume) / 1000;
    const density = material?.density || 1.24;
    const infillFactor = (infill || 20) / 100;
    const weight = volume * density * infillFactor;
    return {
      volume: Math.max(0.01, volume).toFixed(2),
      weight: Math.max(0.01, weight).toFixed(2),
    };
  };

  const handleModelLoaded = (object3d, file) => {
    let mesh;
    if (object3d.isMesh) {
      mesh = object3d;
    } else if (object3d.isBufferGeometry || object3d.isGeometry) {
      mesh = new THREE.Mesh(object3d, new THREE.MeshPhongMaterial({ color: 0xff4d00, shininess: 30, flatShading: false, side: THREE.DoubleSide }));
    } else {
      const firstMesh = object3d.getObjectByProperty ? object3d.getObjectByProperty('type', 'Mesh') : null;
      mesh = firstMesh ? firstMesh.clone() : object3d;
    }

    let geometry = null;
    if (mesh.geometry) geometry = mesh.geometry;
    else if (mesh.children?.length > 0) geometry = mesh.children.find(c => c.geometry)?.geometry;

    const volumeData = geometry ? calculateVolumeAndWeight(geometry) : { volume: 0, weight: 0 };
    setModel({ object: mesh, fileName: file.name, fileSize: file.size, ...volumeData });
    toast.success(`Модель "${file.name}" загружена!`);
    setIsLoading(false);
    setLoadError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setLoadError(null);

    if (file.size > MAX_FILE_SIZE) {
      const error = `Файл слишком большой. Максимум: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      setLoadError(error); toast.error(error); setIsLoading(false); return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['stl', 'obj', 'ply', 'gltf', 'glb'].includes(extension)) {
      const error = 'Поддерживаются: STL, OBJ, PLY, GLTF, GLB';
      setLoadError(error); toast.error(error); setIsLoading(false); return;
    }

    const reader = new FileReader();
    reader.onerror = () => { const e = 'Ошибка чтения файла'; setLoadError(e); toast.error(e); setIsLoading(false); };

    try {
      switch (extension) {
        case 'stl':
          reader.onload = (ev) => {
            try {
              const geo = new STLLoader().parse(ev.target.result);
              geo.computeVertexNormals();
              handleModelLoaded(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0xff4d00, shininess: 30, side: THREE.DoubleSide })), file);
            } catch (err) { const e = 'Ошибка STL: ' + err.message; setLoadError(e); toast.error(e); setIsLoading(false); }
          };
          reader.readAsArrayBuffer(file); break;

        case 'obj':
          reader.onload = (ev) => {
            try { handleModelLoaded(new OBJLoader().parse(ev.target.result), file); }
            catch (err) { const e = 'Ошибка OBJ: ' + err.message; setLoadError(e); toast.error(e); setIsLoading(false); }
          };
          reader.readAsText(file); break;

        case 'ply':
          reader.onload = (ev) => {
            try {
              const geo = new PLYLoader().parse(ev.target.result);
              geo.computeVertexNormals();
              handleModelLoaded(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0xff4d00, shininess: 30, side: THREE.DoubleSide })), file);
            } catch (err) { const e = 'Ошибка PLY: ' + err.message; setLoadError(e); toast.error(e); setIsLoading(false); }
          };
          reader.readAsArrayBuffer(file); break;

        case 'gltf': case 'glb':
          reader.onload = (ev) => {
            try {
              const gltf = new GLTFLoader();
              const cb = (g) => handleModelLoaded(g.scene || g.scenes?.[0] || g, file);
              const err = (er) => { const e = 'Ошибка GLTF: ' + (er.message || er); setLoadError(e); toast.error(e); setIsLoading(false); };
              if (extension === 'glb') gltf.parse(ev.target.result, '', cb, err);
              else { const text = typeof ev.target.result === 'string' ? ev.target.result : new TextDecoder().decode(ev.target.result); gltf.parse(text, '', cb, err); }
            } catch (er) { const e = 'Ошибка GLTF: ' + er.message; setLoadError(e); toast.error(e); setIsLoading(false); }
          };
          extension === 'glb' ? reader.readAsArrayBuffer(file) : reader.readAsText(file); break;

        default:
          setLoadError('Неподдерживаемый формат'); setIsLoading(false);
      }
    } catch (err) { const e = 'Ошибка: ' + err.message; setLoadError(e); toast.error(e); setIsLoading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) { const fakeEvent = { target: { files: [file] } }; handleFileUpload(fakeEvent); }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--glass-bg)'; }}
        style={{
          border: '2px dashed var(--border-strong)',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: isLoading ? 'wait' : 'pointer',
          background: 'var(--glass-bg)',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,77,0,0.04)'; }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--glass-bg)'; }}
      >
        <input ref={fileInputRef} type="file" accept=".stl,.obj,.ply,.gltf,.glb" onChange={handleFileUpload} className="hidden" />

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center"
            style={{ background: isLoading ? 'rgba(255,77,0,0.1)' : 'var(--bg-raised)', border: '1px solid var(--border-strong)' }}>
            {isLoading
              ? <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
              : <Upload className="w-6 h-6" style={{ color: 'var(--accent)' }} />}
          </div>

          <div>
            <p className="font-sans font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              {isLoading ? 'Обработка файла...' : 'Загрузите 3D-модель'}
            </p>
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
              Перетащите файл или нажмите для выбора
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['STL', 'OBJ', 'PLY', 'GLTF', 'GLB'].map(fmt => (
              <span key={fmt} className="font-mono text-xs px-2 py-0.5"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                {fmt}
              </span>
            ))}
          </div>

          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Макс. {MAX_FILE_SIZE / 1024 / 1024} MB
          </p>
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-3 p-4"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderLeft: '3px solid #f87171' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
          <p className="font-sans text-sm" style={{ color: '#f87171' }}>{loadError}</p>
        </div>
      )}
    </div>
  );
}
