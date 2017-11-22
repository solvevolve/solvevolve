/// <reference path="../../typescript/phaser.comments.d.ts" />
class DecimalDonuts {

    static DONUTS_SPAN_HEIGHT = 350
    static EDGE_PADDING = 10
    static DONUT_SIZE = 80
    static CASE_PADDING = 12
    static DONUT_CASE = DecimalDonuts.DONUT_SIZE + DecimalDonuts.CASE_PADDING

    static DONUT_MIN_SPEED = 50
    static DONUT_MAX_SPEED = 130

    static HANDS_SPEED = 0.6


    game: Phaser.Game
    gameGroup: Phaser.Group
    donutCases: DonutCases
    donutTray: DonutFactory

    constructor(game: Phaser.Game) {
        this.game = game
        this.donutCases = new DonutCases(this.game)
        this.donutTray = new DonutFactory(this.game)
    }

    preload() {
        this.game.load.atlasJSONHash("donuts", "assets/donuts.png", "assets/donuts.json")
        this.game.load.bitmapFont("numbers_40", "assets/fonts/KaoriGel_40.png", "assets/fonts/KaoriGel_40.fnt")
        this.game.load.bitmapFont("numbers_240", "assets/fonts/KaoriGel_240.png", "assets/fonts/KaoriGel_240.fnt")
    }

    create(gameGroup: Phaser.Group) {
        this.gameGroup = gameGroup
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.donutCases.create(gameGroup)
        this.donutCases.caseSelected.add(this.caseSelected, this)

        this.donutTray.create(gameGroup, this.donutCases.cases[0].position)
        this.donutTray.donutsCased.add(this.donutsCased, this)

        this.restart(40)
    }

    update() {
        this.game.physics.arcade.collide(this.gameGroup, this.donutTray.borderGroup)
    }

    render() {
        if (this.game.config.enableDebug) {
            this.gameGroup.children.forEach(el => {
                if (el instanceof Phaser.Sprite) {
                    this.game.debug.body(el)
                }
                if (el instanceof Phaser.Group) {
                    el.children.forEach(ch => {
                        if (ch instanceof Phaser.Sprite) {
                            this.game.debug.body(ch)
                        }
                    })
                }
            })
        }
    }

    caseSelected(noOfCases: number) {
        this.donutTray.moveToCases(this.donutCases.casesGroup)
    }

    donutsCased(casingDone: boolean, casedCount: number) {
        this.donutCases.donutsCased(casingDone, casedCount)
        if (casingDone) {
            window.setTimeout(() => {
                let count = this.game.rnd.integerInRange(1, 99)
                this.restart(count)
            }, 3000)
        }
    }

    restart(count: number) {
        this.donutCases.restart(count)
        this.donutTray.restart(count)
    }
}


class DonutFactory {
    game: Phaser.Game
    gameGroup: Phaser.Group
    borderGroup: Phaser.Group

    donutsGroup: Phaser.Group
    donuts: Phaser.Sprite[] = []
    donutsNumber: Phaser.BitmapText
    hands: Phaser.Group
    oneHand: Phaser.Group
    casesGroup: Phaser.Group

    donutsCased: Phaser.Signal

    
    donutCount: number
    casedDonutCount: number
    firstCasePosition: Phaser.Point

    constructor(game: Phaser.Game) {
        this.game = game
        this.donutsCased = new Phaser.Signal()
    }

