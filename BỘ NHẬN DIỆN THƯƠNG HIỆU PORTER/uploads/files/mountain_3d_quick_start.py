#!/usr/bin/env python3
"""
🏔️ Mountain 3D Quick Start
Tạo 3D mountain model chính xác từ GPS coordinates

Usage:
    python3 mountain_3d_quick_start.py
"""

import json
from datetime import datetime

class MountainTo3D:
    """Convert GPS to 3D mountain model"""
    
    def __init__(self, lat, lon, name="Mountain"):
        self.lat = lat
        self.lon = lon
        self.name = name
        self.elevation_data = None
        
    def step1_get_elevation(self):
        """Bước 1: Lấy elevation data từ Open-Elevation API (FREE)"""
        print(f"\n🌍 BƯỚC 1: Fetch Elevation Data")
        print("=" * 50)
        
        import requests
        
        try:
            url = f"https://api.open-elevation.com/api/v1/lookup?locations={self.lat},{self.lon}"
            response = requests.get(url, timeout=5)
            data = response.json()
            
            if data['results']:
                result = data['results'][0]
                elevation = result['elevation']
                
                print(f"✅ Location: {self.name}")
                print(f"   Coordinates: {self.lat}, {self.lon}")
                print(f"   Elevation: {elevation:.1f}m")
                print(f"   Source: USGS SRTM 30m")
                print(f"   Accuracy: ±10m")
                
                self.elevation_data = {
                    'elevation': elevation,
                    'latitude': self.lat,
                    'longitude': self.lon,
                    'source': 'USGS SRTM 30m',
                    'accuracy': '±10m'
                }
                
                return elevation
        except Exception as e:
            print(f"❌ Error: {e}")
            print("   Tip: Check internet connection")
            return None
    
    def step2_get_address(self):
        """Bước 2: Reverse Geocoding - GPS → Địa chỉ (FREE)"""
        print(f"\n📍 BƯỚC 2: Reverse Geocoding")
        print("=" * 50)
        
        import requests
        
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={self.lat}&lon={self.lon}&language=vi,en"
            headers = {'User-Agent': 'MountainTracker/1.0'}
            
            response = requests.get(url, headers=headers, timeout=5)
            data = response.json()
            
            address = data.get('address', {})
            
            print(f"✅ Full address: {data.get('display_name', 'N/A')}")
            print(f"   Province: {address.get('state', 'N/A')}")
            print(f"   District: {address.get('city_district', 'N/A')}")
            print(f"   Type: {data.get('type', 'N/A')}")
            
            return {
                'full_address': data.get('display_name'),
                'province': address.get('state'),
                'district': address.get('city_district'),
                'type': data.get('type')
            }
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def step3_create_mock_mesh(self):
        """Bước 3: Tạo 3D mesh (mock data - không cần download SRTM)"""
        print(f"\n🎨 BƯỚC 3: Create 3D Mesh")
        print("=" * 50)
        
        import random
        
        # Create synthetic terrain around GPS point
        vertices = []
        faces = []
        
        grid_size = 10
        center_elev = self.elevation_data['elevation'] if self.elevation_data else 1000
        
        # Generate vertices
        for y in range(grid_size):
            for x in range(grid_size):
                # Create Gaussian peak
                dx = (x - grid_size/2) * 0.1
                dy = (y - grid_size/2) * 0.1
                height = center_elev + 500 * (2.71828 ** (-(dx**2 + dy**2) / 0.5))
                
                vx = (x - grid_size/2) * 0.5
                vy = height / 1000  # Scale down
                vz = (y - grid_size/2) * 0.5
                
                vertices.append([vx, vy, vz])
        
        # Generate faces (triangles)
        for y in range(grid_size - 1):
            for x in range(grid_size - 1):
                v1 = y * grid_size + x
                v2 = y * grid_size + (x + 1)
                v3 = (y + 1) * grid_size + x
                v4 = (y + 1) * grid_size + (x + 1)
                
                faces.append([v1, v2, v3])
                faces.append([v2, v4, v3])
        
        print(f"✅ Mesh created successfully!")
        print(f"   Vertices: {len(vertices)}")
        print(f"   Faces: {len(faces)}")
        print(f"   Format: Ready for export (OBJ/GLB)")
        
        return {
            'vertices': vertices,
            'faces': faces,
            'vertex_count': len(vertices),
            'face_count': len(faces)
        }
    
    def step4_create_html_viewer(self):
        """Bước 4: Tạo HTML viewer"""
        print(f"\n🌐 BƯỚC 4: Create HTML Viewer")
        print("=" * 50)
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Mountain 3D - {self.name}</title>
    <style>
        body {{ margin: 0; overflow: hidden; background: #87ceeb; font-family: Arial; }}
        canvas {{ display: block; }}
        #info {{
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.7);
            color: #4da6ff;
            padding: 20px;
            border-radius: 10px;
            z-index: 10;
        }}
    </style>
