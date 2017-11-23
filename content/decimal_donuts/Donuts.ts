/// <reference path="../../typescript/phaser.comments.d.ts" />
class Config {
    static DONUTS_SPAN_HEIGHT = 350
    static EDGE_PADDING = 20
    static DONUT_SIZE = 64
    static CASE_PADDING = 36
    static DONUT_CASE = Config.DONUT_SIZE + Config.CASE_PADDING

    static DONUT_MIN_SPEED = 50
    static DONUT_MAX_SPEED = 130
    static HANDS_SPEED = 0.9

    static CASES_OUT_RANGE = Config.DONUT_CASE * 20
    static CASES_IN_OUT_TIME = 800
    static CASES_DROP_TIME = 800

    static DONUTS_SPAN_TIME = 100
    static DONUTS_SPAN_GAP = 20

    static ROUNDS_PER_PLAY = 10
    static SCORE_PER_ROUND = 10
}

class DecimalDonuts {

    core: GenericGame
    game: Phaser.Game
    gameGroup: Phaser.Group

    actors: Actor[] = []

    donutPackaging = new DonutPackaging()
    donutFactory = new DonutFactory()
    workerHands = new WorkerHands(this.donutPackaging, this.donutFactory)

    constructor(core: GenericGame) {
        this.core = core
        this.actors.push(this.donutPackaging)
        this.actors.push(this.donutFactory)
        this.actors.push(this.workerHands)

        this.donutPackaging.roundOver.add(this.roundOver, this)
    }

    preload() {
        this.game = window["game"]
        this.game.load.atlasJSONHash("donuts", "assets/donuts.png", "assets/donuts.json")
        this.actors.map(actor => actor.preload(this.game))
    }

    create(gameGroup: Phaser.Group) {

        this.gameGroup = gameGroup
        this.gameGroup.x += Config.EDGE_PADDING
        this.gameGroup.y += Config.EDGE_PADDING

        this.actors.map(actor => actor.create(gameGroup))

        this.restart()
    }

    update() {
        this.actors.map(actor => actor.update())
    }

    render() {
        this.actors.map(actor => actor.render())
    }

    levelOver() {
        this.restart()
    }

    restart() {
        this.actors.map(actor => actor.restart())
    }

    roundOver(score: number) {
        this.core.incrScore(score)
        this.restart()
    }
}

class Actor {
    protected game: Phaser.Game
    preload(game: Phaser.Game) {
        this.game = game
    }
    create(group: Phaser.Group) { }
    update() { }
    render() { }
    restart() { }
    reload() { }
}

class DonutPackaging extends Actor {

    game: Phaser.Game

    casesInUse: Phaser.Group
    casesPool: Phaser.Group
    wasted: Phaser.Group

    cases: Phaser.Group[] = []

    startPacking = new Phaser.Signal()
    roundOver = new Phaser.Signal()

    selectedCase?: number
    previewCase?: number
    casedFilled?: number

    packedCount: number
    casesCount = 100

    checkPackaging() {
        if (this.packedCount == this.selectedCase + 1) {
            this.endRound(Config.SCORE_PER_ROUND)
        } else {
            if (this.packedCount < this.selectedCase + 1) {
                for (let i = this.packedCount; i <= this.selectedCase; i++) {
                    this.wasted.add(this.cases[i], true)
                }
            }
            this.game.add.tween(this.wasted).to({ y: Config.CASES_OUT_RANGE }, Config.CASES_DROP_TIME, Phaser.Easing.Exponential.In, true).onComplete.add(() => {
                this.endRound(0)
            })
        }
    }

    endRound(score: number) {
        this.game.add.tween(this.casesInUse).to({ x: Config.CASES_OUT_RANGE }, Config.CASES_IN_OUT_TIME, Phaser.Easing.Exponential.In, true)
            .onComplete.add(() => {
                this.roundOver.dispatch(score)
            })
    }

    packTen(donutsToPack: Phaser.Sprite[]) {
        donutsToPack.forEach((donut, index) => {
            this.placeDonut(donut, index)
        })
        this.packedCount += 10
    }

    packOne(donut: Phaser.Sprite) {
        this.placeDonut(donut, 0)
        this.packedCount += 1
    }