    create(gameGroup: Phaser.Group, firstCasePosition: Phaser.Point) {
        this.gameGroup = gameGroup
        this.firstCasePosition = firstCasePosition

        this.borderGroup = this.game.add.group(this.gameGroup)
        this.donutsGroup = this.game.add.group(this.gameGroup)

        let createBorder = (x, y, width, height) => {
            let border = this.game.add.sprite(x, y, null, null, this.borderGroup)
            this.game.physics.enable(border, Phaser.Physics.ARCADE)
            let body: Phaser.Physics.Arcade.Body = border.body
            body.immovable = true
            border.body.setSize(window["ppu"] * width, window["ppu"] * height)
        }

        let thickness = 1
        createBorder(DecimalDonuts.EDGE_PADDING, 0, DecimalDonuts.DONUT_CASE * 10, thickness)
        createBorder(DecimalDonuts.EDGE_PADDING, 0, thickness, DecimalDonuts.DONUTS_SPAN_HEIGHT)
        createBorder(DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 10, 0, thickness, DecimalDonuts.DONUTS_SPAN_HEIGHT)
        createBorder(DecimalDonuts.EDGE_PADDING, DecimalDonuts.DONUTS_SPAN_HEIGHT, DecimalDonuts.DONUT_CASE * 10, thickness)


        let graphics = this.game.add.graphics(0, 0, this.gameGroup)
        graphics.lineStyle(5, 0x000000, 1);
        graphics.drawRect(DecimalDonuts.EDGE_PADDING, 0, DecimalDonuts.DONUT_CASE * 10, DecimalDonuts.DONUTS_SPAN_HEIGHT)

        this.donutsNumber = this.game.add.bitmapText(DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 5, DecimalDonuts.DONUTS_SPAN_HEIGHT / 2, "numbers_240", "", 240, this.gameGroup)
        this.donutsNumber.anchor.setTo(0.5, 0.3)


        this.hands = this.game.add.group(this.gameGroup)
        this.hands.x = DecimalDonuts.EDGE_PADDING
        this.hands.y = DecimalDonuts.DONUT_CASE

        let handScale = DecimalDonuts.DONUT_CASE * 5 / this.game.cache.getFrameByName("donuts", "right_hand").width;
        let handAlpha = 0.8
        let handYPos = DecimalDonuts.DONUT_CASE * 1.5

        let leftHand = this.game.add.sprite(0, -handYPos, "donuts", "left_hand", this.hands);
        leftHand.scale.setTo(handScale, handScale)
        leftHand.alpha = handAlpha


        let rightHand = this.game.add.sprite(DecimalDonuts.DONUT_CASE * 5, -handYPos, "donuts", "right_hand", this.hands)
        rightHand.scale.setTo(handScale, handScale)
        rightHand.alpha = handAlpha

        this.oneHand = this.game.add.group(this.gameGroup)
        let indexFiger = this.game.add.sprite(0, 0, "donuts", "right_hand_one", this.oneHand);
        indexFiger.anchor.setTo(0.3, 0.1)
        indexFiger.scale.setTo(handScale, handScale)
        indexFiger.alpha = handAlpha

    }

    restart(donutCount: number) {
        this.hands.visible = false
        this.oneHand.visible = false
        this.donutCount = donutCount
        this.casedDonutCount = 0

        this.donutsNumber.text = donutCount.toString()

        let donutTextureSize = this.game.cache.getFrameByName("donuts", "donut_1").width
        let donutScale = DecimalDonuts.DONUT_SIZE / donutTextureSize

        this.donuts.forEach(donut => {
            donut.kill()
        })

        for (let i = 0; i < donutCount; i++) {

            this.donuts[i] = this.generateDonut(this.donutsGroup)
            this.donuts[i].scale.setTo(donutScale, donutScale);
            this.donuts[i].x = DecimalDonuts.EDGE_PADDING + this.game.rnd.realInRange(DecimalDonuts.DONUT_CASE / 2, DecimalDonuts.DONUT_CASE * 9.5)
            this.donuts[i].y = this.game.rnd.realInRange(DecimalDonuts.DONUT_CASE / 2, DecimalDonuts.DONUTS_SPAN_HEIGHT - DecimalDonuts.DONUT_CASE / 2)

            this.game.physics.enable(this.donuts[i], Phaser.Physics.ARCADE)
            let body: Phaser.Physics.Arcade.Body = this.donuts[i].body
            body.bounce = new Phaser.Point(1, 1)

            let angle = Phaser.Math.degToRad(this.game.rnd.angle())
            let speed = this.game.rnd.realInRange(DecimalDonuts.DONUT_MIN_SPEED, DecimalDonuts.DONUT_MAX_SPEED)
            body.angularVelocity = 100
            body.velocity.setTo(speed * Math.cos(angle), speed * Math.sin(angle))
            body.setSize(window["ppu"] * donutTextureSize, window["ppu"] * donutTextureSize,
                (1 - window["ppu"]) * donutTextureSize / 2, (1 - window["ppu"]) * donutTextureSize / 2)
        }

        this.gameGroup.bringToTop(this.hands)
        this.gameGroup.bringToTop(this.oneHand)
        this.gameGroup.bringToTop(this.donutsNumber)
    }

