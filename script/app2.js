const playlist = [
    {
      titulo: "KLK",
      artista: "J Wolf La Bestia",
      productor: "Willie Inspired",
      portada: "https://i.scdn.co/image/ab67616d00001e02809ea567c2c2e4e5e69773a5",
      audio: "/audio/J Wolf - KLK.wav"
    },
    {
      titulo: "Energía",
      artista: "J WOLF La Bestia",
      productor: "Willie Inspired",
      portada: "/img/titulo.png",
      audio: "/audio/energia.mp3"
    }
  ];
  
  const container = document.getElementById("playlist-container");
  let wavesurfers = {};
  let currentTrack = null;
  
  playlist.forEach(track => {
    const card = document.createElement("div");
    card.classList.add("track-card");
  
    card.innerHTML = `
      <img src="${track.portada}" alt="${track.titulo}">
      <div class="track-info">
        <h3>${track.titulo}</h3>
        <div id="waveform-${track.titulo}" class="waveform"></div>
        <div class="track-controls">
          <button onclick="togglePlay('${track.titulo}')">
            <i id="icon-${track.titulo}" class="bi bi-play-circle-fill"></i>
          </button>
          <span id="current-${track.titulo}">0:00</span> / 
          <span id="duration-${track.titulo}">0:00</span>
        </div>
        <p><b>Artista:</b> ${track.artista}</p>
        <p><b>Prod:</b> ${track.productor}</p>
      </div>
    `;
  
    container.appendChild(card);
  
    // Crear wavesurfer
    const wavesurfer = WaveSurfer.create({
      container: `#waveform-${track.titulo}`,
      waveColor: '#aaa',
      progressColor: '#f0483e',
      barWidth: 2,
      responsive: true,
      height: 40, // más pequeño
      normalize: true
    });
  
    wavesurfer.load(track.audio);
  
    wavesurfer.on('ready', () => {
      document.getElementById(`duration-${track.titulo}`).innerText =
        formatTime(wavesurfer.getDuration());
    });
  
    wavesurfer.on('audioprocess', () => {
      if (wavesurfer.isPlaying()) {
        document.getElementById(`current-${track.titulo}`).innerText =
          formatTime(wavesurfer.getCurrentTime());
      }
    });
  
    wavesurfer.on('seek', () => {
      document.getElementById(`current-${track.titulo}`).innerText =
        formatTime(wavesurfer.getCurrentTime());
    });
  
    wavesurfers[track.titulo] = wavesurfer;
  });
  
  function togglePlay(titulo) {
    const ws = wavesurfers[titulo];
    
    // Pausar canción anterior
    if (currentTrack && currentTrack !== ws) {
      currentTrack.pause();
      const oldTitulo = Object.keys(wavesurfers).find(k => wavesurfers[k] === currentTrack);
      document.getElementById(`icon-${oldTitulo}`).className = "bi bi-play-circle-fill";
    }
    
    ws.playPause();
    currentTrack = ws;
  
    const icon = document.getElementById(`icon-${titulo}`);
    if (ws.isPlaying()) {
      icon.className = "bi bi-pause-circle-fill";
    } else {
      icon.className = "bi bi-play-circle-fill";
    }
  }
  
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }
  