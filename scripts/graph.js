import * as THREE from 'https://esm.sh/three';
import SpriteText from 'https://esm.sh/three-spritetext';
import ForceGraph3D from 'https://esm.sh/3d-force-graph';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('graph-container');
  initGraph(container);

  function initGraph(container) {
    let isPopupOpen = false; // Flag to pause rotation when focused on a node

    fetch('/materials/graphData.json')
      .then(res => res.json())
      .then(data => {
        // Define colors for Cream & Vermillion theme
        const colorRed = '#C2384D';
        const colorCream = '#EBE6DF';
        const colorMuted = 'rgba(194, 56, 77, 0.4)'; // Muted red for links

        const Graph = ForceGraph3D({ controlType: 'orbit' })(container)
          .graphData(data)
          .backgroundColor(colorCream)
          // Hide default node label tooltip to use custom ones if needed, or keep it simple:
          .nodeLabel(node => {
            if (node.type === 'image') return '';
            return `<div style="background: rgba(0,0,0,0.8); color: #fff; padding: 4px 8px; font-family: 'Geist', sans-serif; border-radius: 4px;">
                      <strong>${node.label}</strong><br/>
                      <span style="font-size: 0.8em; opacity: 0.8;">${node.description || node.type}</span>
                    </div>`;
          })
          // Link styling (restored to moving particles)
          .linkWidth(0.5)
          .linkColor(() => colorMuted)
          .linkOpacity(0.5)
          .linkDirectionalParticles(2)
          .linkDirectionalParticleWidth(1.5)
          .linkDirectionalParticleColor(() => colorRed)
          // Node styling
          .nodeThreeObject(node => {
            if (node.type === 'image') {
              const imgTexture = new THREE.TextureLoader().load(node.imagePath);
              imgTexture.colorSpace = THREE.SRGBColorSpace;
              const material = new THREE.MeshStandardMaterial({ 
                map: imgTexture, 
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.9 
              });
              const geometry = new THREE.PlaneGeometry(14, 16.8);
              const mesh = new THREE.Mesh(geometry, material);
              return mesh;
            } else {
              const sprite = new SpriteText(node.label || node.id);
              const sizeScale = node.size || 1;
              let colorStr = '#C2384D';
              let fontSize = 0.6 * sizeScale;
              let font = 'ArrowFont, serif';
              
              if (node.type === 'chapter') {
                colorStr = '#1A1A1A'; fontSize = 0.9 * sizeScale;
              } else if (node.type === 'era') {
                colorStr = '#c9a84c'; fontSize = 0.75 * sizeScale;
              } else if (node.type === 'person') {
                colorStr = '#3b8ba8'; fontSize = 0.42; font = 'Geist, sans-serif'; // Darkened slightly for cream
              } else if (node.type === 'quote') {
                colorStr = 'rgba(26,26,26,0.6)'; fontSize = 0.28; font = 'Geist, sans-serif';
              } else if (node.type === 'concept') {
                const topics = {
                  "Digital Identity": "#A89FF5",
                  "Nihilism & Meaning": "#F5A89F",
                  "Nature & Technology": "#9FF5D1",
                  "Cultural Paradigms": "#F5E49F",
                  "Consumer Culture": "#9FBFF5"
                };
                colorStr = topics[node.macroTopic] || '#C2384D';
                fontSize = 0.65 * sizeScale;
              }
              
              sprite.color = colorStr;
              // Made text much larger and removed blocky strokes
              sprite.textHeight = fontSize * 10;
              sprite.fontFace = font;
              sprite.material.depthWrite = false;
              return sprite;
            }
          })
          // Add interaction
          .enableNodeDrag(false)
          .onNodeHover(node => {
            container.style.cursor = node ? 'pointer' : 'grab';
          })
          .onNodeClick(node => {
            // Aim at node from outside it
            const distance = 80;
            const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

            const newPos = node.x || node.y || node.z
              ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
              : { x: 0, y: 0, z: distance };

            Graph.cameraPosition(
              newPos, 
              node, // lookAt
              2000  // transition duration (ms)
            );

            // Populate and show popup
            const popup = document.getElementById('node-popup');
            if (popup) {
              const titleEl = document.getElementById('popup-title');
              const typeEl = document.getElementById('popup-type');
              const sourceEl = document.getElementById('popup-source');
              const descEl = document.getElementById('popup-desc');
              const macroEl = document.getElementById('popup-macro');
              
              titleEl.textContent = node.label || node.id;
              typeEl.textContent = node.type + (node.role ? ` · ${node.role}` : '');
              
              let colorStr = '#C2384D';
              let bgStr = 'rgba(194,56,77,0.2)';
              if (node.type === 'era') { colorStr = '#c9a84c'; bgStr = 'rgba(201,168,76,0.2)'; }
              else if (node.type === 'person') { colorStr = '#6ec6e6'; bgStr = 'rgba(110,198,230,0.2)'; }
              else if (node.type === 'chapter') { colorStr = '#ffffff'; bgStr = 'rgba(255,255,255,0.12)'; }
              else if (node.type === 'quote') { colorStr = '#ffffff'; bgStr = 'rgba(255,255,255,0.08)'; }
              
              typeEl.style.color = colorStr;
              typeEl.style.backgroundColor = bgStr;
              titleEl.style.color = colorStr;
              
              titleEl.style.fontFamily = node.type === 'quote' ? 'Geist, sans-serif' : 'ArrowFont, serif';
              titleEl.style.fontStyle = node.type === 'quote' ? 'italic' : 'normal';
              
              if (node.source) {
                sourceEl.textContent = `— ${node.source}`;
                sourceEl.style.display = 'block';
              } else {
                sourceEl.style.display = 'none';
              }
              
              descEl.textContent = node.description || '';
              
              if (node.macroTopic) {
                macroEl.textContent = node.macroTopic;
                macroEl.style.display = 'block';
              } else {
                macroEl.style.display = 'none';
              }

              popup.style.display = 'flex';
              // Force reflow for transition
              popup.classList.add('is-visible');
              isPopupOpen = true;
            }
          })
          .onBackgroundClick(() => {
            const popup = document.getElementById('node-popup');
            if (popup && popup.classList.contains('is-visible')) {
              popup.classList.remove('is-visible');
              setTimeout(() => { popup.style.display = 'none'; }, 300);
            }
          });

        // Setup popup closing
        const popupClose = document.getElementById('popup-close');
        const popupBg = document.getElementById('popup-overlay-bg');
        const popup = document.getElementById('node-popup');
        
        function closePopup() {
          isPopupOpen = false;
          if (popup) {
            popup.classList.remove('is-visible');
            setTimeout(() => { popup.style.display = 'none'; }, 300);
          }
        }
        if (popupClose) popupClose.addEventListener('click', closePopup);
        if (popupBg) popupBg.addEventListener('click', closePopup);

        // Restore optimized native d3-force for flawless layout expansion
        Graph.d3Force('charge').strength(node => -800 * (node.size || 1));
        Graph.d3Force('link').distance(80);
        Graph.d3Force('center').strength(0.02);
        
        // Custom subtle rotation that avoids OrbitControls conflicts
        let isInteracting = false;
        container.addEventListener('mousedown', () => isInteracting = true);
        container.addEventListener('mouseup', () => isInteracting = false);
        container.addEventListener('touchstart', () => isInteracting = true);
        container.addEventListener('touchend', () => isInteracting = false);
        
        // Sync OrbitControls config to exactly match main branch KnowledgeGraph.tsx
        const controls = Graph.controls();
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.zoomToCursor = true; // Attempt to enable if supported by this ThreeJS version
        
        const scene = Graph.scene();
        const clock = new THREE.Clock();
        function animate() {
          const time = clock.getElapsedTime();
          scene.traverse(obj => {
            if (obj.isLine && obj.__customShader) {
              obj.material.uniforms.uTime.value = time;
            }
          });
          
          if (!isInteracting && !isPopupOpen && scene) {
            scene.rotation.y += 0.0005;
          }
          requestAnimationFrame(animate);
        }
        animate();

      })
      .catch(err => {
        console.error('Error loading graph data:', err);
        document.getElementById('graph-container').innerHTML = '<div style="color:red; padding:2rem; position:absolute; z-index:9999;">ERROR: ' + err.message + '</div>';
      });
  }
});

window.addEventListener('error', function(e) {
  document.getElementById('graph-container').innerHTML += '<div style="color:red; padding:2rem; position:absolute; z-index:9999; top: 50px;">GLOBAL ERROR: ' + e.message + '</div>';
});