    private generateDonut(group: Phaser.Group): Phaser.Sprite {

        let stringToSprite = (imageName) => {
            let layer: Phaser.Sprite = group.create(0, 0, "donuts", imageName)
            layer.anchor.setTo(0.5, 0.5);
            return layer
        }

        let bases = ["donut_1", "donut_1", "donut_2", "donut_3"]
        let glazings = ["glazing_1", "glazing_2", "glazing_3", "glazing_4", "glazing_5", "glazing_6",
            "glazing_zigzag_1", "glazing_zigzag_2", "glazing_zigzag_3", "glazing_zigzag_4"]
        let sprinkles = ["sprinkles_1", "sprinkles_2", "sprinkles_3", "sprinkles_4", "sprinkles_5",
            "stripes_1", "stripes_2", "stripes_3"]

        let baseDonut: Phaser.Sprite = stringToSprite(this.game.rnd.pick(bases))
        baseDonut.addChild(stringToSprite(this.game.rnd.pick(glazings)))
        baseDonut.addChild(stringToSprite(this.game.rnd.pick(sprinkles)))

        return baseDonut
    }

    moveToCases(casesGroup: Phaser.Group) {
        this.casesGroup = casesGroup
        this.hands.visible = true
        this.moveTenToCases()
    }

    moveOneToCase() {
        if (this.donutCount > this.casedDonutCount) {
            let donutToMove = this.donuts[this.casedDonutCount]
            donutToMove.physicsEnabled = false
            donutToMove.body.angularVelocity = 0
            donutToMove.body.velocity.set(0, 0)
            this.oneHand.position.set(donutToMove.position.x, donutToMove.position.y)

            this.oneHand.addChildAt(donutToMove, 0)
            donutToMove.position.set(0, 0)


            let x = DecimalDonuts.DONUT_CASE * (this.casedDonutCount % 10) + DecimalDonuts.DONUT_CASE / 2
            let y = this.firstCasePosition.y + DecimalDonuts.DONUT_CASE / 2 + Math.floor(this.casedDonutCount / 10) * DecimalDonuts.DONUT_CASE

            let time = this.oneHand.position.distance(new Phaser.Point(x, y)) / (DecimalDonuts.HANDS_SPEED * 1.42)
            this.game.add.tween(this.oneHand).to({ x: x, y: y }, time, null, true, 0, 0, false).onComplete.add(() => {
                this.casedDonutCount++
                this.donutsCased.dispatch(false, this.casedDonutCount)
                this.casesGroup.addChild(donutToMove)
                donutToMove.x = x + DecimalDonuts.EDGE_PADDING
                donutToMove.y = y
                this.moveOneToCase()
            })
        }
        else {
            this.oneHand.visible = false
            this.donutsCased.dispatch(true, this.casedDonutCount)
        }
    }

