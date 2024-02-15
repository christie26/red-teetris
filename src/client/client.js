const socket = io();

// Create a 10x20 game board
for (let i = 0; i < 200; i++) {
  let child = document.createElement('li');
  board.appendChild(child);
}

// Handle arrow key press and send move event to server
document.addEventListener('keydown', event => {
  let direction = null;
  switch (event.key) {
    case 'ArrowUp':
      direction = 'rotate';
      break;
    case 'ArrowDown':
      direction = 'down';
      break;
    case 'ArrowLeft':
      direction = 'left';
      break;
    case 'ArrowRight':
      direction = 'right';
      break;
    case ' ':
      direction = 'sprint';
      break;
  }

  if (direction) {
    socket.emit('move', { type: 'keydown', direction: direction });
  }
});

document.addEventListener('keyup', event => {
  if (event.key === 'ArrowDown') {
    socket.emit('move', { type: 'keyup', direction: 'down' });
  }
});

socket.on('update', data => {
  const gameState = data.gameState;
  console.log('Received game state:', gameState);
  // Update the client-side game interface based on the received game state
});

socket.on('piece', data => {
  const fallingPiece = data.fallingPiece;
  console.log('Received falling piece:', fallingPiece);
  renderPiece(fallingPiece);
});

function getTypeString(type) {
  switch (type) {
    case 1:
      return 'O_BLOCK';
    case 2:
      return 'T_BLOCK';
    case 3:
      return 'J_BLOCK';
    case 4:
      return 'L_BLOCK';
    case 5:
      return 'S_BLOCK';
    case 6:
      return 'Z_BLOCK';
    case 7:
      return 'I_BLOCK';
  }
}
function renderPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;

  stringType = getTypeString(type);
  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling')) {
      element.classList.remove(stringType, 'falling');
    }
  });
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(
      stringType,
      'falling',
    );
  });
}
