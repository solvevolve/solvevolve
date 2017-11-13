/// <reference path="../../typescript/phaser.comments.d.ts" />

class DonutLayout {
    static width = 900
    static height = 1500
    static hud = 100

    static donut = 66
    static block = DonutLayout.donut + 10
    static donuts_hands = DonutLayout.block * 5
    static number_garbage = DonutLayout.block * 3
    static donut_cases_padding = 50
}

enum State {
    WAITING_FOR_CASE,
    CASE_SELECTED,
}

class Game {


    game: Phaser.Game

    root: Phaser.Group
    hud: Phaser.Group
    donuts_hands: Phaser.Group
    number: Phaser.Group
    donuts_cases: Phaser.Group

    timer: Phaser.Text
    title: Phaser.Text
    stars: Phaser.Sprite[]

    donuts: Phaser.SpriteBatch[] = []
    hands: Phaser.Group
    right_hand: Phaser.Sprite
    left_hand: Phaser.Sprite

    garbage: Phaser.Sprite

    cases: Phaser.Group[] = []

    case_selected: number
    selection_made = false

    constructor(width: number, height: number) {

        this.game = new Phaser.Game(width, height, Phaser.AUTO, "content", {
            preload: () => this.preload(),
            create: () => this.create(),
            update: () => this.update()
        })


    }

    preload() {
        this.game.load.atlasJSONHash("donuts", "assets/donuts.png", "assets/donuts.json")
        this.game.stage.backgroundColor = 0x3f7cb6
    }

    create() {
        this.centerRootGroup();
        this.initHud();
        this.initDonutHands();
        this.initNumber();
        this.initDonutCases();
        this.initGarbage();

    }


    private initNumber() {
        this.number = this.game.add.group(this.root, "number_garbage");
        this.number.y = this.donuts_hands.y + DonutLayout.donuts_hands;
    }

    private initDonutCases() { 
        let donut_scale = DonutLayout.donut / this.game.cache.getFrameByName("donuts", "donut_1").width
    


        this.donuts_cases = this.game.add.group(this.root, "donuts_cases");
        this.donuts_cases.y = this.number.y + DonutLayout.number_garbage;
        this.donuts_cases.x = DonutLayout.donut_cases_padding;
        for (let index = 0; index < 100; index++) {
            let x = (index % 10) * DonutLayout.block;
            let y = Math.floor(index / 10) * DonutLayout.block;
            this.cases[index] = this.game.add.group(this.donuts_cases);
            this.cases[index].x = x;
            this.cases[index].y = y;
            let graphics = this.game.add.graphics(0, 0, this.cases[index]);
            graphics.lineStyle(3, 0x404040, 1);
            graphics.drawRect(0, 0, DonutLayout.block, DonutLayout.block);
            //let text = this.game.add.text(x + this.donut_block / 2, y + this.donut_block / 2, String(index + 1), style, this.donut_holders[index])
            //text.anchor.setTo(0.5, 0.5)
            let donut_holder: Phaser.Sprite = this.cases[index].create(DonutLayout.block / 2, DonutLayout.block / 2, "donuts", "donut_black");
            donut_holder.anchor.setTo(0.5, 0.5);
            donut_holder.scale.setTo(donut_scale, donut_scale);
            donut_holder.alpha = 1;
            
            donut_holder.data.index = index

            donut_holder.inputEnabled = true
            donut_holder.events.onInputOver.add(() => {
                if (this.selection_made == false) {
                    this.case_selected = donut_holder.data.index
                    this.previewCaseSelected(0.3)
                    console.log("Over ", donut_holder.data.index)
                }
                
            })
            donut_holder.events.onInputUp.add(() => {
                this.case_selected = donut_holder.data.index
                this.selection_made = true
                console.log("Up on ", donut_holder.data.index)
                this.previewCaseSelected(0)
                this.caseDonuts()
            })
        }
    }

    private initGarbage() {
        let garbage_scale = DonutLayout.number_garbage / (this.game.cache.getFrameByName("donuts", "recycle_bin").height + 10);
        this.garbage = this.game.add.sprite(DonutLayout.block * 10, 0, "donuts", "recycle_bin", this.donuts_cases);
        this.garbage.anchor.setTo(0.5, 0);
        this.garbage.scale.setTo(garbage_scale, garbage_scale);
        this.garbage.alpha = 0;
    }