    moveTenToCases() {
        if (this.donutCount - this.casedDonutCount >= 10) {
            let donutsToMove = this.donuts.slice(this.casedDonutCount, this.casedDonutCount + 10)

            donutsToMove.forEach((donut, index) => {
                donut.physicsEnabled = false
                donut.body.angularVelocity = 0
                donut.body.velocity.set(0, 0)
                this.hands.addChildAt(donut, 0)
                donut.x = DecimalDonuts.DONUT_CASE * index + DecimalDonuts.DONUT_CASE / 2
                donut.y = 0
            });

            this.hands.y = DecimalDonuts.DONUT_CASE
            let y = this.firstCasePosition.y + DecimalDonuts.DONUT_CASE / 2 + Math.floor(this.casedDonutCount / 10) * DecimalDonuts.DONUT_CASE
            let time = (y - this.hands.y) / DecimalDonuts.HANDS_SPEED
            this.game.add.tween(this.hands).to({ y: y }, time, null, true, 0, 0, false).onComplete.add(() => {
                this.casedDonutCount += 10
                this.donutsCased.dispatch(false, this.casedDonutCount)
                donutsToMove.forEach((donut, index) => {
                    this.casesGroup.addChild(donut)
                    donut.x += DecimalDonuts.EDGE_PADDING
                    donut.y = y
                });
                this.moveTenToCases()
            })
        } else {
            this.hands.visible = false
            this.oneHand.visible = true
            this.moveOneToCase()
        }
    }
}

class DonutCases {
    game: Phaser.Game
    cases: Phaser.Group[] = []

    gameGroup: Phaser.Group
    casesGroup: Phaser.Group
    onesGroup: Phaser.Group
    tens: Phaser.BitmapText[] = []
    ones: Phaser.BitmapText[] = []
    caseSelected: Phaser.Signal
    selectedCase?: number
    previewCase?: number

    casesCount = 100

    constructor(game: Phaser.Game) {
        this.game = game
    }

    create(gameGroup: Phaser.Group) {
        this.gameGroup = gameGroup

        let donutScale = (DecimalDonuts.DONUT_SIZE * 1) / this.game.cache.getFrameByName("donuts", "donut_1").width

        let hoverFunc = (blackDonut: Phaser.Sprite) => {
            this.hover(blackDonut.data.caseIndex)
        }
        let clickFunc = (blackDonut: Phaser.Sprite, pointer, isOver: boolean) => {
            if (isOver) {
                this.select(blackDonut.data.caseIndex)
            } else {
                this.select(this.previewCase)
            }
        }

        this.casesGroup = this.game.add.group(gameGroup)

        for (let i = 0; i < this.casesCount; i++) {
            this.cases[i] = this.game.add.group(this.casesGroup)
            let isBlack = (Math.floor(i / 10) % 2) == (i % 2);

            let blackDonut: Phaser.Sprite = this.cases[i].create(DecimalDonuts.DONUT_CASE / 2, DecimalDonuts.DONUT_CASE / 2, "donuts", "donut_" + (isBlack ? "black_case" : "white_case"))
            blackDonut.data.caseIndex = i
            blackDonut.alpha = 1
            blackDonut.anchor.setTo(0.5, 0.5)
            blackDonut.scale.setTo(donutScale, donutScale)
            blackDonut.inputEnabled = true

            blackDonut.events.onInputOver.add(hoverFunc)
            blackDonut.events.onInputUp.add(clickFunc)

        }
        this.caseSelected = new Phaser.Signal()

        let guideFontSize = 30

        for (let i = 0; i < 9; i++) {
            let x = DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 10.5
            let y = DecimalDonuts.DONUTS_SPAN_HEIGHT + DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * (i + 0.5)
            this.tens[i] = this.game.add.bitmapText(x, y, "numbers_40", String((i + 1) * 10), guideFontSize, gameGroup)
            this.tens[i].anchor.setTo(0.5, 0.3)
            let fontSize = this.tens[i].fontSize as number
            this.game.add.tween(this.tens[i]).to({ fontSize: fontSize * 1.5 }, 1000, null, true, 0, -1, true)
        }

        this.onesGroup = this.game.add.group(gameGroup)

        this.onesGroup.y = DecimalDonuts.DONUTS_SPAN_HEIGHT + DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * 10.5
        for (let i = 0; i < 9; i++) {
            let x = DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * (i + 0.5)
            let y = DecimalDonuts.DONUTS_SPAN_HEIGHT + DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * (10.5)
            this.ones[i] = this.game.add.bitmapText(x, 0,"numbers_40" , "9" + String((i + 1)), guideFontSize, this.onesGroup)
            this.ones[i].anchor.setTo(0.5, 0.7)

            let fontSize = this.ones[i].fontSize as number
            this.game.add.tween(this.ones[i]).to({ fontSize: fontSize * 1.5 }, 1000, null, true, 0, -1, true)
        }

    }

