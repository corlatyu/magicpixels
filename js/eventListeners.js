//
// Kelas untuk menangani masukan pengguna
//
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    // Peristiwa Pemain
    // Loncat
    case "w":
      if (player.velocity.y === 0) {
        player.velocity.y = -15;
      }
      break;

    // kiri
    case "a":
      keys.a.pressed = true;
      break;

    // kanan
    case "d":
      keys.d.pressed = true;
      break;

    // Peristiwa Permainan
    // Menu Jeda
    case "Escape":
      pauseGame();
      break;
  }
});

// Ini mengatasi gerakan aneh pemain jika tombol a dan d ditekan secara bersamaan
window.addEventListener("keyup", (event) => {
  switch (event.key) {
    // kiri
    case "a":
      keys.a.pressed = false;
      break;

    // kanan
    case "d":
      keys.d.pressed = false;
      break;
  }
});