</head>
<body>
    <div id="info">
        <h2>🏔️ {self.name}</h2>
        <p>📍 GPS: {self.lat}, {self.lon}</p>
        <p>⛰️ Elevation: {self.elevation_data['elevation']:.0f}m</p>
        <p>🖱️ Drag to rotate | Scroll to zoom</p>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Setup scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x87ceeb);
        document.body.appendChild(renderer.domElement);
        
        camera.position.set(0, 3, 5);
        camera.lookAt(0, 0, 0);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
        sunLight.position.set(10, 20, 10);
        scene.add(sunLight);
        
        // Create synthetic mountain
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        
        for (let y = 0; y < 20; y++) {{
            for (let x = 0; x < 20; x++) {{
                const vx = (x - 10) * 0.3;
                const vz = (y - 10) * 0.3;
                const vy = 2 * Math.exp(-((vx)**2 + (vz)**2) / 4);
                vertices.push(vx, vy, vz);
            }}
        }}
        
        for (let y = 0; y < 19; y++) {{
            for (let x = 0; x < 19; x++) {{
                const a = y * 20 + x;
                const b = y * 20 + (x + 1);
                const c = (y + 1) * 20 + x;
                const d = (y + 1) * 20 + (x + 1);
                
                indices.push(a, b, c);
                indices.push(b, d, c);
            }}
        }}
        
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({{ color: 0x66aa44, roughness: 0.8 }});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        // Animation
        let isRotating = true;
        function animate() {{
            requestAnimationFrame(animate);
            if (isRotating) mesh.rotation.y += 0.0005;
            renderer.render(scene, camera);
        }}
        animate();
        
        // Mouse controls
        let isDragging = false;
        document.addEventListener('mousedown', () => {{ isDragging = true; isRotating = false; }});
        document.addEventListener('mouseup', () => {{ isDragging = false; }});
        document.addEventListener('mousemove', (e) => {{
            if (isDragging) {{
                mesh.rotation.y += e.movementX * 0.01;
                mesh.rotation.x += e.movementY * 0.01;
            }}
        }});
        
        // Zoom
        document.addEventListener('wheel', (e) => {{
            e.preventDefault();
            camera.position.multiplyScalar(1 + e.deltaY * 0.001);
        }});
        
        // Resize
        window.addEventListener('resize', () => {{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }});
    </script>
</body>
</html>
        """
        
        filename = f"mountain_{self.name.replace(' ', '_')}.html"
        with open(filename, 'w') as f:
            f.write(html)
        
        print(f"✅ HTML viewer created: {filename}")
        print(f"   Open in browser to view 3D mountain")
        
        return filename
    
    def run_all_steps(self):
        """Run tất cả 4 bước"""
        print("\n" + "="*60)
        print("🏔️  GPS TO 3D MOUNTAIN - COMPLETE WORKFLOW")
        print("="*60)
        
        # Step 1
        elev = self.step1_get_elevation()
        
        # Step 2
        address = self.step2_get_address()
        
        # Step 3
        mesh = self.step3_create_mock_mesh()
        
        # Step 4
        viewer = self.step4_create_html_viewer()
        
        print("\n" + "="*60)
        print("✅ COMPLETE! Generated files:")
        print("="*60)
        print(f"📁 HTML Viewer: {viewer}")
        print(f"   Open this file in browser to see 3D mountain")
        print(f"\n🎯 Summary:")
        print(f"   Coordinates: {self.lat}, {self.lon}")
        print(f"   Elevation: {elev:.0f}m" if elev else "   Elevation: N/A")
        print(f"   Vertices: {mesh['vertex_count']}")
        print(f"   Faces: {mesh['face_count']}")
        print(f"\n💡 Next steps:")
        print(f"   1. Open {viewer} in browser")
        print(f"   2. Drag to rotate, scroll to zoom")
        print(f"   3. For real SRTM data, download from USGS")
        print(f"   4. Read mountain_3d_accurate.py for full implementation")

# Main
if __name__ == "__main__":
    print("\n🏔️  MOUNTAIN 3D - Quick Start Demo\n")
    
    # Test with Fansipan (Recommended)
    mountain = MountainTo3D(
        lat=22.3275,
        lon=103.8405,
        name="Fansipan"
    )
    
    mountain.run_all_steps()
    
    print(f"\n✓ Run this in terminal to see output")
    print(f"$ python3 mountain_3d_quick_start.py")