    hover(caseIndex: number) {
        if (this.selectedCase == null) {
            this.redraw(caseIndex, 0.3)
            this.previewCase = caseIndex
        }
    }

    select(caseIndex: number) {
        if (this.selectedCase == null) {
            this.redraw(caseIndex, 0)
            this.selectedCase = caseIndex
            this.caseSelected.dispatch(caseIndex + 1)
        }
    }

    redraw(caseIndex: number, alphaAfter: number) {
        for (let i = 0; i < this.cases.length; i++) {
            this.cases[i].alpha = i <= caseIndex ? 1 : alphaAfter
        }
    }

    restart(count: number) {
        this.casesGroup.renderable = false
        this.casesGroup.x = - DecimalDonuts.CASE_PADDING * 20
        this.previewCase = null
        this.selectedCase = null
        for (let i = 0; i < this.cases.length; i++) {
            this.cases[i].parent = this.casesGroup
            this.cases[i].x = DecimalDonuts.EDGE_PADDING + (i % 10) * DecimalDonuts.DONUT_CASE
            this.cases[i].y = DecimalDonuts.DONUTS_SPAN_HEIGHT + DecimalDonuts.EDGE_PADDING + Math.floor(i / 10) * DecimalDonuts.DONUT_CASE
        }
        this.redraw(100, 1)
        let tensPlace = Math.floor(count / 10)
        this.onesGroup.y = DecimalDonuts.DONUTS_SPAN_HEIGHT + DecimalDonuts.EDGE_PADDING + DecimalDonuts.DONUT_CASE * (tensPlace + 1.5)
        for (let i = 0; i < 9; i++) {
            this.ones[i].text = String((tensPlace * 10 + i + 1))
            this.ones[i].visible = false
            this.tens[i].visible = false
        }

        this.game.add.tween(this.casesGroup).to({x : 0}, 800, Phaser.Easing.Bounce.Out, true)
        
    }

    donutsCased(casingDone: boolean, casedCount: number) {
       
        if (!casingDone) {
            let tensPlace = Math.floor(casedCount/ 10)
            let onesPlace = casedCount % 10
            if (onesPlace == 0) {
                this.tens[Math.floor(casedCount / 10) - 1].visible = true
            } else {
                this.ones[onesPlace - 1].visible = true
                this.moveCasesBelow(casedCount)
            }
        } else {
            for (let i = 1; (casedCount + i - 1) % 10 != 0; i++) {
                this.moveCasesBelow(casedCount - 10 + i)
            }

            this.game.add.tween(this.casesGroup).to({x : DecimalDonuts.DONUT_CASE * 20}, 800, Phaser.Easing.Linear.None, true, 500)
        }

    }

    moveCasesBelow(count) {
        let tensPlace = Math.floor(count/ 10)
        let onesPlace = count % 10
        for (let i = 1; i + tensPlace < 10; i++) {
            let donutCase = this.cases[(i + tensPlace) * 10 + onesPlace - 1]
            donutCase.parent = this.gameGroup
            this.game.add.tween(donutCase).to({y: donutCase.y + DecimalDonuts.DONUT_CASE}, 200, null, true)
        }
    }

}

class GenericGame {

