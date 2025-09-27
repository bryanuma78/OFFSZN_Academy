const playlist = [
    {
      titulo: "KLK",
      artista: "J Wolf La Bestia",
      productor: "Willie Inspired",
      portada: "https://i.scdn.co/image/ab67616d00001e02809ea567c2c2e4e5e69773a5",
      audio: "/audio/klk.mp3"
    },
    {
        titulo: "La Nena",
        artista: "Lin Jh ft Dey Dan",
        productor: "Willie Inspired",
        portada: "https://cdn-images.dzcdn.net/images/cover/a837a7c2484d6580ec588c887106a658/1900x1900-000000-80-0-0.jpg",
        audio: "/audio/Lin JH ft Dey Dan  MT V6.wav"
    }
  ];
  
  const container = document.getElementById("playlist-container");
  
  playlist.forEach(track => {
    const card = document.createElement("div");
    card.classList.add("track-card");
  
    card.innerHTML = `
      <img src="${track.portada}" alt="${track.titulo}">
      <div class="track-info">
        <h3>${track.titulo}</h3>
        <audio id="audio-${track.titulo}" controls>
          <source src="${track.audio}" type="audio/mpeg">
          Tu navegador no soporta audio.
        </audio>
        <p><b>Artista:</b> ${track.artista}</p>
        <p><b>Prod:</b> ${track.productor}</p>
      </div>
    `;
  
    container.appendChild(card);
  });
  