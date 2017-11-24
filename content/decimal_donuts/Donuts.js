/// <reference path="../../typescript/phaser.comments.d.ts" />
class Config {
}
Config.DONUTS_SPAN_HEIGHT = 350;
Config.EDGE_PADDING = 20;
Config.DONUT_SIZE = 64;
Config.CASE_PADDING = 32;
Config.DONUT_CASE = Config.DONUT_SIZE + Config.CASE_PADDING;
Config.DONUT_MIN_SPEED = 50;
Config.DONUT_MAX_SPEED = 130;
Config.HANDS_SPEED = 0.9;
Config.CASES_OUT_RANGE = Config.DONUT_CASE * 20;
Config.CASES_IN_OUT_TIME = 800;
Config.CASES_DROP_TIME = 800;
Config.DONUTS_SPAN_TIME = 100;
Config.DONUTS_SPAN_GAP = 20;
Config.ROUNDS_PER_PLAY = 10;
Config.SCORE_PER_ROUND = 10;
class DecimalDonuts {
    constructor(core) {
        this.actors = [];
        this.donutPackaging = new DonutPackaging();
        this.donutFactory = new DonutFactory();
        this.workerHands = new WorkerHands(this.donutPackaging, this.donutFactory);
        this.core = core;
        this.actors.push(this.donutPackaging);
        this.actors.push(this.donutFactory);
        this.actors.push(this.workerHands);
        this.donutPackaging.roundOver.add(this.roundOver, this);
    }
    preload() {
        this.game = window["game"];
        this.game.load.atlasJSONHash("donuts", "assets/donuts.png", "assets/donuts.json");
        this.game.load.bitmapFont("numbers_50", "assets/fonts/varela_50.png", "assets/fonts/varela_50.fnt");
        this.game.load.bitmapFont("numbers_100", "assets/fonts/varela_100.png", "assets/fonts/varela_100.fnt");
        this.game.load.bitmapFont("numbers_200", "assets/fonts/varela_200.png", "assets/fonts/varela_200.fnt");
        this.actors.map(actor => actor.preload(this.game, this.core));
    }
    create(gameGroup) {
        this.gameGroup = gameGroup;
        this.gameGroup.x += Config.EDGE_PADDING;
        this.actors.map(actor => actor.create(gameGroup));
        this.restart();
    }
    update() {
        this.actors.map(actor => actor.update());
    }
    render() {
        this.actors.map(actor => actor.render());
    }
    levelOver() {
        this.restart();
    }
    restart() {
        this.actors.map(actor => actor.restart());
    }
    roundOver() {
        this.restart();
    }
}
class Actor {
    preload(game, core) {
        this.game = game;
        this.core = core;
    }
    create(group) { }
    update() { }
    render() { }
    restart() { }
    reload() { }
}
class DonutPackaging extends Actor {
    constructor() {
        super(...arguments);
        this.cases = [];
        this.startPacking = new Phaser.Signal();
        this.roundOver = new Phaser.Signal();
        this.packedDonuts = [];
        this.casesCount = 100;
    }
    checkPackaging() {
        if (this.packedCount == this.selectedCase + 1) {
            this.core.incrScore(Config.SCORE_PER_ROUND);
            this.packedDonuts.forEach((donut, index) => {
                donut.angle = 0;
                let tween = this.game.add.tween(donut).to({ angle: -30 }, Config.CASES_DROP_TIME / 2, Phaser.Easing.Bounce.Out, true, 0, 1, true);
                if (index + 1 == this.packedCount) {
                    tween.onComplete.add(() => {
                        this.endRound();
                    });
                }
            });
        }
        else {
            if (this.packedCount < this.selectedCase + 1) {
                for (let i = this.packedCount; i <= this.selectedCase; i++) {
                    this.wasted.add(this.cases[i], true);
                }
            }
            this.game.add.tween(this.wasted).to({ y: Config.CASES_OUT_RANGE }, Config.CASES_DROP_TIME, Phaser.Easing.Exponential.In, true).onComplete.add(() => {
                this.packedDonuts.forEach((donut, index) => {
                    donut.angle = 140;
                    let tween = this.game.add.tween(donut).to({ angle: 160 }, Config.CASES_DROP_TIME / 2, Phaser.Easing.Linear.None, true, 0, 1, true);
                    if (index + 1 == this.packedDonuts.length) {
                        tween.onComplete.add(() => {
                            this.endRound();
                        });
                    }
                });
            });
        }
    }
    success() {
    }
    endRound() {
        this.game.add.tween(this.casesInUse).to({ x: Config.CASES_OUT_RANGE }, Config.CASES_IN_OUT_TIME, Phaser.Easing.Exponential.In, true)
            .onComplete.add(() => {
            this.roundOver.dispatch();
        });
    }
    packTen(donutsToPack) {
        donutsToPack.forEach((donut, index) => {
            this.placeDonut(donut, index);
        });
        this.packedCount += 10;
    }
    packOne(donut) {
        this.placeDonut(donut, 0);
        this.packedCount += 1;
    }
    placeDonut(donut, index) {
        if (this.packedCount + index > this.selectedCase) {
            this.wasted.add(donut);
            donut.x = this.cases[this.packedCount + index].x;
            donut.y = this.cases[this.packedCount + index].y;
        }
        else {
            this.cases[this.packedCount + index].add(donut);
            donut.x = 0;
            donut.y = 0;
            this.packedDonuts[this.packedCount + index] = donut;
        }
    }
    create(group) {
        this.casesInUse = this.game.add.group(group);
        this.casesPool = this.game.add.group(group);
        this.wasted = this.game.add.group(group);
        this.casesPool.visible = false;
        let donutScale = Config.DONUT_CASE / this.game.cache.getFrameByName("donuts", "br1").width;
        console.log("holder scale", donutScale);
        let hoverFunc = (blackDonut) => {
            this.hover(blackDonut.data.caseIndex);
        };
        let clickFunc = (blackDonut, pointer, isOver) => {
            if (isOver) {
                this.select(blackDonut.data.caseIndex);
            }
            else {
                this.select(this.previewCase);
            }
        };
        for (let i = 0; i < this.casesCount; i++) {
            this.cases[i] = this.game.add.group(this.casesPool);
            let isBlack = (Math.floor(i / 10) % 2) == (i % 2);
            let blackDonut = this.cases[i].create(0, 0, "donuts", "br" + (isBlack ? "1" : "2"));
            blackDonut.data.caseIndex = i;
            blackDonut.anchor.setTo(0.5, 0.5);
            blackDonut.scale.setTo(donutScale, donutScale);
            blackDonut.inputEnabled = true;
            blackDonut.events.onInputOver.add(hoverFunc);
            blackDonut.events.onInputUp.add(clickFunc);
        }
    }
    hover(caseIndex) {
        if (this.selectedCase == null) {
            this.redraw(caseIndex, 0.3);
            this.previewCase = caseIndex;
        }
    }
    select(caseIndex) {
        if (this.selectedCase == null) {
            this.selectedCase = caseIndex;
            for (let i = caseIndex + 1; i < this.cases.length; i++) {
                this.casesPool.add(this.cases[i]);
            }
            this.startPacking.dispatch();
        }
    }
    redraw(caseIndex, alphaAfter) {
        for (let i = 0; i < this.cases.length; i++) {
            this.cases[i].alpha = i <= caseIndex ? 1 : alphaAfter;
        }
    }
    restart() {
        this.wasted.y = 0;
        this.packedDonuts = [];
        this.packedCount = 0;
        this.casesInUse.x = -Config.CASES_OUT_RANGE;
        this.previewCase = null;
        this.selectedCase = null;
        for (let i = 0; i < this.cases.length; i++) {
            this.casesInUse.add(this.cases[i], true);
            this.cases[i].x = (i % 10) * Config.DONUT_CASE + Config.DONUT_CASE / 2;
            this.cases[i].y = Config.DONUTS_SPAN_HEIGHT + Math.floor(i / 10) * Config.DONUT_CASE + Config.DONUT_CASE / 2;
        }
        this.redraw(100, 1);
        this.game.add.tween(this.casesInUse).to({ x: 0 }, Config.CASES_IN_OUT_TIME, Phaser.Easing.Exponential.Out, true);
    }
}
class WorkerHands extends Actor {
    constructor(donutPackaging, donutFactory) {
        super();
        this.donutPackaging = donutPackaging;
        this.donutFactory = donutFactory;
        this.donutPackaging.startPacking.add(this.startMoving, this);
    }
    create(group) {
        let handStyle = "_" + window["params"]["hand"];
        this.hands = this.game.add.group(group);
        this.onesHand = this.game.add.group(group);
        this.hands = this.game.add.group(group);
        let handScale = Config.DONUT_CASE * 5 / this.game.cache.getFrameByName("donuts", "right_hand" + handStyle).width;
        let handAlpha = 1;
        let handYPos = Config.DONUT_CASE * 1.5;
        let leftHand = this.game.add.sprite(0, -handYPos, "donuts", "left_hand" + handStyle, this.hands);
        leftHand.scale.setTo(handScale, handScale);
        leftHand.alpha = handAlpha;
        let rightHand = this.game.add.sprite(Config.DONUT_CASE * 5, -handYPos, "donuts", "right_hand" + handStyle, this.hands);
        rightHand.scale.setTo(handScale, handScale);
        rightHand.alpha = handAlpha;
        this.onesHand = this.game.add.group(group);
        let indexFiger = this.game.add.sprite(0, 0, "donuts", "right_hand_one", this.onesHand);
        indexFiger.anchor.setTo(0.3, 0.1);
        indexFiger.scale.setTo(handScale, handScale);
        indexFiger.alpha = handAlpha;
        this.hands.visible = false;
        this.onesHand.visible = false;
    }
    startMoving() {
        this.hands.visible = true;
        this.moveTen();
    }
    moveTen() {
        let donutsToPack = this.getNextDonutsBatch();
        if (donutsToPack.length == 10) {
            this.hands.y = 0;
            donutsToPack.forEach((donut, index) => {
                this.donutFactory.prepare(donut);
                this.hands.add(donut, true, 0);
                donut.x = Config.DONUT_CASE * (index + 0.5);
                donut.y = 0;
            });
            let y = this.getNextCasePos().y;
            let time = y / Config.HANDS_SPEED;
            this.game.add.tween(this.hands).to({ y: y }, time, null, true).onComplete.add(() => {
                this.donutPackaging.packTen(donutsToPack);
                this.moveTen();
            });
        }
        else {
            this.hands.visible = false;
            this.onesHand.visible = true;
            this.moveOne();
        }
    }
    moveOne() {
        let donutsToPack = this.getNextDonutsBatch();
        if (donutsToPack.length == 0) {
            this.onesHand.visible = false;
            this.donutPackaging.checkPackaging();
        }
        else {
            let donut = donutsToPack[0];
            this.donutFactory.prepare(donut);
            this.onesHand.x = donut.x;
            this.onesHand.y = donut.y;
            this.onesHand.add(donut, true, 0);
            donut.x = 0;
            donut.y = 0;
            let x = this.getNextCasePos().x;
            let y = this.getNextCasePos().y;
            let time = Math.max((y - this.onesHand.y) / (Config.HANDS_SPEED * 1.4), 100);
            this.game.add.tween(this.onesHand).to({ x: x, y: y }, time, null, true).onComplete.add(() => {
                this.donutPackaging.packOne(donut);
                this.moveOne();
            });
        }
    }
    getNextDonutsBatch() {
        if (this.donutFactory.donutsInUse.length >= 10) {
            return this.donutFactory.donutsInUse.children.slice(-10);
        }
        else {
            return this.donutFactory.donutsInUse.children.slice(-1);
        }
    }
    getNextCasePos() {
        return this.donutPackaging.cases[this.donutPackaging.packedCount].position;
    }
}
class DonutFactory extends Actor {
    constructor() {
        super(...arguments);
        this.donuts = [];
    }
    addBorder(x, y, width, height) {
        let border = this.game.add.sprite(x, y, null, null, this.donutBorder);
        this.game.physics.enable(border, Phaser.Physics.ARCADE);
        let body = border.body;
        body.immovable = true;
        border.body.setSize(window["ppu"] * width, window["ppu"] * height);
    }
    createBorders() {
        let thickness = 10;
        this.addBorder(0, 0, Config.DONUT_CASE * 10, thickness);
        this.addBorder(0, 0, thickness, Config.DONUTS_SPAN_HEIGHT);
        this.addBorder(Config.DONUT_CASE * 10, 0, thickness, Config.DONUTS_SPAN_HEIGHT);
        this.addBorder(0, Config.DONUTS_SPAN_HEIGHT, Config.DONUT_CASE * 10, thickness);
        let graphics = this.game.add.graphics(0, 0, this.donutBorder);
        graphics.lineStyle(0, 0x000000, 1);
        graphics.beginFill(0xF65277, 1);
        graphics.drawRect(0, 0, Config.DONUT_CASE * 10, Config.DONUTS_SPAN_HEIGHT);
        graphics.endFill();
    }
    prepare(donut) {
        donut.body.velocity.setTo(0, 0);
        donut.body.angularVelocity = 0;
        donut.angle = 0;
    }
    create(group) {
        this.donutBorder = this.game.add.group(group);
        this.donutsInUse = this.game.add.group(group);
        this.donutsPool = this.game.add.group(group);
        this.donutsPool.visible = false;
        this.donutsNumber = this.game.add.bitmapText(Config.DONUT_CASE * 5, Config.DONUTS_SPAN_HEIGHT / 2, "numbers_200", "", 200, group);
        this.donutsNumber.anchor.setTo(0.5, 0.3);
        this.createBorders();
        let donutTextureSize = this.game.cache.getFrameByName("donuts", "base").width;
        let donutScale = Config.DONUT_SIZE / donutTextureSize;
        console.log("donut scale", donutScale);
        let bounce = new Phaser.Point(1, 1);
        let donutBodySize = donutTextureSize;
        let y = (1 - window["ppu"]) * donutTextureSize / 2;
        let bodySize = new Phaser.Point(window["ppu"] * donutBodySize, y);
        for (let i = 0; i < 100; i++) {
            this.donuts[i] = this.generateDonut(this.donutsPool);
            this.donuts[i].scale.setTo(donutScale, donutScale);
            this.game.physics.enable(this.donuts[i], Phaser.Physics.ARCADE);
            let body = this.donuts[i].body;
            body.bounce = bounce;
            body.setSize(bodySize.x, bodySize.x, bodySize.y, bodySize.y);
        }
    }
    restart() {
        let donutCount = this.game.rnd.integerInRange(1, 99);
        this.donutCount = donutCount;
        this.donutsNumber.text = "";
        this.donuts.forEach(donut => {
            this.donutsPool.add(donut);
        });
        let tween;
        for (let i = 0; i < donutCount; i++) {
            let donut = this.donutsPool.getRandom();
            this.donutsInUse.add(donut, true);
            donut.x = this.game.rnd.realInRange(Config.DONUT_CASE, Config.DONUT_CASE * 9);
            donut.y = this.game.rnd.realInRange(Config.DONUT_CASE, Config.DONUTS_SPAN_HEIGHT - Config.DONUT_CASE);
            this.game.physics.enable(this.donuts[i], Phaser.Physics.ARCADE);
            let body = donut.body;
            body.angularVelocity = this.game.rnd.integerInRange(-Config.DONUT_MAX_SPEED, Config.DONUT_MAX_SPEED);
            let angle = Phaser.Math.degToRad(this.game.rnd.angle());
            let speed = this.game.rnd.realInRange(Config.DONUT_MIN_SPEED, Config.DONUT_MAX_SPEED);
            body.velocity.setTo(speed * Math.cos(angle), speed * Math.sin(angle));
            donut.alpha = 0;
            tween = this.game.add.tween(donut).to({ alpha: 1 }, Config.DONUTS_SPAN_TIME, Phaser.Easing.Exponential.Out, true, Config.DONUTS_SPAN_GAP * i);
        }
        this.donutsNumber.text = donutCount.toString();
    }
    update() {
        this.game.physics.arcade.collide(this.donutsInUse, this.donutBorder);
    }
    render() {
        if (this.game.config.enableDebug) {
            this.donuts.forEach(donut => {
                this.game.debug.body(donut);
            });
            this.donutBorder.children.forEach(border => {
                this.game.debug.body(border);
            });
        }
    }
    generateDonut(group) {
        let stringToSprite = (imageName) => {
            let layer = group.create(0, 0, "donuts", imageName);
            layer.anchor.setTo(0.5, 0.5);
            return layer;
        };
        let dnBuns = ["dn1", "dn2", "dn3", "dn4"];
        let baseDonut = stringToSprite("base");
        baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnBuns)));
        return baseDonut;
    }
}
class GenericGame {
    constructor(width, height, backGroundColor) {
        this.maxScore = 100;
        this.score = 0;
        this.stars = [];
        this.game = new Phaser.Game({
            width: width,
            height: height,
            parent: "content",
            enableDebug: false,
            state: {
                preload: () => this.preload(),
                create: () => this.create(),
                update: () => this.update(),
                render: () => this.render()
            }
        });
        window["game"] = this.game;
        this.decimalDonuts = new DecimalDonuts(this);
        this.backgroundColor = backGroundColor;
    }
    preload() {
        this.decimalDonuts.preload();
    }
    create() {
        this.game.stage.backgroundColor = this.backgroundColor;
        this.game.time.advancedTiming = true;
        let root = ScaledGroup.create(this.game, GenericGame.WIDTH, GenericGame.HEIGHT);
        this.timer = this.game.add.bitmapText(GenericGame.PADDING, GenericGame.HUD_HEIGHT / 2, "numbers_50", "2:30", 50, root);
        this.timer.anchor.setTo(0, 0.3);
        this.title = this.game.add.bitmapText(GenericGame.WIDTH - GenericGame.PADDING - GenericGame.STAR_SIZE * 3.5, GenericGame.HUD_HEIGHT / 2, "numbers_100", "Decimal Donuts", 70, root);
        this.title.anchor.setTo(1, 0.5);
        let gameGroup = this.game.add.group(root);
        gameGroup.y += GenericGame.HUD_HEIGHT;
        this.decimalDonuts.create(gameGroup);
        this.scoreMask = this.game.add.graphics(0, 0, root);
        let starScale = GenericGame.STAR_SIZE / this.game.cache.getFrameByName("donuts", "starGold").height;
        for (let i = 0; i < 3; i++) {
            this.stars[i] = this.game.add.sprite(GenericGame.WIDTH - GenericGame.PADDING - GenericGame.STAR_SIZE * (3 - i), GenericGame.PADDING, "donuts", "starEmpty", root);
            this.stars[i].scale.setTo(starScale, starScale);
            let gold = this.game.add.sprite(0, 0, "donuts", "starGold", root);
            gold.mask = this.scoreMask;
            this.stars[i].addChild(gold);
        }
        this.incrScore(0);
    }
    update() {
        this.decimalDonuts.update();
        this.elapsed += this.game.time.elapsedMS;
    }
    render() {
        this.decimalDonuts.render();
    }
    incrScore(scoreToAdd) {
        this.score += scoreToAdd;
        console.log(this.score);
        let scoreRatio = this.score / this.maxScore;
        this.scoreMask.clear();
        this.scoreMask.beginFill(0xFFFFFF, 1);
        this.scoreMask.drawRect(GenericGame.WIDTH - GenericGame.PADDING - GenericGame.STAR_SIZE * 3, 0, GenericGame.STAR_SIZE * 3 * scoreRatio, GenericGame.HUD_HEIGHT);
        this.scoreMask.endFill();
    }
}
GenericGame.HEIGHT = 1460;
GenericGame.WIDTH = 1000;
GenericGame.HUD_HEIGHT = 100;
GenericGame.PADDING = 10;
GenericGame.STAR_SIZE = 80;
class ScaledGroup {
    static create(game, width, height) {
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
        if (game.config.enableDebug) {
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
}
window.onload = () => {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var params = {};
    params["hand"] = url.searchParams.get("hand") || "skin";
    window["params"] = params;
    var game = new GenericGame(window.innerWidth, window.innerHeight, "#FFF49B");
};
function detectMobile() {
    let ua = navigator.userAgent;
    if (ua.match(/Android/i)
        || ua.match(/webOS/i)
        || ua.match(/iPhone/i)
        || ua.match(/iPod/i)) {
        return true;
    }
    else {
        return false;
    }
}
function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
}
