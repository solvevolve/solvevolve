/// <reference path="../../typescript/phaser.comments.d.ts" />

class Crow {


    static CROW_EMPTY_SPEED = 1

    private core: CrowMainGame
    private game: Phaser.Game
    private group: Phaser.Group

    private rocksVolNeeded: number
    private rocksVol: number

    private pot: Phaser.Sprite
    private crowGroup: Phaser.Group
    private crow: Phaser.Sprite
    private oneRock: Phaser.Sprite
    private tenRock: Phaser.Sprite

    private animating: boolean = false

    private potBroken: Phaser.Sprite
    private potWater: Phaser.Graphics
    private potRocks: Phaser.Graphics
    private rocksNeededText: Phaser.BitmapText
    
    private currentRound:number

    private correct: Phaser.Sound
    private wrong: Phaser.Sound
    private congrats: Phaser.Sound
    

    constructor(core: CrowMainGame) {
        this.core = core
        this.game = window["game"]
    }

    preload() {
        this.game.load.atlasJSONHash("main", "assets/crow.png", "assets/crow.json")
        this.game.load.spritesheet("crow", "assets/crow_fly.png",Math.floor(983/4), Math.floor(1289/4))
        
        this.game.load.audio("correct", "assets/sound/correct.ogg", true)
        this.game.load.audio("wrong", "assets/sound/wrong.ogg", true)
        this.game.load.audio("congrats", "assets/sound/congratulations.ogg", true)
        this.game.load.audio("loop", "assets/sound/Farm Frolics.wav", true)
        
    }

    create(group: Phaser.Group) {
        
        this.correct = this.game.add.audio("correct", 0.6)
        this.wrong = this.game.add.audio("wrong", 0.6)
        
        this.congrats = this.game.add.audio("congrats", 0.6)
        
        let loop = this.game.add.audio("loop", 0.25)
        loop.play(null, null, 0.3, true)

        this.group = group
        let height = CrowMainGame.HEIGHT
        let width = CrowMainGame.WIDTH

        let backGround = this.placeImage("background", CrowMainGame.WIDTH / 2, CrowMainGame.HEIGHT / 2, CrowMainGame.WIDTH, CrowMainGame.HEIGHT)

        let rock1 = this.placeImage("rock", 175, 600, 350, 200)
        let rock2 = this.placeImage("rock", 900 - 175, 600, 350, 200)

        rock1.hitArea = new Phaser.Rectangle(-175, -300, 350, 700)
        rock2.hitArea = new Phaser.Rectangle(-175, -300, 350, 700)
        

        
        let sun = this.placeImage("sun", width/2, 200, 200, 200)

        
        
        this.pot = this.placeImage("pot", width / 2, height - 500, 400, 400)
        let potWaterSprite = this.placeImage("pot_filled", width / 2, height - 500, 400, 400) as Phaser.Sprite
        let potRocksSprite = this.placeImage("pot_rocks", width / 2, height - 500, 400, 400) as Phaser.Sprite

        this.potBroken = this.placeImage("pot_broken", width / 2, height - 510, 400, 400)
        

        this.rocksNeededText = this.game.add.bitmapText(width / 2, height - 450, "numbers_200","",150, group)
        this.rocksNeededText.anchor.setTo(0.5, 0.5)


        this.potRocks = this.game.add.graphics(0, height, group)
        this.potWater = this.game.add.graphics(0, height, group)

        potWaterSprite.mask = this.potWater
        potRocksSprite.mask = this.potRocks


        this.positionOneRocks()
        this.positionTenRocks()

        let potHolder = this.placeImage("pot_holder", width / 2, height - 190, width * 0.8, 300)

        this.crowGroup = this.game.add.group(group)
        this.crowGroup.position.set(width/2, height/2 + 100)
        this.crow = this.game.add.sprite(0, 0, "crow", null, this.crowGroup)
        this.crow.anchor.setTo(0.5, 1)
        // this.crow.scale.setTo(0.25, 0.25)
    
        this.oneRock = this.placeImage("one_rock", 0, 0, 60, 60)
        this.oneRock.visible = false
        this.tenRock = this.placeImage("ten_rock", 0, 0, 135, 100)
        this.tenRock.visible = false


        
        this.crow.animations.add("fly", null)
        this.crow.animations.play("fly", 10,  true)

        this.enableInteractionForRock(rock1, this.crowGroup, this.oneRock, 1)
        this.enableInteractionForRock(rock2, this.crowGroup, this.tenRock, 10)

        
        

        this.restart()
    }