    private initDonutHands() {
        let donut_scale = DonutLayout.donut / this.game.cache.getFrameByName("donuts", "donut_1").width
        this.donuts_hands = this.game.add.group(this.root, "donuts_hands");
        this.donuts_hands.y = DonutLayout.hud;
        this.donuts_hands.x = DonutLayout.donut_cases_padding;
        for (let index = 0; index < 10; index++) {
            let x = (index % 10 + this.game.rnd.realInRange(-0.5, 0.5)) * DonutLayout.block;
            let y = this.game.rnd.realInRange(0, DonutLayout.donuts_hands - DonutLayout.block);
            this.donuts[index] = this.game.add.spriteBatch(this.donuts_hands, "donut_" + (index + 1));
            this.donuts[index].position.x = x + DonutLayout.block / 2;
            this.donuts[index].position.y = y + DonutLayout.block / 2;
            this.rnd_donut().forEach((name, layer_index) => {
                let layer: Phaser.Sprite = this.donuts[index].create(0, 0, "donuts", name);
                layer.anchor.setTo(0.5, 0.5);
                layer.scale.setTo(donut_scale, donut_scale);
            });
            
        }
        this.initHands();
    }

    private initHands() {
        this.hands = this.game.add.group(this.donuts_hands, "hands");
        this.hands.alpha = 0.8;
        let hand_scale = DonutLayout.donuts_hands / this.game.cache.getFrameByName("donuts", "right_hand").width;
        this.right_hand = this.game.add.sprite(DonutLayout.donuts_hands, 0, "donuts", "right_hand", this.hands);
        this.right_hand.scale.setTo(hand_scale, hand_scale);
        this.left_hand = this.game.add.sprite(DonutLayout.donuts_hands/2, 0, "donuts", "right_hand", this.hands);
        this.left_hand.anchor.setTo(0.5, 0);
        this.left_hand.scale.setTo(-hand_scale, hand_scale);
    }

    private initHud() {
        this.hud = this.game.add.group(this.root, "hud");
        this.hud.x = DonutLayout.donut_cases_padding;
        this.timer = this.game.add.text(0, 0, "1:30", null, this.hud);
        this.title = this.game.add.text(DonutLayout.block * 4, 0, "Decimal Donuts", null, this.hud);
    }

    private centerRootGroup() {
        let ppux = this.game.width / DonutLayout.width;
        let ppuy = this.game.height / DonutLayout.height;
        let ppu = Math.min(ppux, ppuy);
        this.root = this.game.add.group();
        this.root.x = ppux > ppuy ? this.game.width / 2 - ppu * DonutLayout.width / 2 : 0;
        this.root.y = ppuy > ppux ? this.game.height / 2 - ppu * DonutLayout.height / 2 : 0;
        this.root.scale.setTo(ppu, ppu);
    }

    private previewCaseSelected(alpha: number) {
        for(let i = 0; i < this.cases.length; i++) {
            if (i <= this.case_selected) {
                this.cases[i].alpha = 1
            } else {
                this.cases[i].alpha = alpha
            }
        }
    }

    update(): any {

    }

    private rnd_donut(): Array<string> {
        return [
            this.game.rnd.pick(["donut_1", "donut_1", "donut_2", "donut_3"]),
            this.game.rnd.pick(["glazing_1", "glazing_2", "glazing_3", "glazing_4", "glazing_5", "glazing_6",
                "glazing_zigzag_1", "glazing_zigzag_2", "glazing_zigzag_3", "glazing_zigzag_4"]),
            this.game.rnd.pick(["sprinkles_1", "sprinkles_2", "sprinkles_3", "sprinkles_4", "sprinkles_5", "stripes_1", "stripes_2", "stripes_3"])
        ]
    }

    private caseDonuts() {
        let count = this.donuts.length
        let cased = 0
        let hand_positions = [1, 0, 0, 1, 2, 2, 1, 0, 0, 1]
        let moveTen = () => {
            for(let i =0; i < 10; i++) {
                this.donuts[cased + i].x = DonutLayout.block * i + DonutLayout.block/2
                this.donuts[cased + i].y = DonutLayout.block * hand_positions[i] + DonutLayout.block/2
            }
            this.hands.y = this.donuts_cases.y - this.donuts_hands.y + this.cases[0].y + Math.floor((cased)/10) * DonutLayout.block      
            cased += 10
            if (count - cased >= 10) {
                moveTen()
            }

        }
        
        moveTen()
    }

}

window.onload = () => {

    var game = new Game(window.innerWidth, window.innerHeight)
}

