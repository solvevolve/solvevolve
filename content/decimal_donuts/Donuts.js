/// <reference path="../../typescript/phaser.comments.d.ts" />
class DonutTray {
    constructor(game) {
        this.donuts = [];
        this.game = game;
    }
    create(gameGroup) {
        this.gameGroup = gameGroup;
        this.borderGroup = this.game.add.group(this.gameGroup);
        let createBorder = (x, y, width, height) => {
            let border = this.game.add.sprite(x, y, null, null, this.borderGroup);
            this.game.physics.enable(border, Phaser.Physics.ARCADE);
            let body = border.body;
            body.immovable = true;
            border.body.setSize(window["ppu"] * width, window["ppu"] * height);
        };
        let thickness = 1;
        createBorder(DecimalDonuts.EDGE_PADDING, 0, DecimalDonuts.DONUT_CASE * 10, thickness);
        createBorder(DecimalDonuts.EDGE_PADDING, 0, thickness, DecimalDonuts.DONUTS_SPAN_HEIGHT);
        createBorder(DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 10, 0, thickness, DecimalDonuts.DONUTS_SPAN_HEIGHT);
        createBorder(DecimalDonuts.EDGE_PADDING, DecimalDonuts.DONUTS_SPAN_HEIGHT, DecimalDonuts.DONUT_CASE * 10, thickness);
        let graphics = this.game.add.graphics(0, 0, this.gameGroup);
        graphics.lineStyle(5, 0x000000, 1);
        graphics.drawRect(DecimalDonuts.EDGE_PADDING, 0, DecimalDonuts.DONUT_CASE * 10, DecimalDonuts.DONUTS_SPAN_HEIGHT);
        this.donutsNumber = this.game.add.text(DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 5, DecimalDonuts.DONUTS_SPAN_HEIGHT / 2, "", DecimalDonuts.DONUTS_NUMBER_STYLE, this.gameGroup);
        this.donutsNumber.anchor.setTo(0.5, 0.5);
        let handScale = DecimalDonuts.DONUT_CASE * 5 / this.game.cache.getFrameByName("donuts", "right_hand").width;
        this.hands = this.game.add.sprite(DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 5, 0, "donuts", "right_hand", this.gameGroup);
        this.hands.alpha = 0.8;
        this.hands.renderable = false;
        this.hands.scale.setTo(handScale, handScale);
        let leftHand = this.game.add.sprite(0, 0, "donuts", "right_hand", this.gameGroup);
        leftHand.scale.setTo(-1, 1);
        this.hands.addChild(leftHand);
        this.oneHand = this.game.add.sprite(DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 1.5, 0, "donuts", "right_hand_one", this.gameGroup);
        this.oneHand.anchor.setTo(0.3, 0);
        this.oneHand.scale.setTo(handScale, handScale);
        this.oneHand.alpha = this.hands.alpha;
    }
    restart(donutCount) {
        this.donutsNumber.text = donutCount.toString();
        let donutTextureSize = this.game.cache.getFrameByName("donuts", "donut_1").width;
        let donutScale = DecimalDonuts.DONUT_SIZE / donutTextureSize;
        for (let i = 0; i < 100; i++) {
            if (i < donutCount) {
                this.donuts[i] = this.generateDonut(this.gameGroup);
                this.donuts[i].scale.setTo(donutScale, donutScale);
                this.donuts[i].x = DecimalDonuts.EDGE_PADDING + this.game.rnd.realInRange(DecimalDonuts.DONUT_CASE / 2, DecimalDonuts.DONUT_CASE * 9.5);
                this.donuts[i].y = this.game.rnd.realInRange(DecimalDonuts.DONUT_CASE / 2, DecimalDonuts.DONUTS_SPAN_HEIGHT - DecimalDonuts.DONUT_CASE / 2);
                this.game.physics.enable(this.donuts[i], Phaser.Physics.ARCADE);
                let body = this.donuts[i].body;
                body.bounce = new Phaser.Point(1, 1);
                let angle = Phaser.Math.degToRad(this.game.rnd.angle());
                let speed = this.game.rnd.realInRange(DecimalDonuts.DONUT_MIN_SPEED, DecimalDonuts.DONUT_MAX_SPEED);
                body.angularVelocity = 100;
                body.velocity.setTo(speed * Math.cos(angle), speed * Math.sin(angle));
                body.setSize(window["ppu"] * donutTextureSize, window["ppu"] * donutTextureSize, (1 - window["ppu"]) * donutTextureSize / 2, (1 - window["ppu"]) * donutTextureSize / 2);
                // body.setCircle(window["ppu"] * donutTextureSize / 2, (1 - window["ppu"]) * donutTextureSize / 2, (1 - window["ppu"]) * donutTextureSize / 2)
            }
        }
        this.gameGroup.bringToTop(this.hands);
        this.gameGroup.bringToTop(this.oneHand);
        this.gameGroup.bringToTop(this.donutsNumber);
    }
    generateDonut(group) {
        let stringToSprite = (imageName) => {
            let layer = group.create(0, 0, "donuts", imageName);
            layer.anchor.setTo(0.5, 0.5);
            return layer;
        };
        let bases = ["donut_1", "donut_1", "donut_2", "donut_3"];
        let glazings = ["glazing_1", "glazing_2", "glazing_3", "glazing_4", "glazing_5", "glazing_6",
            "glazing_zigzag_1", "glazing_zigzag_2", "glazing_zigzag_3", "glazing_zigzag_4"];
        let sprinkles = ["sprinkles_1", "sprinkles_2", "sprinkles_3", "sprinkles_4", "sprinkles_5",
            "stripes_1", "stripes_2", "stripes_3"];
        let baseDonut = stringToSprite(this.game.rnd.pick(bases));
        baseDonut.addChild(stringToSprite(this.game.rnd.pick(glazings)));
        baseDonut.addChild(stringToSprite(this.game.rnd.pick(sprinkles)));
        return baseDonut;
    }
}
class DonutCases {
    constructor(game) {
        this.cases = [];
        this.game = game;
    }
    create(gameGroup) {
        let donutScale = DecimalDonuts.DONUT_SIZE / this.game.cache.getFrameByName("donuts", "donut_1").width;
        let hoverFunc = (blackDonut) => {
            this.hover(blackDonut.data.caseIndex);
        };
        let clickFunc = (blackDonut) => {
            this.select(blackDonut.data.caseIndex);
        };
        for (let i = 0; i < 100; i++) {
            this.cases[i] = this.game.add.group(gameGroup);
            let graphics = this.game.add.graphics(0, 0, this.cases[i]);
            graphics.lineStyle(5, 0x000000, 1);
            graphics.drawRect(0, 0, DecimalDonuts.DONUT_CASE, DecimalDonuts.DONUT_CASE);
            let blackDonut = this.cases[i].create(DecimalDonuts.DONUT_CASE / 2, DecimalDonuts.DONUT_CASE / 2, "donuts", "donut_black");
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
        }
    }
    select(caseIndex) {
        if (this.selectedCase == null) {
            this.redraw(caseIndex, 0);
            this.selectedCase = caseIndex;
        }
    }
    redraw(caseIndex, alphaAfter) {
        for (let i = 0; i < this.cases.length; i++) {
            this.cases[i].alpha = i <= caseIndex ? 1 : alphaAfter;
        }
    }
    restart() {
        this.previewCase = null;
        this.selectedCase = null;
        for (let i = 0; i < this.cases.length; i++) {
            this.cases[i].x = DecimalDonuts.EDGE_PADDING + (i % 10) * DecimalDonuts.DONUT_CASE;
            this.cases[i].y = DecimalDonuts.DONUTS_SPAN_HEIGHT + DecimalDonuts.EDGE_PADDING + Math.floor(i / 10) * DecimalDonuts.DONUT_CASE;
            this.cases[i].alpha = 1;
        }
    }
}
class DecimalDonuts {
    constructor(game) {
        this.game = game;
        this.donutCases = new DonutCases(this.game);
        this.donutTray = new DonutTray(this.game);
    }
    preload() {
        this.game.load.atlasJSONHash("donuts", "assets/donuts.png", "assets/donuts.json");
    }
    create(gameGroup) {
        this.gameGroup = gameGroup;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.donutCases.create(gameGroup);
        this.donutCases.restart();
        this.donutTray.create(gameGroup);
        this.donutTray.restart(59);
    }
    update() {
        this.game.physics.arcade.collide(this.gameGroup, this.donutTray.borderGroup);
    }
    render() {
        //console.log(this.donutTray.donuts[0].worldScale)
        // this.gameGroup.children.forEach(el => {
        //     if (el instanceof Phaser.Sprite) {
        //         this.game.debug.body(el)
        //     }
        //     if (el instanceof Phaser.Group) {
        //         el.children.forEach(ch => {
        //             if (ch instanceof Phaser.Sprite) {
        //                 this.game.debug.body(ch)
        //             }
        //         })
        //     }
        // })
    }
}
DecimalDonuts.DONUTS_SPAN_HEIGHT = 300;
DecimalDonuts.EDGE_PADDING = 10;
DecimalDonuts.DONUT_SIZE = 75;
DecimalDonuts.CASE_PADDING = 15;
DecimalDonuts.DONUT_CASE = DecimalDonuts.DONUT_SIZE + DecimalDonuts.CASE_PADDING;
DecimalDonuts.CASE_TEXT_SIZE = 80;
DecimalDonuts.DONUTS_NUMBER_STYLE = {
    fontSize: 320,
    stroke: "#000000",
    strokeThickness: 15,
    fill: "#FFFFFFF3"
};
DecimalDonuts.DONUT_MIN_SPEED = 20;
DecimalDonuts.DONUT_MAX_SPEED = 80;
class GenericGame {
    constructor(width, height) {
        this.stars = [];
        this.game = new Phaser.Game({
            width: width,
            height: height,
            parent: "content",
            enableDebug: true,
            state: {
                preload: () => this.preload(),
                create: () => this.create(),
                update: () => this.update(),
                render: () => this.render()
            }
        });
        this.decimalDonuts = new DecimalDonuts(this.game);
    }
    preload() {
        this.game.load.image("star", "assets/starGold.png");
        this.game.stage.backgroundColor = 0x3f7cb6;
        this.decimalDonuts.preload();
    }
    create() {
        this.window = new ScaledWindow(this.game, GenericGame.WIDTH, GenericGame.HEIGHT);
        this.window.create();
        let starScale = GenericGame.STAR_SIZE / this.game.cache.getImage("star").width;
        let hudMiddle = GenericGame.HUD_HEIGHT / 2;
        this.timer = this.game.add.text(10, hudMiddle, "02:45", GenericGame.TIMER_STYLE, this.window.window);
        this.timer.anchor.setTo(0, 0.5);
        this.title = this.game.add.text(800, hudMiddle, "Decimal Donuts", GenericGame.TITLE_STYLE, this.window.window);
        this.title.anchor.setTo(1, 0.5);
        this.title.stroke = "#000000";
        this.title.strokeThickness = 3;
        // this.title.fill = "#AA0000"
        this.stars[0] = this.game.add.sprite(850, hudMiddle, "star", null, this.window.window);
        this.stars[1] = this.game.add.sprite(910, hudMiddle, "star", null, this.window.window);
        this.stars[2] = this.game.add.sprite(970, hudMiddle, "star", null, this.window.window);
        this.stars[0].scale.setTo(starScale);
        this.stars[1].scale.setTo(starScale);
        this.stars[2].scale.setTo(starScale);
        this.stars[0].anchor.setTo(0.5, 0.5);
        this.stars[1].anchor.setTo(0.5, 0.5);
        this.stars[2].anchor.setTo(0.5, 0.5);
        let gameGroup = this.game.add.group(this.window.window);
        gameGroup.y = GenericGame.HUD_HEIGHT;
        this.decimalDonuts.create(gameGroup);
    }
    update() {
        this.decimalDonuts.update();
    }
    render() {
        this.decimalDonuts.render();
    }
}
GenericGame.HEIGHT = 1460;
GenericGame.WIDTH = 1000;
GenericGame.HUD_HEIGHT = 160;
GenericGame.TIMER_STYLE = { fontSize: 50 };
GenericGame.TITLE_STYLE = { fontSize: 80 };
GenericGame.STAR_SIZE = 70;
class ScaledWindow {
    constructor(game, width, height) {
        let originalWidth = game.width;
        let originalHeight = game.height;
        this.game = game;
        this.width = width;
        this.height = height;
        this.window = this.game.add.group();
        let ppux = originalWidth / width;
        let ppuy = originalHeight / height;
        let ppu = Math.min(ppux, ppuy);
        window["ppu"] = ppu;
        this.window.x = ppux > ppu ? originalWidth / 2 - ppu * width / 2 : 0;
        this.window.y = ppuy > ppu ? originalHeight / 2 - ppu * height / 2 : 0;
        this.window.scale.setTo(ppu, ppu);
        console.log("Pixels Per Unit", ppu);
        console.log("Fitting:", ppux > ppuy ? "Vertical" : "Horizontal");
    }
    create() {
        let graphics = this.game.add.graphics(0, 0, this.window);
        for (let i = 0; i <= this.width; i += 10) {
            let width = 1 + (i % 50 == 0 ? 2 : 0) + (i % 100 == 0 ? 1 : 0);
            graphics.lineStyle(width, 0x404040, 0.1);
            graphics.moveTo(i, 0);
            graphics.lineTo(i, this.height);
        }
        for (let j = 0; j <= this.height; j += 10) {
            let width = 1 + (j % 50 == 0 ? 2 : 0) + (j % 100 == 0 ? 1 : 0);
            graphics.lineStyle(width, 0x404040, 0.1);
            graphics.moveTo(0, j);
            graphics.lineTo(this.width, j);
        }
    }
}
window.onload = () => {
    var game = new GenericGame(window.innerWidth, window.innerHeight);
};