    enableInteractionForRock(rock: Phaser.Sprite, crowGroup: Phaser.Group, baseRock: Phaser.Sprite, rockVal: number) {
        rock.inputEnabled = true
        rock.events.onInputUp.add(() => {
            if (this.animating) return
            this.animating = true
            if (rockVal == 1) {
                this.crow.scale.set(-1,1)
            } else {
                this.crow.scale.set(1,1)
            }
            this.core.setTicking(false)
            this.game.add.tween(crowGroup).to({x: rock.x, y:rock.y - 100}, 500, null, true ).onComplete.add( () => {
                this.crow.animations.stop("fly", true)
                this.crow.animations.play("fly", 30,  true)
                crowGroup.addChild(baseRock)
                baseRock.visible = true
                this.game.add.tween(crowGroup).to({x: this.pot.x, y: this.pot.y - 200}, 1000, null, true).onComplete.add( () => {
                    
                    this.crow.animations.stop("fly")
                    this.crow.animations.play("fly", 10,  true)
                    this.game.add.tween(baseRock).to({ y: 80}, 300, null, true).onComplete.add( () => {
                        this.animating = false
                        baseRock.y = 0
                        baseRock.visible = false
                        this.incrRocksVolume(rockVal)
                    })
                })
            })
        })
    }

    incrRocksVolume(value: number) {
        
        this.rocksVol += value

        
        let fullSize = 278
        let waterHeight = fullSize * (100 - this.rocksVolNeeded) / 100

        this.potWater.clear()
        this.potRocks.clear()

        let rocksHeight = fullSize * (this.rocksVol) / 100
        



        if (this.rocksVol == this.rocksVolNeeded) {

            this.correct.play()

            this.rocksNeededText.text = ""

            this.potWater.beginFill(0xFFFFFF, 1)
            this.potWater.drawRect(0, -325 - fullSize - 100 , 1000, 100)
            this.potWater.endFill()
    
            this.core.incrScore(10)
            this.crow.scale.set(-1,1)
            
            this.game.add.tween(this.crowGroup).to({x: this.pot.x + 200, y: this.pot.y }, 100, null, true).onComplete.add( () => {
                window.setTimeout(() => {
                    this.restart()
                }, 1800)    
            })    
            

        
        } else if (this.rocksVol > this.rocksVolNeeded) {

            this.wrong.play()

            this.rocksNeededText.text = ""
            rocksHeight = fullSize
            waterHeight = 0
            this.potBroken.visible = true
            window.setTimeout(() => {
                this.restart()
            }, 800)
        }  else {
            this.rocksNeededText.text = String(this.rocksVolNeeded - this.rocksVol)
        }

        this.core.setTicking(true)

        this.potRocks.beginFill(0xFFFFFF, 1)
        this.potRocks.drawRect(0, -325 - rocksHeight, 1000, rocksHeight)
        this.potRocks.endFill()

        this.potWater.beginFill(0xFFFFFF, 1)
        this.potWater.drawRect(0, -325 - waterHeight - rocksHeight , 1000, waterHeight)
        this.potWater.endFill()
    }

    positionOneRocks() {


        let rockSize = 60
        let rockY = 530
        this.placeImage("one_rock", 100, rockY, rockSize, rockSize)
        this.placeImage("one_rock", 165, rockY, rockSize, rockSize)
        this.placeImage("one_rock", 230, rockY, rockSize, rockSize)

        this.placeImage("one_rock", 265 / 2, rockY + 5 - 1 * rockSize, rockSize, rockSize)
        this.placeImage("one_rock", 395 / 2, rockY + 5 - 1 * rockSize, rockSize, rockSize)

        this.placeImage("one_rock", 165, rockY + 10 - 2 * rockSize, rockSize, rockSize)



    }

    positionTenRocks() {

        let rockSizeX = 135
        let rockSizeY = 100
        let rockY = 510
        let xOff = 900 - 350 + 50
        this.placeImage("ten_rock", xOff + 0, rockY, rockSizeX, rockSizeY)
        this.placeImage("ten_rock", xOff + 125, rockY, rockSizeX, rockSizeY)
        this.placeImage("ten_rock", xOff + 250, rockY, rockSizeX, rockSizeY)

        this.placeImage("ten_rock", xOff + 125 / 2, rockY + 15 - 1 * rockSizeY, rockSizeX, rockSizeY)
        this.placeImage("ten_rock", xOff + 375 / 2, rockY + 15 - 1 * rockSizeY, rockSizeX, rockSizeY)

        this.placeImage("ten_rock", xOff + 125, rockY + 30 - 2 * rockSizeY, rockSizeX, rockSizeY)

    }

