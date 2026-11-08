import * as THREE from 'three';

/**
 * Procedural OBJ file exporter from a THREE.Group or THREE.Mesh
 * Generates standards-compliant .obj text representation
 */
export function exportGroupToObj(group: THREE.Group, modelName: string = 'jarvis_model'): string {
  let output = `# JARVIS AI – Ultimate Student Edition 3D Exporter\n# Model: ${modelName}\n# Generated: ${new Date().toISOString()}\n\n`;

  let vertexOffset = 1;
  let normalOffset = 1;

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geom = mesh.geometry;
      const matrix = mesh.matrixWorld;

      output += `o ${mesh.name || 'Component'}\n`;

      const posAttr = geom.getAttribute('position');
      const normalAttr = geom.getAttribute('normal');

      if (!posAttr) return;

      const v = new THREE.Vector3();
      const n = new THREE.Vector3();

      // Write vertices
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        v.applyMatrix4(matrix);
        output += `v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}\n`;
      }

      // Write normals if present
      if (normalAttr) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
        for (let i = 0; i < normalAttr.count; i++) {
          n.fromBufferAttribute(normalAttr, i);
          n.applyMatrix3(normalMatrix).normalize();
          output += `vn ${n.x.toFixed(4)} ${n.y.toFixed(4)} ${n.z.toFixed(4)}\n`;
        }
      }

      // Write faces
      const index = geom.getIndex();
      if (index) {
        for (let i = 0; i < index.count; i += 3) {
          const a = index.getX(i) + vertexOffset;
          const b = index.getX(i + 1) + vertexOffset;
          const c = index.getX(i + 2) + vertexOffset;

          if (normalAttr) {
            output += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
          } else {
            output += `f ${a} ${b} ${c}\n`;
          }
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          const a = i + vertexOffset;
          const b = i + 1 + vertexOffset;
          const c = i + 2 + vertexOffset;

          if (normalAttr) {
            output += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
          } else {
            output += `f ${a} ${b} ${c}\n`;
          }
        }
      }

      vertexOffset += posAttr.count;
      if (normalAttr) normalOffset += normalAttr.count;
      output += '\n';
    }
  });

  return output;
}

export function triggerDownload(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