    placeDonut(donut: Phaser.Sprite, index: number) {

        if (this.packedCount + index > this.selectedCase) {
            this.wasted.add(donut)
            donut.x = this.cases[this.packedCount + index].x
            donut.y = this.cases[this.packedCount + index].y
        } else {
            this.cases[this.packedCount + index].add(donut)
            donut.x = 0
            donut.y = 0
        }
    }

    create(group: Phaser.Group) {
        this.game = window["game"]

        this.casesInUse = this.game.add.group(group)
        this.casesPool = this.game.add.group(group)
        this.wasted = this.game.add.group(group)
        this.casesPool.visible = false

        let donutScale = Config.DONUT_CASE  / this.game.cache.getFrameByName("donuts", "br1").width

        console.log("holder scale", donutScale)

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


        for (let i = 0; i < this.casesCount; i++) {
            this.cases[i] = this.game.add.group(this.casesPool)
            let isBlack = (Math.floor(i / 10) % 2) == (i % 2);
            let blackDonut: Phaser.Sprite = this.cases[i].create(0, 0, "donuts", "br" + (isBlack ? "1" : "2"))
            blackDonut.data.caseIndex = i
            blackDonut.anchor.setTo(0.5, 0.5)
            blackDonut.scale.setTo(donutScale, donutScale)
            blackDonut.inputEnabled = true

            blackDonut.events.onInputOver.add(hoverFunc)
            blackDonut.events.onInputUp.add(clickFunc)

        }

    }

    private hover(caseIndex: number) {
        if (this.selectedCase == null) {
            this.redraw(caseIndex, 0.3)
            this.previewCase = caseIndex
        }
    }

    private select(caseIndex: number) {
        if (this.selectedCase == null) {
            this.selectedCase = caseIndex
            for (let i = caseIndex + 1; i < this.cases.length; i++) {
                this.casesPool.add(this.cases[i])
            }
            this.startPacking.dispatch()
        }
    }

    private redraw(caseIndex: number, alphaAfter: number) {
        for (let i = 0; i < this.cases.length; i++) {
            this.cases[i].alpha = i <= caseIndex ? 1 : alphaAfter
        }
    }

    restart() {
        this.wasted.y = 0 
        this.packedCount = 0
        this.casesInUse.x = - Config.CASES_OUT_RANGE
        this.previewCase = null
        this.selectedCase = null
        for (let i = 0; i < this.cases.length; i++) {
            this.casesInUse.add(this.cases[i], true)
            this.cases[i].x = (i % 10) * Config.DONUT_CASE + Config.DONUT_CASE / 2
            this.cases[i].y = Config.DONUTS_SPAN_HEIGHT + Math.floor(i / 10) * Config.DONUT_CASE + Config.DONUT_CASE / 2
        }
        this.redraw(100, 1)
        this.game.add.tween(this.casesInUse).to({ x: 0 }, Config.CASES_IN_OUT_TIME, Phaser.Easing.Exponential.Out, true)
    }

}

class WorkerHands extends Actor {

    donutPackaging: DonutPackaging
    donutFactory: DonutFactory

    hands: Phaser.Group
    onesHand: Phaser.Group

    constructor(donutPackaging: DonutPackaging, donutFactory: DonutFactory) {
        super()
        this.donutPackaging = donutPackaging
        this.donutFactory = donutFactory
        this.donutPackaging.startPacking.add(this.startMoving, this)


    }


    create(group: Phaser.Group) {
        this.hands = this.game.add.group(group)
        this.onesHand = this.game.add.group(group)
        
        
        this.hands = this.game.add.group(group)
        
        let handScale = Config.DONUT_CASE * 5 / this.game.cache.getFrameByName("donuts", "right_hand").width;
        let handAlpha = 1
        let handYPos = Config.DONUT_CASE * 1.5

        let leftHand = this.game.add.sprite(0, -handYPos, "donuts", "left_hand", this.hands);
        leftHand.scale.setTo(handScale, handScale)
        leftHand.alpha = handAlpha


        let rightHand = this.game.add.sprite(Config.DONUT_CASE * 5, -handYPos, "donuts", "right_hand", this.hands)
        rightHand.scale.setTo(handScale, handScale)
        rightHand.alpha = handAlpha

        this.onesHand = this.game.add.group(group)
        let indexFiger = this.game.add.sprite(0, 0, "donuts", "right_hand_one", this.onesHand);
        indexFiger.anchor.setTo(0.3, 0.1)
        indexFiger.scale.setTo(handScale, handScale)
        indexFiger.alpha = handAlpha

        this.hands.visible = false
        this.onesHand.visible = false
        
    }