    update() {

    }

    render() {

    }

    levelOver() {
        this.currentRound = 0
        this.restart()
    }

    restart() {
        this.currentRound++
        if (this.currentRound == 10) {
            this.congrats.play()
            this.core.positionInPop()
        } else {
            
            this.animating = true
            this.rocksVolNeeded = this.game.rnd.integerInRange(10, 90)
            this.rocksVol = 0
            this.incrRocksVolume(0)        
            this.game.add.tween(this.crowGroup).to({x : CrowMainGame.WIDTH/2, y: CrowMainGame.HEIGHT/2}, 400, null, true).onComplete.add(
                () => {
                    this.animating = false
                    this.core.setTicking(true)
                }
            )
            
        }
        
        this.potBroken.visible = false
    }

    placeImage(name: string, x: number, y: number, width: number, height: number) {
        let size = this.game.cache.getFrameByName("main", name)
        let sprite = this.game.add.sprite(x, y, "main", name, this.group)
        sprite.anchor.setTo(0.5, 0.5)
        sprite.scale.setTo(width / size.width, height / size.height)
        return sprite
    }
}


class CrowMainGame {

    static HEIGHT = 1500
    static WIDTH = 900
    static HUD_HEIGHT = 150
    static PADDING = 20
    static STAR_SIZE = 70

    private game: Phaser.Game

    private crow: Crow
    private elapsed: number
    private maxScore = 100
    private score = 0
    private backgroundColor: string
    private root: Phaser.Group

    private fpsLabel: Phaser.BitmapText

    private timer: Phaser.BitmapText
    private title: Phaser.BitmapText
    private stars: Phaser.Sprite[] = []
    private starGroup: Phaser.Group

    private timeInSeconds: number
    private keepTicking: boolean

    private scoreMask: Phaser.Graphics

    private popup: Phaser.Group
    private replay: Phaser.Sprite

