/// <reference path="../../typescript/phaser.comments.d.ts" />
class Crow {
    constructor(core) {
        this.core = core;
        this.game = window["game"];
    }
    preload() {
        this.game.load.atlasJSONHash("main", "assets/crow.png", "assets/crow.json");
        this.game.load.spritesheet("crow", "assets/ss.png", 983, 1289);
    }
    create(group) {
        this.group = group;
        let height = CrowMainGame.HEIGHT;
        let width = CrowMainGame.WIDTH;
        let backGround = this.placeImage("background", CrowMainGame.WIDTH / 2, CrowMainGame.HEIGHT / 2, CrowMainGame.WIDTH, CrowMainGame.HEIGHT);
        let rock1 = this.placeImage("rock", 175, 600, 350, 200);
        let rock2 = this.placeImage("rock", 900 - 175, 600, 350, 200);
        let pot = this.placeImage("pot", width / 2, height - 500, 400, 400);
        //let potFilled: Phaser.Sprite = this.placeImage("pot_filled", width / 2, height - 500, 400, 400).getAt(0) as Phaser.Sprite
        this.positionOneRocks();
        this.positionTenRocks();
        let potHolder = this.placeImage("pot_holder", width / 2, height - 200, width * 0.8, 300);
        let crow = this.game.add.sprite(300, 300, "crow");
        crow.scale.setTo(0.25, 0.25);
        crow.animations.add("fly", null);
        crow.animations.play("fly", 10, true);
    }
    positionOneRocks() {
        let rockSize = 60;
        let rockY = 530;
        this.placeImage("one_rock", 100, rockY, rockSize, rockSize);
        this.placeImage("one_rock", 165, rockY, rockSize, rockSize);
        this.placeImage("one_rock", 230, rockY, rockSize, rockSize);
        this.placeImage("one_rock", 265 / 2, rockY + 5 - 1 * rockSize, rockSize, rockSize);
        this.placeImage("one_rock", 395 / 2, rockY + 5 - 1 * rockSize, rockSize, rockSize);
        this.placeImage("one_rock", 165, rockY + 10 - 2 * rockSize, rockSize, rockSize);
    }
    positionTenRocks() {
        let rockSizeX = 135;
        let rockSizeY = 100;
        let rockY = 510;
        let xOff = 900 - 350 + 50;
        this.placeImage("ten_rock", xOff + 0, rockY, rockSizeX, rockSizeY);
        this.placeImage("ten_rock", xOff + 125, rockY, rockSizeX, rockSizeY);
        this.placeImage("ten_rock", xOff + 250, rockY, rockSizeX, rockSizeY);
        this.placeImage("ten_rock", xOff + 125 / 2, rockY + 15 - 1 * rockSizeY, rockSizeX, rockSizeY);
        this.placeImage("ten_rock", xOff + 375 / 2, rockY + 15 - 1 * rockSizeY, rockSizeX, rockSizeY);
        this.placeImage("ten_rock", xOff + 125, rockY + 30 - 2 * rockSizeY, rockSizeX, rockSizeY);
    }
    update() {
    }
    render() {
    }
    levelOver() {
    }
    placeImage(name, x, y, width, height) {
        let size = this.game.cache.getFrameByName("main", name);
        let group = this.game.add.group(this.group);
        let sprite = this.game.add.sprite(x, y, "main", name, group);
        sprite.anchor.setTo(0.5, 0.5);
        sprite.scale.setTo(width / size.width, height / size.height);
        return group;
    }
}
class CrowMainGame {
    constructor(width, height, backGroundColor) {
        this.maxScore = 100;
        this.score = 0;
        this.stars = [];
        this.game = new Phaser.Game({
            width: width,
            height: height,
            parent: "content",
            enableDebug: window["params"]["debug"],
            state: {
                preload: () => this.preload(),
                create: () => this.create(),
                update: () => this.update(),
                render: () => this.render()
            }
        });
        window["game"] = this.game;
        this.crow = new Crow(this);
        this.backgroundColor = backGroundColor;
    }
    preload() {
        this.game.load.bitmapFont("numbers_50", "assets/fonts/varela_50.png", "assets/fonts/varela_50.fnt");
        this.game.load.bitmapFont("numbers_100", "assets/fonts/varela_100.png", "assets/fonts/varela_100.fnt");
        this.game.load.bitmapFont("numbers_200", "assets/fonts/varela_200.png", "assets/fonts/varela_200.fnt");
        this.crow.preload();
    }
    create() {
        this.game.stage.backgroundColor = this.backgroundColor;
        this.game.time.advancedTiming = true;
        this.root = scaledWindow(this.game, CrowMainGame.WIDTH, CrowMainGame.HEIGHT);
        this.timer = this.game.add.bitmapText(0, 0, "numbers_50", "0:00", 50, this.root);
        this.title = this.game.add.bitmapText(0, 0, "numbers_100", "Thirsty Crow", 60, this.root);
        let starScale = CrowMainGame.STAR_SIZE / this.game.cache.getFrameByName("main", "starGold").height;
        this.starGroup = this.game.add.group(this.root);
        this.scoreMask = this.game.add.graphics(0, 0, this.starGroup);
        for (let i = 0; i < 3; i++) {
            this.stars[i] = this.game.add.sprite(i * CrowMainGame.STAR_SIZE, 0, "main", "starEmpty", this.starGroup);
            this.stars[i].anchor.setTo(0, 0.5);
            this.stars[i].scale.setTo(starScale, starScale);
            let gold = this.game.add.sprite(0, 0, "main", "starGold", this.starGroup);
            gold.anchor.setTo(0, 0.5);
            gold.mask = this.scoreMask;
            this.stars[i].addChild(gold);
        }
        let gameGroup = this.game.add.group(this.root);
        // gameGroup.y += CrowMainGame.HUD_HEIGHT
        this.crow.create(gameGroup);
        this.levelOver();
        this.popup = this.game.add.group(this.root);
        this.popup.y = CrowMainGame.HUD_HEIGHT * 2.5;
        let popupImg = this.game.add.sprite(0, 0, "main", "popup", this.popup);
        popupImg.scale.setTo(2, 2.3);
        this.positionInHud();
        if (this.game.config.enableDebug) {
            this.fpsLabel = this.game.add.bitmapText(CrowMainGame.WIDTH / 2, CrowMainGame.HEIGHT * 0.9, "numbers_100", "FPS:", 100, this.root);
            this.fpsLabel.anchor.setTo(0.5, 1);
            this.game.time.advancedTiming = true;
        }
        this.replay = this.game.add.sprite(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT * 2.5, "main", "replay", this.popup);
        this.replay.anchor.setTo(0.5, 0.5);
        this.replay.inputEnabled = true;
        this.replay.events.onInputUp.add(() => {
            this.positionInHud();
            this.levelOver();
        });
    }
    positionInHud() {
        this.popup.visible = false;
        this.root.addChild(this.timer);
        this.timer.position.set(CrowMainGame.PADDING, CrowMainGame.HUD_HEIGHT / 2);
        this.timer.anchor.setTo(0, 0.3);
        this.root.addChild(this.title);
        this.title.position.set(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT / 2);
        this.title.anchor.setTo(0.5, 0.45);
        this.root.addChild(this.starGroup);
        this.starGroup.x = CrowMainGame.WIDTH - CrowMainGame.STAR_SIZE * 3;
        this.starGroup.y = CrowMainGame.HUD_HEIGHT / 2;
    }
    positionInPop() {
        this.popup.visible = true;
        this.popup.addChild(this.timer);
        this.timer.position.set(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT * 2);
        this.timer.anchor.setTo(0.5, 0.5);
        this.popup.addChild(this.title);
        this.title.position.set(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT);
        this.title.anchor.setTo(0.5, 1);
        this.popup.addChild(this.starGroup);
        this.starGroup.x = CrowMainGame.WIDTH / 2 - CrowMainGame.STAR_SIZE * 1.5;
        this.starGroup.y = CrowMainGame.HUD_HEIGHT * 1.25;
    }
    update() {
        this.crow.update();
        if (this.keepTicking) {
            this.elapsed += this.game.time.elapsedMS;
            if (this.elapsed > (this.timeInSeconds + 1) * 1000) {
                this.timeInSeconds = Math.floor(this.elapsed / 1000);
                this.updateTimerText();
            }
        }
    }
    updateTimerText() {
        let minutes = Math.floor(this.timeInSeconds / 60);
        let seconds = this.timeInSeconds % 60;
        let secondsText = seconds < 10 ? "0" + seconds : seconds;
        this.timer.text = minutes + ":" + secondsText;
    }
    render() {
        this.crow.render();
        if (this.game.config.enableDebug) {
            this.fpsLabel.text = "FPS:" + this.game.time.fps;
        }
    }
    incrScore(scoreToAdd) {
        this.score += scoreToAdd;
        console.log(this.score);
        let scoreRatio = this.score / this.maxScore;
        this.scoreMask.clear();
        this.scoreMask.beginFill(0xFFFFFF, 1);
        this.scoreMask.drawRect(0, -CrowMainGame.STAR_SIZE / 2, 3 * CrowMainGame.STAR_SIZE * scoreRatio, CrowMainGame.HUD_HEIGHT);
        this.scoreMask.endFill();
    }
    setTicking(ticking) {
        this.keepTicking = ticking;
    }
    levelOver() {
        console.log("level over");
        this.score = 0;
        this.incrScore(0);
        this.elapsed = 0;
        this.timeInSeconds = 0;
        this.keepTicking = false;
        this.updateTimerText();
        this.crow.levelOver();
    }
}
CrowMainGame.HEIGHT = 1500;
CrowMainGame.WIDTH = 900;
CrowMainGame.HUD_HEIGHT = 150;
CrowMainGame.PADDING = 20;
CrowMainGame.STAR_SIZE = 60;
function scaledWindow(game, width, height) {
    let ppux = game.width / width;
    let ppuy = game.height / height;
    let ppu = Math.min(ppux, ppuy);
    window["ppu"] = ppu;
    console.log("Pixels Per Unit", ppu);
    console.log("Fitting:", ppux > ppuy ? "Vertical" : "Horizontal");
    let group = game.add.group();
    group.x = ppux > ppu ? game.width / 2 - ppu * width / 2 : 0;
    group.y = ppuy > ppu ? game.height / 2 - ppu * height / 2 : 0;
    group.scale.setTo(ppu, ppu);
    if (game.config.enableDebug || window["params"]["grid"]) {
        let graphics = game.add.graphics(0, 0, group);
        for (let i = 0; i <= width; i += 10) {
            let lineWidth = 1 + (i % 50 == 0 ? 2 : 0) + (i % 100 == 0 ? 1 : 0);
            graphics.lineStyle(lineWidth, 0x404040, 0.1);
            graphics.moveTo(i, 0);
            graphics.lineTo(i, height);
        }
        for (let j = 0; j <= height; j += 10) {
            let lineWidth = 1 + (j % 50 == 0 ? 2 : 0) + (j % 100 == 0 ? 1 : 0);
            graphics.lineStyle(lineWidth, 0x404040, 0.1);
            graphics.moveTo(0, j);
            graphics.lineTo(width, j);
        }
    }
    return game.add.group(group);
}
window.onload = () => {
    let url = new URL(window.location.href);
    let params = {};
    params["debug"] = url.searchParams.get("debug") === "true";
    params["grid"] = url.searchParams.get("grid") === "true";
    window["params"] = params;
    let backGround = "#FFF498";
    let game = new CrowMainGame(window.innerWidth, window.innerHeight, backGround);
};