    startMoving() {
        this.hands.visible = true
        this.moveTen()
    }

    moveTen() {
        let donutsToPack = this.getNextDonutsBatch()
        if (donutsToPack.length == 10) {
            this.hands.y = 0
            donutsToPack.forEach((donut, index) => {
                this.donutFactory.prepare(donut)
                this.hands.add(donut, true, 0)
                donut.x = Config.DONUT_CASE * (index + 0.5)
                donut.y = 0
            })
            let y = this.getNextCasePos().y
            let time = y / Config.HANDS_SPEED
            this.game.add.tween(this.hands).to({ y: y }, time, null, true).onComplete.add(() => {
                this.donutPackaging.packTen(donutsToPack)
                this.moveTen()
            })
        } else {
            this.hands.visible = false
            this.onesHand.visible = true
            this.moveOne()
        }
    }

    moveOne() {
        let donutsToPack = this.getNextDonutsBatch()
        if (donutsToPack.length == 0) {
            this.onesHand.visible = false
            this.donutPackaging.checkPackaging()
        } else {
            let donut = donutsToPack[0]
            this.donutFactory.prepare(donut)

            this.onesHand.x = donut.x
            this.onesHand.y = donut.y
            this.onesHand.add(donut, true, 0)
            donut.x = 0
            donut.y = 0

            let x = this.getNextCasePos().x
            let y = this.getNextCasePos().y
            let time = (y - this.onesHand.y) / Config.HANDS_SPEED

            this.game.add.tween(this.onesHand).to({ x: x, y: y }, time, null, true).onComplete.add(() => {
                this.donutPackaging.packOne(donut)
                this.moveOne()
            })
        }
    }


    getNextDonutsBatch(): Phaser.Sprite[] {
        if (this.donutFactory.donutsInUse.length >= 10) {
            return this.donutFactory.donutsInUse.children.slice(-10) as (Phaser.Sprite[])
        } else {
            return this.donutFactory.donutsInUse.children.slice(-1) as (Phaser.Sprite[])
        }
    }

    getNextCasePos(): Phaser.Point {
        return this.donutPackaging.cases[this.donutPackaging.packedCount].position
    }

}

class DonutFactory extends Actor {


    donutsInUse: Phaser.Group
    donutBorder: Phaser.Group
    donutsPool: Phaser.Group

    donuts: Phaser.Sprite[] = []

    donutCount: number
    donutsNumber: Phaser.BitmapText


    private addBorder(x, y, width, height) {
        let border = this.game.add.sprite(x, y, null, null, this.donutBorder)
        this.game.physics.enable(border, Phaser.Physics.ARCADE)
        let body: Phaser.Physics.Arcade.Body = border.body
        body.immovable = true
        border.body.setSize(window["ppu"] * width, window["ppu"] * height)
        
    }

    private createBorders() {
        let thickness = 10
        this.addBorder(0, 0, Config.DONUT_CASE * 10, thickness)
        this.addBorder(0, 0, thickness, Config.DONUTS_SPAN_HEIGHT)
        this.addBorder(Config.DONUT_CASE * 10, 0, thickness, Config.DONUTS_SPAN_HEIGHT)
        this.addBorder(0, Config.DONUTS_SPAN_HEIGHT, Config.DONUT_CASE * 10, thickness)

        let graphics = this.game.add.graphics(0, 0, this.donutBorder)
        graphics.lineStyle(0, 0x000000, 1);
        graphics.beginFill(0xF65277, 1)
        graphics.drawRect(0, 0, Config.DONUT_CASE * 10, Config.DONUTS_SPAN_HEIGHT)
        graphics.endFill()
    }

