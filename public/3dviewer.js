// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing 3D viewer');

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.log('Three.js not found, loading dynamically');
    // Load Three.js dynamically
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js';
    threeScript.onload = () => {
      console.log('Three.js loaded successfully');
      // Load GLTFLoader after Three.js is loaded
      const gltfLoaderScript = document.createElement('script');
      gltfLoaderScript.src = 'https://unpkg.com/three@0.152.2/examples/js/loaders/GLTFLoader.js';
      gltfLoaderScript.onload = () => {
        console.log('GLTFLoader loaded successfully');
        // Load OrbitControls after GLTFLoader is loaded
        const orbitControlsScript = document.createElement('script');
        orbitControlsScript.src = 'https://unpkg.com/three@0.152.2/examples/js/controls/OrbitControls.js';
        orbitControlsScript.onload = () => {
          console.log('OrbitControls loaded successfully');
          initScene();
        };
        orbitControlsScript.onerror = (e) => {
          console.error('Error loading OrbitControls:', e);
          showErrorMessage('Failed to load OrbitControls library');
        };
        document.body.appendChild(orbitControlsScript);
      };
      gltfLoaderScript.onerror = (e) => {
        console.error('Error loading GLTFLoader:', e);
        showErrorMessage('Failed to load GLTFLoader library');
      };
      document.body.appendChild(gltfLoaderScript);
    };
    threeScript.onerror = (e) => {
      console.error('Error loading Three.js:', e);
      showErrorMessage('Failed to load Three.js library');
    };
    document.body.appendChild(threeScript);
  } else {
    // If Three.js is already loaded, initialize the scene directly
    console.log('Three.js already loaded');
    initScene();
  }
});

function showErrorMessage(message) {
  const container = document.getElementById('canvas-container');
  if (container) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.background = 'rgba(255, 0, 0, 0.5)';
    errorDiv.style.borderRadius = '10px';
    errorDiv.style.fontSize = '16px';
    errorDiv.style.textAlign = 'center';
    errorDiv.innerHTML = `<p>${message}</p>`;
    container.appendChild(errorDiv);
  }
}

function initScene() {
  console.log('Initializing 3D scene');
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('Container element not found');
    return;
  }

  try {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(10, 10, 10);
    spotLight.angle = 0.15;
    spotLight.penumbra = 1;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Add another light from a different angle for better illumination
    const spotLight2 = new THREE.SpotLight(0xffffff, 0.8);
    spotLight2.position.set(-10, -5, 5);
    spotLight2.angle = 0.2;
    spotLight2.penumbra = 1;
    spotLight2.castShadow = true;
    scene.add(spotLight2);

    // Add a placeholder cube (will be replaced with the GLB model)
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Model container to handle rotation
    const modelContainer = new THREE.Object3D();
    scene.add(modelContainer);

    // Progress indicator (optional)
    const progressText = document.createElement('div');
    progressText.style.position = 'absolute';
    progressText.style.top = '50%';
    progressText.style.left = '50%';
    progressText.style.transform = 'translate(-50%, -50%)';
    progressText.style.color = 'white';
    progressText.style.fontSize = '18px';
    progressText.style.fontFamily = 'Arial, sans-serif';
    progressText.style.zIndex = '100';
    progressText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    progressText.style.padding = '10px 20px';
    progressText.style.borderRadius = '5px';
    progressText.textContent = 'Loading model: 0%';
    container.appendChild(progressText);

    // Load GLB model
    let mixer;
    let model;

    // Try to find the GLB file using different possible paths
    const possibleModelPaths = [
    '/card.glb',  // Root path
   ];

    // Function to attempt loading with a specific path
    const tryLoadingModel = (pathIndex) => {
      if (pathIndex >= possibleModelPaths.length) {
        // We've tried all paths, show error
        console.error('Failed to load model from any path');
        progressText.textContent = 'Error loading model';
        showErrorMessage('Failed to load 3D model. Please try refreshing the page.');
        return;
      }

      const modelPath = possibleModelPaths[pathIndex];
      console.log(`Attempting to load model from: ${modelPath}`);

      // Create a new GLTFLoader instance
      if (THREE.GLTFLoader) {
        const loader = new THREE.GLTFLoader();

        loader.load(
          modelPath,
          function (gltf) {
            console.log('Model loaded successfully:', gltf);
            scene.remove(cube); // Remove placeholder cube

            model = gltf.scene;
            modelContainer.add(model);

            // Handle animations if they exist
            if (gltf.animations && gltf.animations.length) {
              mixer = new THREE.AnimationMixer(model);
              const action = mixer.clipAction(gltf.animations[0]);
              action.play();
            }

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // Adjust camera position based on model size
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
            cameraZ *= 1.5; // Add some margin

            camera.position.set(0, 0, cameraZ);

            // Center the model
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;

            // Remove the progress indicator
            container.removeChild(progressText);

            console.log('Model rendering complete');
          },
          function (xhr) {
            // Update progress indicator
            if (xhr.lengthComputable) {
              const percentComplete = Math.round(xhr.loaded / xhr.total * 100);
              progressText.textContent = `Loading model: ${percentComplete}%`;
              console.log(`Model loading progress: ${percentComplete}%`);
            }
          },
          function (error) {
            console.error(`Error loading model from ${modelPath}:`, error);
            // Try the next path
            tryLoadingModel(pathIndex + 1);
          }
        );
      } else {
        console.error('THREE.GLTFLoader not available');
        showErrorMessage('GLTFLoader not available');
      }
    };

    // Start trying to load from the first path
    tryLoadingModel(0);

    // Add OrbitControls for interaction
    let controls;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 1;
      controls.maxDistance = 100;
      controls.maxPolarAngle = Math.PI;
      controls.autoRotate = true;        // Enable auto-rotation
      controls.autoRotateSpeed = 1.0;    // Rotation speed
    } else {
      console.warn('THREE.OrbitControls not available');
    }

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // Animation loop
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      // Rotate cube if it's still in the scene
      if (cube.parent === scene) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      }

      // Auto rotate the model container
      if (model && (!controls || !controls.autoRotate)) {
        modelContainer.rotation.y += 0.005;
      }

      // Update mixer for animations
      if (mixer) {
        mixer.update(clock.getDelta());
      }

      // Update controls
      if (controls) {
        controls.update();
      }

      renderer.render(scene, camera);
    }

    animate();
    console.log('Animation loop started');
  } catch (error) {
    console.error('Error initializing scene:', error);
    showErrorMessage(`Failed to initialize 3D scene: ${error.message}`);
  }
}
