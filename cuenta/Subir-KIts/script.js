
let config = null;

// Cargar configuración al inicio
fetch('config.json')
  .then(response => response.json())
  .then(data => {
    config = data;
    initializeApp();
  })
  .catch(error => {
    console.error('Error al cargar configuración:', error);
    showError('Error al cargar la configuración del sistema');
  });

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const loader = document.getElementById('loader');
const result = document.getElementById('result');
const fileInfo = document.getElementById('fileInfo');

let selectedFile = null;

function initializeApp() {
  console.log(`${config.app.name} v${config.app.version} cargado`);
  
  // Actualizar texto de la UI desde el JSON
  document.querySelector('.upload-text').textContent = config.ui.uploadAreaText;
  document.querySelector('.upload-subtext').textContent = config.ui.uploadSubtext;
  document.querySelector('.btn-text').textContent = config.ui.buttonText;
  document.querySelector('.loader-text').textContent = config.ui.loaderText;
  
  // Generar atributo accept dinámico
  const acceptExtensions = Object.keys(config.allowedExtensions).map(ext => `.${ext}`).join(',');
  fileInput.setAttribute('accept', acceptExtensions);
  
  setupEventListeners();
}

function setupEventListeners() {
  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  uploadBtn.addEventListener('click', uploadFile);
}

function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

function getFileConfig(extension) {
  return config.allowedExtensions[extension] || null;
}

function validateImageDimensions(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ valid: true });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const ratio = width / height;
      const tolerance = config.validation.allowedRatioTolerance;

      let matchedSize = null;
      let isExactMatch = false;

      for (const [key, dimensions] of Object.entries(config.coverDimensions)) {
        const expectedRatio = dimensions.width / dimensions.height;
        if (Math.abs(ratio - expectedRatio) < tolerance) {
          matchedSize = dimensions;
          isExactMatch = (width === dimensions.width && height === dimensions.height);
          break;
        }
      }

      URL.revokeObjectURL(url);

      resolve({
        valid: matchedSize !== null,
        width: width,
        height: height,
        matchedSize: matchedSize,
        exactMatch: isExactMatch
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false });
    };

    img.src = url;
  });
}

async function handleFile(file) {
  const extension = getFileExtension(file.name);
  const fileConfig = getFileConfig(extension);
  
  if (!fileConfig) {
    showError(config.messages.error.invalidType + `: .${extension}`);
    uploadBtn.disabled = true;
    return;
  }

  if (file.size > fileConfig.maxSize) {
    const maxSizeMB = (fileConfig.maxSize / 1024 / 1024).toFixed(2);
    showError(`${config.messages.error.tooLarge} (Máximo: ${maxSizeMB} MB)`);
    uploadBtn.disabled = true;
    return;
  }

  const category = fileConfig.category;

  if (category === 'portadas' && config.validation.checkImageDimensions) {
    const validation = await validateImageDimensions(file);
    
    if (!validation.valid) {
      showError(config.messages.error.invalidDimensions);
      uploadBtn.disabled = true;
      return;
    }

    if (!validation.exactMatch && validation.matchedSize) {
      showWarning(`
        ${config.messages.warning.dimensionMismatch}<br>
        Imagen: ${validation.width}x${validation.height}<br>
        Recomendado: ${validation.matchedSize.width}x${validation.matchedSize.height} 
        (${validation.matchedSize.name})
      `);
    }
  }

  selectedFile = file;
  showFileInfo(file, fileConfig);
  uploadBtn.disabled = false;
}

function showFileInfo(file, fileConfig) {
  const size = (file.size / 1024 / 1024).toFixed(2);
  const extension = getFileExtension(file.name);
  const categoryData = config.fileCategories[fileConfig.category];
  
  fileInfo.innerHTML = `
    <p><strong>Categoría:</strong> ${fileConfig.icon} ${categoryData.name}</p>
    <p><strong>Archivo:</strong> ${file.name}</p>
    <p><strong>Formato:</strong> .${extension.toUpperCase()}</p>
    <p><strong>Tamaño:</strong> ${size} MB</p>
    <p><strong>Tipo MIME:</strong> ${file.type || fileConfig.mimeType}</p>
  `;
  
  fileInfo.style.display = 'block';
  result.style.display = 'none';
}

function showError(message) {
  result.style.display = 'block';
  result.className = 'result error';
  result.innerHTML = `<strong>✗ ${message}</strong>`;
}

function showWarning(message) {
  result.style.display = 'block';
  result.className = 'result warning';
  result.innerHTML = `<strong>⚠ ${message}</strong>`;
}

function showSuccess(message, details = '') {
  result.style.display = 'block';
  result.className = 'result success';
  result.innerHTML = `<strong>✓ ${message}</strong>${details ? '<br>' + details : ''}`;
}

async function uploadFile() {
  if (!selectedFile) return;

  uploadBtn.disabled = true;
  loader.style.display = 'block';
  result.style.display = 'none';

  const formData = new FormData();
  formData.append('file', selectedFile);
  
  const extension = getFileExtension(selectedFile.name);
  const fileConfig = getFileConfig(extension);
  formData.append('category', fileConfig.category);
  formData.append('extension', extension);

  try {
    const response = await fetch('upload.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    loader.style.display = 'none';
    result.style.display = 'block';

    if (data.success) {
      const categoryData = config.fileCategories[fileConfig.category];
      
      let details = `
        <small>Archivo: ${data.filename}</small><br>
        <small>Categoría: ${categoryData.name}</small>
      `;
      
      if (data.scan_results) {
        details += '<br><small>✓ Escaneado con VirusTotal</small>';
      }
      
      showSuccess(config.messages.success.upload, details);
      
      setTimeout(() => {
        resetForm();
      }, 3000);
    } else {
      let errorMsg = data.message || config.messages.error.uploadFailed;
      if (data.detections) {
        errorMsg += `<br><small>Detecciones: ${data.detections}</small>`;
      }
      showError(errorMsg);
    }
  } catch (error) {
    loader.style.display = 'none';
    showError(`${config.messages.error.uploadFailed}<br><small>${error.message}</small>`);
  }

  uploadBtn.disabled = false;
}

function resetForm() {
  selectedFile = null;
  fileInput.value = '';
  fileInfo.style.display = 'none';
  result.style.display = 'none';
  uploadBtn.disabled = true;
}

console.log('Sistema de subida cargando...');
