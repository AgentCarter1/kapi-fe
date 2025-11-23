import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Zone } from '../../../api/endpoints/zones';
import { ZoneType } from '../../../api/endpoints/zones';

interface Building3DProps {
  zones: Zone[];
  selectedZoneId?: string | null;
  onZoneClick?: (zone: Zone) => void;
}

interface BuildingData {
  building: Zone;
  floors: FloorData[];
}

interface FloorData {
  floor: Zone;
  sections: SectionData[];
  floorNumber: number;
}

interface SectionData {
  section: Zone;
  units: Zone[];
}

// Zone tipine göre renk
const getZoneColor = (zoneType: number, isSelected: boolean, isActive: boolean): string => {
  if (!isActive) return '#9ca3af';
  if (isSelected) return '#3b82f6';
  
  switch (zoneType) {
    case ZoneType.BUILDING:
      return '#f3f4f6'; // Açık gri - Bina dış duvarları
    case ZoneType.FLOOR:
      return '#d97706'; // Turuncu - Katlar
    case ZoneType.SECTION:
      return '#10b981'; // Yeşil - Bölümler
    case ZoneType.UNIT:
      return '#6366f1'; // İndigo - Birimler
    default:
      return '#6b7280';
  }
};

// BUILDING: Modern bina modeli (şeffaf/kesilmiş duvarlar)
function BuildingModel({ 
  building, 
  width, 
  height, 
  depth,
  isSelected,
  isActive,
  onClick
}: { 
  building: Zone;
  width: number;
  height: number;
  depth: number;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const wallThickness = 0.2;
  
  return (
    <group onClick={onClick}>
      {/* Bina dış çerçevesi - Şeffaf duvarlar */}
      {/* Ön duvar (kesilmiş/şeffaf) */}
      <mesh position={[0, 0, depth / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial
          color="#ffffff"
          opacity={0.1}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Arka duvar */}
      <mesh position={[0, 0, -depth / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial
          color="#e5e7eb"
          opacity={0.3}
          transparent
        />
      </mesh>
      
      {/* Sol duvar (kesilmiş/şeffaf) */}
      <mesh position={[-width / 2, 0, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial
          color="#ffffff"
          opacity={0.1}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Sağ duvar */}
      <mesh position={[width / 2, 0, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial
          color="#e5e7eb"
          opacity={0.3}
          transparent
        />
      </mesh>
      
      {/* Çatı */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.1, 0.3, depth + 0.1]} />
        <meshStandardMaterial
          color="#374151"
          opacity={0.8}
          transparent
        />
      </mesh>
      
      {/* Bina adı */}
      <Text
        position={[0, height / 2 + 0.5, depth / 2 + 0.2]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.05}
        outlineColor="#1f2937"
      >
        {building.name}
      </Text>
    </group>
  );
}

// FLOOR: Modern kat platformu (ahşap zemin, net ayrım)
function FloorModel({
  floor,
  width,
  depth,
  yPosition,
  floorNumber,
  isSelected,
  isActive,
  onClick
}: {
  floor: Zone;
  width: number;
  depth: number;
  yPosition: number;
  floorNumber: number;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const floorThickness = 0.15;
  
  return (
    <group position={[0, yPosition, 0]}>
      {/* Kat zemin - Ahşap görünüm */}
      <mesh
        position={[0, 0, 0]}
        onClick={onClick}
      >
        <boxGeometry args={[width, floorThickness, depth]} />
        <meshStandardMaterial
          color="#d4a574" // Ahşap rengi
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Kat zemin üst yüzey - Daha parlak */}
      <mesh position={[0, floorThickness / 2 - 0.01, 0]}>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial
          color="#e8d5b7"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Kat zemin çizgileri - Ahşap plaka görünümü */}
      {Array.from({ length: Math.floor(width / 1.5) }).map((_, i) => (
        <mesh key={`plank-${i}`} position={[(i - Math.floor(width / 1.5) / 2) * 1.5, floorThickness / 2 + 0.01, 0]}>
          <boxGeometry args={[1.4, 0.02, depth]} />
          <meshStandardMaterial color="#c49a6a" opacity={0.6} transparent />
        </mesh>
      ))}
      
      {/* Kat tavan (bir sonraki katın zeminini oluşturur) */}
      <mesh position={[0, floorThickness / 2 + 0.05, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial
          color="#f3f4f6"
          opacity={0.5}
          transparent
        />
      </mesh>
      
      {/* Kat numarası ve adı - Büyük ve belirgin */}
      <Text
        position={[0, floorThickness / 2 + 0.3, depth / 2 - 0.2]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.04}
        outlineColor="#1f2937"
      >
        {floor.name}
      </Text>
      
      {/* Kat numarası badge */}
      <mesh position={[-width / 2 + 0.5, floorThickness / 2 + 0.2, depth / 2 - 0.2]}>
        <boxGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial
          color={getZoneColor(ZoneType.FLOOR, isSelected, isActive)}
          opacity={0.9}
          transparent
        />
      </mesh>
      <Text
        position={[-width / 2 + 0.5, floorThickness / 2 + 0.2, depth / 2 - 0.2]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="#1f2937"
      >
        {floorNumber}
      </Text>
    </group>
  );
}

// SECTION: Oda/bölüm modeli (duvarlar, iç mekan) - Daha belirgin ve anlaşılır
function SectionModel({
  section,
  width,
  depth,
  height,
  position,
  isSelected,
  isActive,
  onClick
}: {
  section: Zone;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const wallThickness = 0.15;
  const sectionColor = getZoneColor(ZoneType.SECTION, isSelected, isActive);
  
  return (
    <group position={position}>
      {/* Bölüm zemin - Daha belirgin ve parlak */}
      <mesh
        position={[0, -height / 2 + 0.15, 0]}
        onClick={onClick}
      >
        <boxGeometry args={[width, 0.15, depth]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.7}
          transparent
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Bölüm zemin üst yüzey - Daha parlak */}
      <mesh position={[0, -height / 2 + 0.22, 0]}>
        <boxGeometry args={[width * 0.98, 0.05, depth * 0.98]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.9}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Bölüm duvarları - Gerçek duvar görünümü (4 yüz) */}
      {/* Ön duvar */}
      <mesh position={[0, 0, depth / 2]} onClick={onClick}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.5}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Arka duvar */}
      <mesh position={[0, 0, -depth / 2]} onClick={onClick}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.5}
          transparent
        />
      </mesh>
      
      {/* Sol duvar */}
      <mesh position={[-width / 2, 0, 0]} onClick={onClick}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.5}
          transparent
        />
      </mesh>
      
      {/* Sağ duvar */}
      <mesh position={[width / 2, 0, 0]} onClick={onClick}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.5}
          transparent
        />
      </mesh>
      
      {/* Bölüm duvar çerçeveleri - Daha belirgin sınırlar */}
      <mesh onClick={onClick}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.1}
          transparent
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Bölüm köşe sütunları - Daha büyük ve belirgin */}
      {[
        [-width / 2, -height / 2 + 0.3, -depth / 2],
        [width / 2, -height / 2 + 0.3, -depth / 2],
        [-width / 2, -height / 2 + 0.3, depth / 2],
        [width / 2, -height / 2 + 0.3, depth / 2],
      ].map((pos, i) => (
        <mesh key={`corner-${i}`} position={pos as [number, number, number]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial
            color={sectionColor}
            opacity={1}
            transparent={false}
          />
        </mesh>
      ))}
      
      {/* Bölüm iç mekan vurgusu - Merkez nokta */}
      <mesh position={[0, -height / 2 + 0.3, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color={sectionColor}
          opacity={0.6}
          transparent
        />
      </mesh>
      
      {/* Bölüm adı - Section'ın üstünde, her zaman görünür */}
      <Text
        position={[0, height / 2 + 0.3, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#1f2937"
        fontWeight="bold"
      >
        {section.name}
      </Text>
    </group>
  );
}

// UNIT: Küçük oda/birim modeli (iç mekan detayları) - Daha belirgin ve anlaşılır
function UnitModel({
  unit,
  width,
  depth,
  height,
  position,
  isSelected,
  isActive,
  onClick
}: {
  unit: Zone;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const unitColor = getZoneColor(ZoneType.UNIT, isSelected, isActive);
  const unitHeight = Math.max(height, 0.6); // Minimum yükseklik
  
  return (
    <group position={position}>
      {/* Birim zemin - Daha büyük ve belirgin */}
      <mesh
        position={[0, 0, 0]}
        onClick={onClick}
      >
        <boxGeometry args={[width, unitHeight, depth]} />
        <meshStandardMaterial
          color={unitColor}
          opacity={0.85}
          transparent
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      
      {/* Birim zemin üst yüzey - Daha parlak */}
      <mesh position={[0, unitHeight / 2 - 0.05, 0]}>
        <boxGeometry args={[width * 0.98, 0.1, depth * 0.98]} />
        <meshStandardMaterial
          color={unitColor}
          opacity={0.95}
          transparent
          roughness={0.2}
        />
      </mesh>
      
      {/* Birim kenar çerçevesi - Daha belirgin */}
      <mesh position={[0, unitHeight / 2 - 0.02, 0]}>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial
          color="#ffffff"
          opacity={0.7}
          transparent
        />
      </mesh>
      
      {/* Birim iç mekan vurgusu - Merkez nokta */}
      <mesh position={[0, unitHeight / 2 - 0.1, 0]}>
        <boxGeometry args={[width * 0.6, 0.15, depth * 0.6]} />
        <meshStandardMaterial
          color={unitColor}
          opacity={0.5}
          transparent
        />
      </mesh>
      
      {/* Birim üst vurgu - Gölge efekti */}
      <mesh position={[0, unitHeight / 2, 0]}>
        <boxGeometry args={[width * 0.9, 0.1, depth * 0.9]} />
        <meshStandardMaterial
          color={unitColor}
          opacity={1}
          transparent={false}
        />
      </mesh>
      
      {/* Birim adı - Daha büyük ve belirgin */}
      <Text
        position={[0, unitHeight / 2 + 0.25, 0]}
        fontSize={0.28}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
        fontWeight="bold"
      >
        {unit.name}
      </Text>
      
      {/* Birim köşe vurguları - Daha belirgin */}
      {[
        [-width / 2 + 0.1, unitHeight / 2 - 0.05, -depth / 2 + 0.1],
        [width / 2 - 0.1, unitHeight / 2 - 0.05, -depth / 2 + 0.1],
        [-width / 2 + 0.1, unitHeight / 2 - 0.05, depth / 2 - 0.1],
        [width / 2 - 0.1, unitHeight / 2 - 0.05, depth / 2 - 0.1],
      ].map((pos, i) => (
        <mesh key={`unit-corner-${i}`} position={pos as [number, number, number]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            opacity={0.9}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

// Ana Building Mesh
function BuildingMesh({ 
  building, 
  floors, 
  selectedZoneId, 
  onZoneClick 
}: { 
  building: Zone; 
  floors: FloorData[];
  selectedZoneId?: string | null;
  onZoneClick?: (zone: Zone) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const floorHeight = 3.5; // Her katın yüksekliği artırıldı
  const buildingHeight = Math.max(floors.length * floorHeight + 1, floorHeight + 1);
  const buildingWidth = 14;
  const buildingDepth = 14;
  
  return (
    <group ref={meshRef} position={[0, buildingHeight / 2, 0]}>
      {/* BUILDING: Modern bina modeli */}
      <BuildingModel
        building={building}
        width={buildingWidth}
        height={buildingHeight}
        depth={buildingDepth}
        isSelected={building.id === selectedZoneId}
        isActive={building.isActive}
        onClick={() => onZoneClick?.(building)}
      />

      {/* FLOOR: Katlar - Her floor bir kat olarak üst üste */}
      {floors.length > 0 ? (
        floors.map((floorData, floorIndex) => {
          // Her floor zemin seviyesinden başlayarak üst üste dizilir
          const floorY = -buildingHeight / 2 + floorHeight / 2 + floorIndex * floorHeight;
          const sectionsPerFloor = floorData.sections.length;
          const sectionsPerRow = Math.max(1, Math.ceil(Math.sqrt(sectionsPerFloor)));
          
          return (
            <group key={floorData.floor.id}>
              {/* FLOOR: Kat modeli - Her zaman görünür */}
              <FloorModel
                floor={floorData.floor}
                width={buildingWidth - 0.4}
                depth={buildingDepth - 0.4}
                yPosition={floorY}
                floorNumber={floorData.floorNumber}
                isSelected={floorData.floor.id === selectedZoneId}
                isActive={floorData.floor.isActive}
                onClick={() => onZoneClick?.(floorData.floor)}
              />

              {/* SECTION: Kat içerisinde bölümler/odalar */}
              {floorData.sections.length > 0 && floorData.sections.map((sectionData, sectionIndex) => {
                const row = Math.floor(sectionIndex / sectionsPerRow);
                const col = sectionIndex % sectionsPerRow;
                const sectionWidth = (buildingWidth - 0.8) / sectionsPerRow;
                const sectionDepth = (buildingDepth - 0.8) / sectionsPerRow;
                const sectionX = (col - (sectionsPerRow - 1) / 2) * sectionWidth;
                const sectionZ = (row - (sectionsPerRow - 1) / 2) * sectionDepth;
                const unitsPerSection = sectionData.units.length;
                const unitsPerRow = Math.max(1, Math.ceil(Math.sqrt(unitsPerSection)));

                return (
                  <group key={sectionData.section.id}>
                  <SectionModel
                    section={sectionData.section}
                    width={sectionWidth - 0.2}
                    depth={sectionDepth - 0.2}
                    height={floorHeight - 0.3}
                    position={[sectionX, floorY + 0.25, sectionZ]}
                    isSelected={sectionData.section.id === selectedZoneId}
                    isActive={sectionData.section.isActive}
                    onClick={() => onZoneClick?.(sectionData.section)}
                  />
                    
                    {/* UNIT: Bölüm içerisinde birimler/odalar */}
                    {sectionData.units.length > 0 && sectionData.units.map((unit, unitIndex) => {
                      const unitRow = Math.floor(unitIndex / unitsPerRow);
                      const unitCol = unitIndex % unitsPerRow;
                      const unitWidth = (sectionWidth - 0.5) / unitsPerRow;
                      const unitDepth = (sectionDepth - 0.5) / unitsPerRow;
                      const unitX = (unitCol - (unitsPerRow - 1) / 2) * unitWidth;
                      const unitZ = (unitRow - (unitsPerRow - 1) / 2) * unitDepth;

                      return (
                      <UnitModel
                        key={unit.id}
                        unit={unit}
                        width={unitWidth - 0.1}
                        depth={unitDepth - 0.1}
                        height={0.6}
                        position={[sectionX + unitX, floorY + 0.4, sectionZ + unitZ]}
                        isSelected={unit.id === selectedZoneId}
                        isActive={unit.isActive}
                        onClick={() => onZoneClick?.(unit)}
                      />
                      );
                    })}
                  </group>
                );
              })}
            </group>
          );
        })
      ) : null}
    </group>
  );
}

// İzometrik kamera kontrolü
function IsometricCamera({ autoRotate, rotationSpeed = 0.5 }: { autoRotate?: boolean; rotationSpeed?: number }) {
  const rotationRef = useRef(0);
  
  useFrame((state, delta) => {
    // İzometrik açı: 45 derece yatay, 30 derece dikey
    const distance = 25;
    let angle = Math.PI / 4; // 45 derece
    
    // Auto-rotate
    if (autoRotate) {
      rotationRef.current += delta * rotationSpeed;
      angle += rotationRef.current;
    }
    
    const elevation = Math.PI / 6; // 30 derece
    
    state.camera.position.x = Math.sin(angle) * distance;
    state.camera.position.z = Math.cos(angle) * distance;
    state.camera.position.y = Math.sin(elevation) * distance;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// Kamera kontrol bileşeni - OrbitControls'a ref ile erişim
function CameraControls({ 
  viewMode, 
  autoRotate 
}: { 
  viewMode: 'isometric' | 'free';
  autoRotate: boolean;
}) {
  const controlsRef = useRef<any>(null);
  
  return (
    <>
      {viewMode === 'free' && (
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={80}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.5}
          zoomSpeed={0.8}
          panSpeed={0.8}
          rotateSpeed={0.5}
          dampingFactor={0.05}
          enableDamping={true}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          target={[0, 0, 0]}
        />
      )}
    </>
  );
}

export const Building3D = ({ zones, selectedZoneId, onZoneClick }: Building3DProps) => {
  const [autoRotate, setAutoRotate] = useState(false);
  const [viewMode, setViewMode] = useState<'isometric' | 'free'>('isometric');

  // Zone hiyerarşisini parse et ve building'leri bul (recursive)
  const buildings = useMemo(() => {
    const findAllBuildings = (zoneList: Zone[]): Zone[] => {
      const foundBuildings: Zone[] = [];
      
      for (const zone of zoneList) {
        if (parseInt(zone.zoneTypeId) === ZoneType.BUILDING) {
          foundBuildings.push(zone);
        }
        
        if (zone.children && zone.children.length > 0) {
          foundBuildings.push(...findAllBuildings(zone.children));
        }
      }
      
      return foundBuildings;
    };

    const buildingZones = findAllBuildings(zones);
    
    console.log('Found buildings:', buildingZones.length, buildingZones);

    return buildingZones.map((building): BuildingData => {
      const floors: FloorData[] = [];
      
      // Building'in direkt children'larından floor'ları bul
      if (building.children) {
        const floorZones = building.children.filter(
          (child) => parseInt(child.zoneTypeId) === ZoneType.FLOOR
        );

        floorZones.forEach((floor) => {
          const sections: SectionData[] = [];
          
          // Floor'un children'larından section'ları bul
          if (floor.children) {
            const sectionZones = floor.children.filter(
              (child) => parseInt(child.zoneTypeId) === ZoneType.SECTION
            );

            sectionZones.forEach((section) => {
              // Section'un children'larından unit'leri bul
              const units = section.children?.filter(
                (child) => parseInt(child.zoneTypeId) === ZoneType.UNIT
              ) || [];

              sections.push({
                section,
                units,
              });
            });
          }

          floors.push({
            floor,
            sections,
            floorNumber: floors.length + 1,
          });
        });
      }

      console.log(`Building "${building.name}" has ${floors.length} floors`, floors);
      floors.forEach((floorData, idx) => {
        console.log(`  Floor ${idx + 1} "${floorData.floor.name}": ${floorData.sections.length} sections`);
        floorData.sections.forEach((sectionData, sidx) => {
          console.log(`    Section ${sidx + 1} "${sectionData.section.name}": ${sectionData.units.length} units`);
        });
      });
      
      return {
        building,
        floors,
      };
    });
  }, [zones]);

  if (buildings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No buildings found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Create a building zone to see 3D visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
      <Canvas shadows camera={{ position: [20, 15, 20], fov: 50 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.8} />
        <pointLight position={[0, 20, 0]} intensity={0.5} />

        {viewMode === 'isometric' && <IsometricCamera autoRotate={autoRotate} />}
        <CameraControls viewMode={viewMode} autoRotate={autoRotate} />

        {/* Ground plane - Daha büyük ve belirgin */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#e5e7eb" opacity={0.5} transparent />
        </mesh>

        {/* Grid helper */}
        <gridHelper args={[100, 50, '#cbd5e1', '#e2e8f0']} position={[0, -14.9, 0]} />

        {/* Buildings */}
        {buildings.map((buildingData, index) => {
          const spacing = 20;
          const xPosition = (index - (buildings.length - 1) / 2) * spacing;
          
          return (
            <group key={buildingData.building.id} position={[xPosition, 0, 0]}>
              <BuildingMesh
                building={buildingData.building}
                floors={buildingData.floors}
                selectedZoneId={selectedZoneId}
                onZoneClick={onZoneClick}
              />
            </group>
          );
        })}
      </Canvas>

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 space-y-3 min-w-[220px] max-w-[280px]">
        <div className="space-y-2">
          <button
            onClick={() => setViewMode(viewMode === 'isometric' ? 'free' : 'isometric')}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {viewMode === 'isometric' ? '🔄 Free View' : '📐 Isometric View'}
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {autoRotate ? '⏸️ Pause Rotation' : '▶️ Auto Rotate'}
          </button>
        </div>
        
        {viewMode === 'free' && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Kontroller</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>🖱️ <strong>Sol tık + sürükle:</strong> Döndür</div>
              <div>🖱️ <strong>Sağ tık + sürükle:</strong> Kaydır</div>
              <div>🖱️ <strong>Scroll:</strong> Yakınlaştır/Uzaklaştır</div>
              <div>📱 <strong>Dokunmatik:</strong> İki parmakla zoom</div>
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#d97706' }}></div>
              <span>Floor (Kat)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span>Section (Bölüm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6366f1' }}></div>
              <span>Unit (Birim)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
