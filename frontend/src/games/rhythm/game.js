import Phaser from 'phaser';
import { LEVELS } from './levels';

/**
 * BootScene: basic setup
 */
class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }
  preload() {
    // generate tiny textures for player and obstacles to keep everything original
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00e6ff, 1);
    g.fillRoundedRect(0, 0, 32, 32, 6);
    g.generateTexture('player-cube', 32, 32);

    g.clear();
    g.fillStyle(0xff4d4d, 1);
    g.fillTriangle(0, 24, 12, 0, 24, 24);
    g.generateTexture('spike', 24, 24);

    g.clear();
    g.fillStyle(0xffffff, 0.06);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('dot', 4, 4);
  }
  create() { this.scene.start('MenuScene'); }
}

/**
 * MenuScene: title + level select shortcut
 */
class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }
  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x050718);
    const title = this.add.text(width/2, height*0.2, 'Rhythm Runner', { fontSize: '48px', fontFamily: 'monospace', color: '#00e6ff' }).setOrigin(0.5);

    // simple level preview buttons
    LEVELS.slice(0,5).forEach((level, i) => {
      const btn = this.add.text(width/2, height*0.38 + i*56, `${level.name} • ${level.difficulty}`, { fontSize: '20px', color: '#d7f9ff' }).setOrigin(0.5).setInteractive({useHandCursor:true});
      btn.on('pointerup', () => {
        this.scene.start('PlayScene', { levelIndex: i });
      });
    });

    // quick play
    const quick = this.add.text(width/2, height*0.85, 'Quick Play', { fontSize:'18px', color:'#fff' }).setOrigin(0.5).setInteractive({useHandCursor:true});
    quick.on('pointerup', () => { this.scene.start('PlayScene', { levelIndex: 0 }); });
  }
}

/**
 * PlayScene: core gameplay
 */
class PlayScene extends Phaser.Scene {
  constructor() { super({ key: 'PlayScene' }); }

  init(data) {
    this.level = LEVELS[data.levelIndex || 0];
    this.elapsed = 0;
    this.isDead = false;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x040612);

    // particles background
    this.add.tileSprite(0, 0, width, height, 'dot').setOrigin(0).setScrollFactor(0).setAlpha(0.55);

    // ground
    const groundY = height - 48;
    this.ground = this.add.rectangle(0, groundY, 999999, 96, 0x081227).setOrigin(0,0);
    this.physics.add.existing(this.ground, true);

    // player sprite
    this.player = this.physics.add.sprite(160, groundY - 40, 'player-cube');
    this.player.setDepth(10);
    this.player.body.setSize(28,28);
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0);

    // physics tuning for satisfying jump arc
    this.physics.world.gravity.y = 1400;

    // camera
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setLerp(0.12, 0.12);

    // obstacle group
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.collider(this.player, this.obstacles, this.onPlayerHit, null, this);
    this.physics.add.collider(this.player, this.ground, this.onPlayerLand, null, this);

    // trail
    this.trail = this.add.particles('dot');
    this.emitter = this.trail.createEmitter({ x: 0, y: 0, speed: { min: -40, max: 40 }, scale: { start: 0.9, end: 0 }, alpha: { start: 0.7, end: 0 }, frequency: 40 });

    // input
    this.input.keyboard.on('keydown-SPACE', () => this.playerJump());
    this.input.on('pointerdown', () => this.playerJump());

    // spawn obstacles using event timeline
    this.spawnIndex = 0;

    // HUD events
    this.scene.launch('UIScene', { levelName: this.level.name });

    // speed
    this.baseSpeed = this.level.speed || 360;
    this.runSpeed = this.baseSpeed;

    // start music sync placeholder
    this.bpm = this.level.bpm || 120;
  }

  playerJump() {
    if (this.isDead) return;
    // allow coyote time: small window after leaving ground
    const body = this.player.body;
    if (body.onFloor() || this.canDoubleJump) {
      body.setVelocityY(-620);
      this.player.setAngularVelocity(400);
      this.player.setTint(0x99f7ff);
      this.time.delayedCall(120, () => this.player.clearTint());
    }
  }

  onPlayerHit() {
    if (this.isDead) return;
    this.isDead = true;
    this.player.setTint(0xff4d4d);
    this.scene.stop('UIScene');
    // instant restart after short flash
    this.cameras.main.flash(220, 255, 80, 80);
    this.time.delayedCall(220, () => {
      this.scene.restart({ levelIndex: LEVELS.indexOf(this.level) });
    });
  }

  onPlayerLand() {
    // snap upright
    this.player.setAngle(0);
    this.player.setAngularVelocity(0);
  }

  spawnFromEvent(ev) {
    const type = ev[1];
    const params = ev[2] || {};
    const spawnX = this.cameras.main.scrollX + this.scale.width + 180;
    if (type === 'spike') {
      const y = this.scale.height - 80 - (params.y || 0);
      const spike = this.obstacles.create(spawnX, y, 'spike');
      spike.setOrigin(0.5,1);
      spike.body.setSize(24,24);
      spike.body.setImmovable(true);
      spike.body.setVelocityX(-this.runSpeed);
    } else if (type === 'gap') {
      // represent gap by absence (we leave platform continuous but player must jump)
      // spawn a hazard to mark gap visually
      const g = this.add.rectangle(spawnX, this.scale.height - 60, params.width || 160, 64, 0x081227);
      this.obstacles.add(g);
      this.physics.add.existing(g, true);
      g.body.setVelocityX(-this.runSpeed);
    }
  }

  update(time, delta) {
    const dt = delta/1000;
    this.elapsed += dt;
    // advance player forward (auto-run)
    const move = this.runSpeed * dt;
    this.player.x += move;
    // update emitter to follow player
    this.emitter.setPosition(this.player.x - 12, this.player.y);

    // spawn timeline events
    while (this.spawnIndex < this.level.events.length && this.elapsed >= this.level.events[this.spawnIndex][0]) {
      const ev = this.level.events[this.spawnIndex];
      this.spawnFromEvent(ev);
      this.spawnIndex++;
    }

    // remove offscreen obstacles
    this.obstacles.getChildren().forEach(obj => {
      if (obj.x < this.cameras.main.scrollX - 200) obj.destroy();
      else if (obj.body && obj.body.velocity) obj.body.setVelocityX(-this.runSpeed);
    });
  }
}

/** UI Scene (HUD) */
class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene' }); }
  init(data) { this.levelName = data.levelName; }
  create() {
    const { width } = this.scale;
    this.add.text(16,16, this.levelName, { fontSize: '18px', color: '#d7f9ff' });
    this.add.text(width-140, 16, 'Lives: 1', { fontSize: '16px', color: '#fff' }).setOrigin(0);
  }
}

export function createPhaserGame(container, levelIndex=0) {
  const config = {
    type: Phaser.AUTO,
    parent: container,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#040612',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, MenuScene, PlayScene, UIScene]
  };
  const game = new Phaser.Game(config);
  game.scene.start('BootScene');
  // pass levelIndex through start when launching PlayScene from menu
  return game;
}

export default PlayScene;