    prepare(donut: Phaser.Sprite) {
        donut.body.velocity.setTo(0, 0)
        donut.body.angularVelocity = 0
        donut.body.angle = 0
        donut.angle = 0
    }

    preload(game: Phaser.Game) {
        super.preload(game)
        this.game.load.bitmapFont("numbers_240", "assets/fonts/KaoriGel_240.png", "assets/fonts/KaoriGel_240.fnt")
    }

    create(group: Phaser.Group) {
        this.donutBorder = this.game.add.group(group)
        this.donutsInUse = this.game.add.group(group)
        this.donutsPool = this.game.add.group(group)
        this.donutsPool.visible = false

        this.donutsNumber = this.game.add.bitmapText(Config.DONUT_CASE * 5, Config.DONUTS_SPAN_HEIGHT / 2, "numbers_240", "", 240, group)
        this.donutsNumber.anchor.setTo(0.5, 0.3)

        this.createBorders()

        let donutTextureSize = this.game.cache.getFrameByName("donuts", "base").width
        let donutScale = Config.DONUT_SIZE / donutTextureSize
        console.log("donut scale", donutScale)
        let bounce = new Phaser.Point(1, 1)
        let donutBodySize = donutTextureSize
        
        let y = (1 - window["ppu"]) * donutTextureSize/2
        let bodySize = new Phaser.Point(window["ppu"] * donutBodySize, y)

        for (let i = 0; i < 100; i++) {
            this.donuts[i] = this.generateDonut(this.donutsPool)
            this.donuts[i].scale.setTo(donutScale, donutScale);
            this.game.physics.enable(this.donuts[i], Phaser.Physics.ARCADE)
            let body: Phaser.Physics.Arcade.Body = this.donuts[i].body
            body.bounce = bounce
            body.setSize(bodySize.x, bodySize.x, bodySize.y, bodySize.y)

        }
        
    }

    restart() {
        let donutCount = this.game.rnd.integerInRange(1, 99)
        this.donutCount = donutCount
        this.donutsNumber.text = ""

        this.donuts.forEach(donut => {
            this.donutsPool.add(donut)
        })

        let tween: Phaser.Tween

        for (let i = 0; i < donutCount; i++) {

            let donut: Phaser.Sprite = this.donutsPool.getRandom()
            this.donutsInUse.add(donut, true)

            donut.x = this.game.rnd.realInRange(Config.DONUT_CASE, Config.DONUT_CASE * 9)
            donut.y = this.game.rnd.realInRange(Config.DONUT_CASE, Config.DONUTS_SPAN_HEIGHT - Config.DONUT_CASE)
            this.game.physics.enable(this.donuts[i], Phaser.Physics.ARCADE)
            let body: Phaser.Physics.Arcade.Body = donut.body
            body.angularVelocity = 100
            let angle = Phaser.Math.degToRad(this.game.rnd.angle())
            let speed = this.game.rnd.realInRange(Config.DONUT_MIN_SPEED, Config.DONUT_MAX_SPEED)
            body.velocity.setTo(speed * Math.cos(angle), speed * Math.sin(angle))

            donut.alpha = 0
            tween = this.game.add.tween(donut).to({ alpha: 1 }, Config.DONUTS_SPAN_TIME, Phaser.Easing.Exponential.Out, true, Config.DONUTS_SPAN_GAP * i)
        }
        this.donutsNumber.text = donutCount.toString()
    }

    update() {
        this.game.physics.arcade.collide(this.donutsInUse, this.donutBorder)
    }

    render() { 
        if (this.game.config.enableDebug) {
            this.donuts.forEach(donut => {
                this.game.debug.body(donut)
            })
            this.donutBorder.children.forEach(border => {
                this.game.debug.body(border as Phaser.Sprite)
            })
        }
    }

