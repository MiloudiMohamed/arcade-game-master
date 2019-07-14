// Enemies our player must avoid
// Variables applied to each of our instances go here,
// we've provided one for you to get started

// The image/sprite for our enemies, this uses
// a helper we've provided to easily load images
let canPlay = false;

class Enemy {
  constructor () {
    this.sprite = 'images/enemy-bug.png';
    this.resetPosition ();
  }

  // Draw the enemy on the screen, required method for game
  render () {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * (171 / 2) + -25);
  }

  update (dt) {

    if (game.freezeEnemies) {
      return;
    }

    if (this.x >= 5) {
      this.resetPosition();
    }

    this.x += (dt * this.speed);

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    //
  }

  resetPosition () {
    this.x = -1;
    this.y = Math.floor(Math.random() * 3 + 1);
    this.speed = Math.ceil(Math.random() * 4);
  }

}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

/**
 * Player class
 */
class Player {

  constructor () {
    this.sprite = 'images/char-cat-girl.png';
    this.x = 2;
    this.y = 5;
  }

  render () {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * (171 / 2) + -25);
  }

  update (dt) {
    if (this.y === 0 && game.hasAllStars()) {
      this.gain();
    }
  }

  handleInput (e) {

    if (canPlay === false) {
      return;
    }

    if (e === 'left' && this.x > 0) {
      this.x--;
    }

    if (e === 'right' && this.x < 4) {
      this.x++;
    }

    if (e === 'up' && this.y > 0) {
      if (this.y === 1 && game.superStar) {
        this.gain();
        return;
      }

      if (this.y === 1 && !game.hasAllStars()) {
        return;
      }
      this.y--;
    }

    if (e === 'down' && this.y < 5) {
      this.y++;
    }
  }

  resetPlayer () {
    this.x = 2;
    this.y = 5;
  }

  gain () {
    game.incrementScore();
    this.resetPlayer();
  }

  catched () {
    if (!game.hasProtection) {
      this.resetPlayer();
    }
    game.playerCatched();
  }
}

/**
 * Game class
 */
class Game {

  lives = 3;
  stars = 0;
  score = 0;
  supplyType = '';
  hasSupplies = false;
  hasProtection = false;
  freezeEnemies = false;
  superStar = false;

  constructor () {
    this.sprite = 'images/star.png';
    this.audio = new Audio;
    this.resetPosition();
    this.checkForSupplies();
  }

  render () {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * (171 / 2) + -25);

