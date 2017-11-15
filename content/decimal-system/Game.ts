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
    
    static hands_speed = 0.8
}

enum State {
    WAITING_FOR_CASE,
    CASE_SELECTED,
}

class Game {


    game: Phaser.Game

    root: Phaser.Group
    world: Phaser.Group
    donut_group: Phaser.Group

    timer: Phaser.Text
    title: Phaser.Text
    stars: Phaser.Sprite[]

    donuts: Phaser.SpriteBatch[] = []
    hands: Phaser.Group
    right_hand: Phaser.Sprite
    left_hand: Phaser.Sprite
    right_one_hand: Phaser.Sprite

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

        let ppux = this.game.width / DonutLayout.width;
        let ppuy = this.game.height / DonutLayout.height;
        let ppu = Math.min(ppux, ppuy);
        this.root = this.game.add.group();
        this.root.x = ppux > ppuy ? this.game.width / 2 - ppu * DonutLayout.width / 2 : 0;
        this.root.y = ppuy > ppux ? this.game.height / 2 - ppu * DonutLayout.height / 2 : 0;
        this.root.scale.setTo(ppu, ppu);

        

        this.timer = this.game.add.text(DonutLayout.donut_cases_padding, 0, "1:30", null, this.root);
        this.title = this.game.add.text(DonutLayout.block * 4, 0, "Decimal Donuts", null, this.root);

        this.world = this.game.add.group(this.root)
        this.world.y = DonutLayout.hud
        this.world.x = DonutLayout.donut_cases_padding

        this.donut_group = this.game.add.group(this.world)

        let y_offset = 0

        let donut_scale = DonutLayout.donut / this.game.cache.getFrameByName("donuts", "donut_1").width
        
        for (let index = 0; index < 56; index++) {
            let x = (index % 10 + this.game.rnd.realInRange(-0.5, 0.5)) * DonutLayout.block;
            let y = y_offset + this.game.rnd.realInRange(0, DonutLayout.donuts_hands - DonutLayout.block);
            this.donuts[index] = this.game.add.spriteBatch(this.donut_group, "donut_" + (index + 1));
            this.donuts[index].position.x = x + DonutLayout.block / 2;
            this.donuts[index].position.y = y + DonutLayout.block / 2;
            this.rnd_donut().forEach((name, layer_index) => {
                let layer: Phaser.Sprite = this.donuts[index].create(0, 0, "donuts", name);
                layer.anchor.setTo(0.5, 0.5);
                layer.scale.setTo(donut_scale, donut_scale);
            });

        }




        this.hands = this.game.add.group(this.world, "hands");
        this.hands.y = y_offset
        this.hands.alpha = 0.8;

        let hand_scale = DonutLayout.donuts_hands / this.game.cache.getFrameByName("donuts", "right_hand").width;
        this.right_hand = this.game.add.sprite(DonutLayout.donuts_hands, 0, "donuts", "right_hand", this.hands);
        this.right_hand.scale.setTo(hand_scale, hand_scale);
        this.left_hand = this.game.add.sprite(DonutLayout.donuts_hands / 2, 0, "donuts", "right_hand", this.hands);
        this.left_hand.anchor.setTo(0.5, 0);
        this.left_hand.scale.setTo(-hand_scale, hand_scale);

        y_offset += DonutLayout.donuts_hands
        y_offset += DonutLayout.number_garbage

        for (let index = 0; index < 100; index++) {
            let x = (index % 10) * DonutLayout.block;
            let y = y_offset + Math.floor(index / 10) * DonutLayout.block;
            this.cases[index] = this.game.add.group(this.world);
            this.cases[index].x = x;
            this.cases[index].y = y;
            let graphics = this.game.add.graphics(0, 0, this.cases[index]);
            graphics.lineStyle(3, 0x404040, 1);
            graphics.drawRect(0, 0, DonutLayout.block, DonutLayout.block);
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

        let garbage_scale = DonutLayout.number_garbage / (this.game.cache.getFrameByName("donuts", "recycle_bin").height + 10);
        this.garbage = this.game.add.sprite(DonutLayout.block * 10, 0, "donuts", "recycle_bin", this.world);
        this.garbage.anchor.setTo(0.5, 0);
        this.garbage.scale.setTo(garbage_scale, garbage_scale);
        this.garbage.alpha = 0;

        this.world.bringToTop(this.donut_group)
        this.world.bringToTop(this.hands)
    }



    private initDonutCases() {
    }






    private previewCaseSelected(alpha: number) {
        for (let i = 0; i < this.cases.length; i++) {
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
            let y = this.cases[0].y + Math.floor((cased) / 10) * DonutLayout.block
            let time = (y - this.hands.y) /  DonutLayout.hands_speed
            console.log("Moving")
            for (let i = 0; i < 10; i++) {
                this.donuts[cased + i].x = DonutLayout.block * i + DonutLayout.block / 2
                this.donuts[cased + i].y = DonutLayout.block * hand_positions[i] + DonutLayout.block / 2
                this.donut_group.bringToTop(this.donuts[cased + i])
                let time_to_sub = (DonutLayout.block * hand_positions[i]) / DonutLayout.hands_speed     
                this.game.add.tween(this.donuts[cased + i]).to({y: y + DonutLayout.block / 2 }, time - time_to_sub, null, true, 0, 0, false)    
            }
            
            let tween = this.game.add.tween(this.hands).to({y: y }, time, null, true, 0, 0, true)
            tween.start()
            cased += 10
            if (count - cased >= 10) {
                tween.onComplete.add(() => {
                    moveTen()
                })
                
            }

        }

        moveTen()
    }

}

window.onload = () => {

    var game = new Game(window.innerWidth, window.innerHeight)
}