    private generateDonut(group: Phaser.Group): Phaser.Sprite {

        let stringToSprite = (imageName) => {
            let layer: Phaser.Sprite = group.create(0, 0, "donuts", imageName)
            layer.anchor.setTo(0.5, 0.5);
            return layer
        }

        
        let dnBuns = ["dn1", "dn2", "dn4", "dn4"]
        let dnCreams = ["dn1", "dn2", "dn4", "dn4"].map( e => e + "_cream")
        let dnEyes = ["dn1", "dn2", "dn4", "dn4"].map( e => e + "_eyes")
        let dnHands = ["dn1", "dn2", "dn4", "dn4"].map( e => e + "_hands")
        let dnTop = ["dn1", "dn2", "dn4", "dn4"].map( e => e + "_top")
        let dnToppings = ["dn1", "dn2", "dn4", "dn4"].map( e => e + "_toppings")


        let bases = ["donut_1", "donut_1", "donut_2", "donut_3"]
        let glazings = ["glazing_1", "glazing_2", "glazing_3", "glazing_4", "glazing_5", "glazing_6",
            "glazing_zigzag_1", "glazing_zigzag_2", "glazing_zigzag_3", "glazing_zigzag_4"]
        let sprinkles = ["sprinkles_1", "sprinkles_2", "sprinkles_3", "sprinkles_4", "sprinkles_5",
            "stripes_1", "stripes_2", "stripes_3"]

        let baseDonut: Phaser.Sprite = stringToSprite("base")
        baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnBuns)))
        // baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnCreams)))
        // baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnCreams)))
        // baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnEyes)))
        // baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnHands)))
        // baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnTop)))
        // baseDonut.addChild(stringToSprite(this.game.rnd.pick(dnToppings)))

        return baseDonut
    }



}



class GenericGame {

    static HEIGHT = 1460
    static WIDTH = 1000
    static HUD_HEIGHT = 100

    game: Phaser.Game

    decimalDonuts: DecimalDonuts
    elapsed: number
    score = 0
    backgroundColor: string

    timer: Phaser.BitmapText
    title: Phaser.BitmapText



    constructor(width: number, height: number, backGroundColor: string) {
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
        window["game"] = this.game
        this.decimalDonuts = new DecimalDonuts(this)
        this.backgroundColor = backGroundColor
    }

    preload() {
        this.decimalDonuts.preload()
    }

    create() {
        
        this.game.stage.backgroundColor = this.backgroundColor
        this.game.time.advancedTiming = true

        let gameGroup = ScaledGroup.create(this.game, GenericGame.WIDTH, GenericGame.HEIGHT)
        gameGroup.y += GenericGame.HUD_HEIGHT
        this.decimalDonuts.create(gameGroup)
    }

    update() {
        this.decimalDonuts.update()
        this.elapsed += this.game.time.elapsedMS
    }

    render() {
        this.decimalDonuts.render()
    }

    incrScore(scoreToAdd: number) {
        this.score += scoreToAdd
        console.log(this.score)
    }
}

class ScaledGroup {

    static create(game: Phaser.Game, width: number, height: number) {
        let ppux = game.width / width
        let ppuy = game.height / height
        let ppu = Math.min(ppux, ppuy)
        window["ppu"] = ppu
        console.log("Pixels Per Unit", ppu)
        console.log("Fitting:", ppux > ppuy ? "Vertical" : "Horizontal")


        let group = game.add.group()
        group.x = ppux > ppu ? game.width / 2 - ppu * width / 2 : 0
        group.y = ppuy > ppu ? game.height / 2 - ppu * height / 2 : 0
        group.scale.setTo(ppu, ppu)


        if (game.config.enableDebug ) {
            let graphics = game.add.graphics(0, 0, group)
            for (let i = 0; i <= width; i += 10) {
                let lineWidth = 1 + (i % 50 == 0 ? 2 : 0) + (i % 100 == 0 ? 1 : 0)
                graphics.lineStyle(lineWidth, 0x404040, 0.1)
                graphics.moveTo(i, 0)
                graphics.lineTo(i, height)
            }
            for (let j = 0; j <= height; j += 10) {
                let lineWidth = 1 + (j % 50 == 0 ? 2 : 0) + (j % 100 == 0 ? 1 : 0)
                graphics.lineStyle(lineWidth, 0x404040, 0.1)
                graphics.moveTo(0, j)
                graphics.lineTo(width, j)
            }
        }
        return game.add.group(group)
    }

}

window.onload = () => {
    var game = new GenericGame(window.innerWidth, window.innerHeight, "#FFF49B")
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

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
}