    if (this.hasSupplies) {
      this.gameSupplies();
    }

  }

  update(dt) {}

  starCollected () {

    if (this.hasSupplies) {
      this.gameSupplies()
    }

    this.runAudio('effects/start-collected.wav');

    this.stars++;

      renderStars();

    if (this.stars < 3) {
      this.resetPosition();
      return;
    }

    this.y = -999;
  }

  hasAllStars () {
    return this.stars === 3;
  }

  resetPosition () {
    this.x = Math.floor(Math.random() * 5);
    this.y = Math.floor(Math.random() * 3 + 1);
  }

  resetStars () {
    this.stars = 0;
    this.superStar = false;
    this.resetPosition();
  }

  incrementScore () {
    this.score++;
    this.resetStars();
    renderStars();
    renderScore();
    this.checkForSupplies();
    this.runAudio('effects/sea-reached.wav');
  }

  playerCatched (src) {
    if (this.hasProtection) {
      setTimeout(() => {
        this.hasProtection = false;
        renderProtection();
      }, 3000);

      return;
    }

    this.lives--;
    this.resetStars();
    renderHeart();
    renderStars();

    if (this.lives === 0) {
      this.gameover();
      return;
    }

    this.runAudio('effects/catched.mp3');
  }

  gameover () {
    this.resetStars();
    this.saveToLocalstorage();
    canPlay = false;

    document.querySelector('.score').innerText = this.score;
    document.querySelector('.highscore').innerText = this.highscore();
    document.querySelector('.gameover').style.display = 'flex';

    this.score = 0;
    this.lives = 3;
    renderHeart();
    renderStars();
    this.runAudio('effects/game-over.wav');
  }

  saveToLocalstorage () {
    localStorage.setItem(
      'score',
      Math.max(this.score, localStorage.getItem('score'))
    );
  }

  highscore () {
    return Math.max(this.score, localStorage.getItem('score'));
  }

  // Each time a player increments its score
  // there is a small change a supply may appear
  // Chances are 5/100
  checkForSupplies () {
    let random = Math.floor(Math.random() * 100 + 1);

    if (random > 0 && random <= 5) {
      this.supplyType = 'images/gem-blue.png';
      this.supplyPosition();
      this.hasSupplies = true;
      return;
    }

    if (random > 35 && random <= 40) {
      this.supplyType = 'images/gem-green.png';
      this.supplyPosition();
      this.hasSupplies = true;
      return;
    }

    if (random > 70 && random <= 75) {
      this.supplyType = 'images/gem-orange.png';
      this.supplyPosition();
      this.hasSupplies = true;
      return;
    }

    if (random > 95 && random <= 100) {
      this.supplyType = 'images/heart.png';
      this.supplyPosition();
      this.hasSupplies = true;
      return;
    }

    this.supplyType = ''
  }

  supplyCollected () {
    this.supplyY = -999;
    switch (this.supplyType) {
      case 'images/gem-blue.png':
        this.hasProtection = true;
        this.hasSupplies = false;
        break;

      case 'images/gem-green.png':
        this.freezeEnemies = true;

        setTimeout(() => {
          this.freezeEnemies = false;
          this.hasSupplies = false;
        }, 3000);
        break;

      case 'images/gem-orange.png':
        this.superStar = true;
        this.hasSupplies = false;
        this.y = -999;
        this.stars = 3;
        renderStars();
        break;

      case 'images/heart.png':
        this.lives++;
        this.hasSupplies = false;
        renderHeart();
        break;
    }

    renderProtection();
    this.runAudio('effects/supply-collected.wav');
  }

  gameSupplies () {
    ctx.drawImage(Resources.get(this.supplyType), this.supplyX * 101, this.supplyY * (171 / 2) + -25);
  }

  supplyPosition () {
    this.supplyX = Math.floor(Math.random() * 5);
    this.supplyY = Math.floor(Math.random() * 3 + 1);
  }

  runAudio (src) {
    this.audio.src = src;
    this.audio.play();
  }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

const allEnemies = [
  new Enemy(),
  new Enemy(),
  new Enemy(),
];

const player = new Player();
const game = new Game();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});

const livesEl = document.querySelector('.table__lives');
const scoreEl = document.querySelector('.table__score');
const starsEl = document.querySelector('.table__stars');
const protectionEl = document.querySelector('.table__protection');

const renderProtection = () => {
  protectionEl.innerText = game.hasProtection === true ? 'True' : 'False';
}

const renderStars = () => {
  starsEl.innerText = game.stars;
}

const renderScore = () => {
  scoreEl.innerText = game.score;
}

const renderHeart = function () {

  livesEl.innerText = '';
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < game.lives; i++) {
    const icon = document.createElement('icon');
    icon.classList = ['fa fa-heart fa-lg bg-danger mx-1'];
    fragment.appendChild(icon);
  }

  livesEl.appendChild(fragment);
}

renderHeart();

/* Adding player character event listener */
const chars = document.querySelectorAll('.player-character');

chars.forEach(char => {
  char.addEventListener('click', playerCharacter);
});

function playerCharacter(event) {
  event.preventDefault();
  player.sprite = event.target.dataset.name;
}

const launchGame = () => {
  canPlay = true;
  document.querySelector('.wrapper').style.display = 'none';
}

const restartGame = () => {
  document.querySelector('.gameover').style.display = 'none';
  document.querySelector('.wrapper').style.display = 'flex';
}