    static HEIGHT = 1350
    static WIDTH = 1000
    static HUD_HEIGHT = 0
    static TIMER_STYLE: Phaser.PhaserTextStyle = { font: "50px Arial" }
    static TITLE_STYLE: Phaser.PhaserTextStyle = { font: "80px Arial" }
    static STAR_SIZE = 70

    game: Phaser.Game
    window: ScaledWindow
    // title: Phaser.Text
    // timer: Phaser.Text
    stars: Phaser.Sprite[] = []
    decimalDonuts: DecimalDonuts

    elapsed: number

    constructor(width: number, height: number) {
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
        })
        this.decimalDonuts = new DecimalDonuts(this.game)

    }

    preload() {
        this.game.load.image("star", "assets/starGold.png")
        this.decimalDonuts.preload()
        
    }

    create() {
        this.game.stage.backgroundColor = "#3f7cb6"
        this.game.time.advancedTiming = true
        this.game.time.desiredFps = 100

        this.window = new ScaledWindow(this.game, GenericGame.WIDTH, GenericGame.HEIGHT)
        this.window.create()

        let gameGroup = this.game.add.group(this.window.window)
        gameGroup.y = GenericGame.HUD_HEIGHT

        this.decimalDonuts.create(gameGroup)
    }

    update() {
        this.decimalDonuts.update()
        this.elapsed += this.game.time.elapsedMS

        document.querySelector("#debug_info").innerHTML = "FPS:" + this.game.time.fps

    }

    render() {
        this.decimalDonuts.render()
    }
}

class ScaledWindow {
    game: Phaser.Game
    window: Phaser.Group
    width: number
    height: number

    constructor(game: Phaser.Game, width: number, height: number) {
        let originalWidth = game.width
        let originalHeight = game.height

        this.game = game
        this.width = width
        this.height = height
        this.window = this.game.add.group()
        let ppux = originalWidth / width
        let ppuy = originalHeight / height
        let ppu = Math.min(ppux, ppuy)

        window["ppu"] = ppu

        this.window.x = ppux > ppu ? originalWidth / 2 - ppu * width / 2 : 0
        this.window.y = ppuy > ppu ? originalHeight / 2 - ppu * height / 2 : 0
        this.window.scale.setTo(ppu, ppu)

        console.log("Pixels Per Unit", ppu)
        console.log("Fitting:", ppux > ppuy ? "Vertical" : "Horizontal")
    }

    create() {
        if (this.game.config.enableDebug || true) {
            let graphics = this.game.add.graphics(0, 0, this.window)
            for (let i = 0; i <= this.width; i += 10) {
                let width = 1 + (i % 50 == 0 ? 2 : 0) + (i % 100 == 0 ? 1 : 0)
                graphics.lineStyle(width, 0x404040, 0.1)
                graphics.moveTo(i, 0)
                graphics.lineTo(i, this.height)
            }
            for (let j = 0; j <= this.height; j += 10) {
                let width = 1 + (j % 50 == 0 ? 2 : 0) + (j % 100 == 0 ? 1 : 0)
                graphics.lineStyle(width, 0x404040, 0.1)
                graphics.moveTo(0, j)
                graphics.lineTo(this.width, j)
            }
        }
    }
}

window.onload = () => {
    var game
    if (detectMobile()) {
        game = new GenericGame(window.innerWidth, window.innerHeight * 0.93) 
    } else {
        game = new GenericGame(window.innerWidth, window.innerHeight * 0.93)
    }
}

function detectMobile() {
    let ua = navigator.userAgent
    if (ua.match(/Android/i)
        || ua.match(/webOS/i)
        || ua.match(/iPhone/i)
        || ua.match(/iPod/i)) {
            return true
    } else {
        return false
    }
}

function toggleFullScreen() {
    var doc: any = window.document;
    var docEl = doc.documentElement;
  
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  
    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    }
    else {
      cancelFullScreen.call(doc);
    }
  }