    constructor(width: number, height: number, backGroundColor: string) {
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
        })
        window["game"] = this.game
        this.crow = new Crow(this)
        this.backgroundColor = backGroundColor
    }

    preload() {
        this.game.load.bitmapFont("numbers_60", "assets/fonts/varela_60.png", "assets/fonts/varela_60.fnt")
        this.game.load.bitmapFont("numbers_100", "assets/fonts/varela_100.png", "assets/fonts/varela_100.fnt")
        this.game.load.bitmapFont("numbers_200", "assets/fonts/varela_200.png", "assets/fonts/varela_200.fnt")
        this.crow.preload()
    }

    create() {


        this.game.stage.backgroundColor = this.backgroundColor
        this.game.time.advancedTiming = true

        this.root = scaledWindow(this.game, CrowMainGame.WIDTH, CrowMainGame.HEIGHT)
        this.timer = this.game.add.bitmapText(0, 0, "numbers_60", "0:00", 60, this.root)
        this.title = this.game.add.bitmapText(0, 0, "numbers_60", "Thirsty Crow", 60, this.root)



        let starScale = CrowMainGame.STAR_SIZE / this.game.cache.getFrameByName("main", "starGold").height
        this.starGroup = this.game.add.group(this.root)

        this.scoreMask = this.game.add.graphics(0, 0, this.starGroup)
        for (let i = 0; i < 3; i++) {
            this.stars[i] = this.game.add.sprite(i * CrowMainGame.STAR_SIZE, 0, "main", "starEmpty", this.starGroup)
            this.stars[i].anchor.setTo(0, 0.5)
            this.stars[i].scale.setTo(starScale, starScale)
            let gold = this.game.add.sprite(0, 0, "main", "starGold", this.starGroup)
            gold.anchor.setTo(0, 0.5)
            gold.mask = this.scoreMask
            this.stars[i].addChild(gold)
        }



        let gameGroup = this.game.add.group(this.root)
        // gameGroup.y += CrowMainGame.HUD_HEIGHT
        this.crow.create(gameGroup)
        this.levelOver()

        this.popup = this.game.add.group(this.root)
        this.popup.y = CrowMainGame.HUD_HEIGHT * 2.5
        let popupImg = this.game.add.sprite(0, 0, "main", "popup", this.popup)
        popupImg.scale.setTo(2, 2.3)
        this.positionInHud()


        if (this.game.config.enableDebug) {
            this.fpsLabel = this.game.add.bitmapText(CrowMainGame.WIDTH / 2, CrowMainGame.HEIGHT * 0.9, "numbers_100", "FPS:", 100, this.root)
            this.fpsLabel.anchor.setTo(0.5, 1)
            this.game.time.advancedTiming = true
        }

        this.replay = this.game.add.sprite(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT * 2.5, "main", "replay", this.popup)
        this.replay.anchor.setTo(0.5, 0.5)
        this.replay.inputEnabled = true
        this.replay.events.onInputUp.add(() => {
            this.positionInHud()
            this.levelOver()
        })

    }

    positionInHud() {
        this.popup.visible = false
        this.root.addChild(this.timer)
        this.timer.position.set(CrowMainGame.PADDING, CrowMainGame.HUD_HEIGHT / 2)
        this.timer.anchor.setTo(0, 0.3)

        this.root.addChild(this.title)
        this.title.position.set(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT / 2)
        this.title.anchor.setTo(0.5, 0.45)


        this.root.addChild(this.starGroup)
        this.starGroup.x = CrowMainGame.WIDTH - CrowMainGame.STAR_SIZE * 3
        this.starGroup.y = CrowMainGame.HUD_HEIGHT / 2
    }

    positionInPop() {
        this.popup.visible = true
        this.popup.addChild(this.timer)
        this.timer.position.set(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT * 2)
        this.timer.anchor.setTo(0.5, 0.5)

        this.popup.addChild(this.title)
        this.title.position.set(CrowMainGame.WIDTH / 2, CrowMainGame.HUD_HEIGHT)
        this.title.anchor.setTo(0.5, 1)


        this.popup.addChild(this.starGroup)
        this.starGroup.x = CrowMainGame.WIDTH / 2 - CrowMainGame.STAR_SIZE * 1.5
        this.starGroup.y = CrowMainGame.HUD_HEIGHT * 1.25
    }

    update() {
        this.crow.update()
        if (this.keepTicking) {
            this.elapsed += this.game.time.elapsedMS

            if (this.elapsed > (this.timeInSeconds + 1) * 1000) {
                this.timeInSeconds = Math.floor(this.elapsed / 1000)
                this.updateTimerText()
            }
        }
    }

    updateTimerText() {
        let minutes = Math.floor(this.timeInSeconds / 60)
        let seconds = this.timeInSeconds % 60
        let secondsText = seconds < 10 ? "0" + seconds : seconds
        this.timer.text = minutes + ":" + secondsText
    }

    render() {
        this.crow.render()
        if (this.game.config.enableDebug) {
            this.fpsLabel.text = "FPS:" + this.game.time.fps
        }
    }

    incrScore(scoreToAdd: number) {
        this.score += scoreToAdd
        
        let scoreRatio = this.score / this.maxScore

        this.scoreMask.clear()
        this.scoreMask.beginFill(0xFFFFFF, 1)
        this.scoreMask.drawRect(0, -CrowMainGame.STAR_SIZE / 2, 3 * CrowMainGame.STAR_SIZE * scoreRatio, CrowMainGame.HUD_HEIGHT)
        this.scoreMask.endFill()
    }

    setTicking(ticking: boolean) {
        this.keepTicking = ticking
    }

    levelOver() {
        this.score = 0
        this.incrScore(0)
        this.elapsed = 0
        this.timeInSeconds = 0
        this.keepTicking = false
        this.updateTimerText()
        this.crow.levelOver()
    }
}

function scaledWindow(game: Phaser.Game, width: number, height: number) {
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


    if (game.config.enableDebug || window["params"]["grid"]) {
        let graphics = game.add.graphics(0, 0, group)
        for (let i = 0; i <= width; i += 10) {
            let lineWidth = 1 + (i % 50 == 0 ? 1 : 0) + (i % 100 == 0 ? 2 : 0)
            graphics.lineStyle(lineWidth, 0x404040, 0.3)
            graphics.moveTo(i, 0)
            graphics.lineTo(i, height)
        }
        for (let j = 0; j <= height; j += 10) {
            let lineWidth = 1 + (j % 50 == 0 ? 1 : 0) + (j % 100 == 0 ? 2 : 0)
            graphics.lineStyle(lineWidth, 0x404040, 0.3)
            graphics.moveTo(0, j)
            graphics.lineTo(width, j)
        }
    }
    return game.add.group(group)
}

window.onload = () => {

    let url = new URL(window.location.href);

    let params = {}
    params["debug"] = url.searchParams.get("debug") === "true"
    params["grid"] = url.searchParams.get("grid") === "true"

    window["params"] = params

    let backGround = "#FFF498"
    let game = new CrowMainGame(window.innerWidth, window.innerHeight, backGround)
}
