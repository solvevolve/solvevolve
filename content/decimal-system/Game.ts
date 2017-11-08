/// <reference path="../../typescript/phaser.d.ts" />


class Game {
    

    game: Phaser.Game
    donuts: Phaser.SpriteBatch[] = []
    donut_holders: Phaser.Group[] = []
    aspect_ratio = { width: 900, height: 1600 }

    donuts_center = { x: 450, y: 300 }
    donuts_radius = 150

    donut_size = 70
    donut_block = this.donut_size + 6

    constructor() {
        this.game = new Phaser.Game(this.aspect_ratio.width, this.aspect_ratio.height, Phaser.AUTO, "content", {
            preload: () => this.preload(),
            create: () => this.create(),
            update: () => this.update()
        })

    }

    preload() {
        this.game.load.atlasJSONArray("donuts", "assets/donuts_atlas.png", "assets/donuts_atlas.json")
        this.game.stage.backgroundColor = 0xB20059
    }

    create() {

        let donut_scale = this.donut_size / this.game.cache.getFrameByName("donuts", "donut_1").width

        let circle = new Phaser.Circle(this.donuts_center.x, this.donuts_center.y, 2 * this.donuts_radius)

        let rnd_point = new Phaser.Point()
        for (let index = 0; index < 55; index++) {
            circle.random(rnd_point)
            this.donuts[index] = this.game.add.spriteBatch(null, "donut_" + (index + 1))
            this.rnd_donut().forEach((name, layer_index) => {
                let layer: Phaser.Sprite = this.donuts[index].create(rnd_point.x, rnd_point.y, "donuts", name)
                layer.anchor.setTo(0.5, 0.5)
                layer.scale.setTo(donut_scale, donut_scale)
            });
        }

        let holder_group = this.game.add.group()
        holder_group.x = 70
        holder_group.y = 600


        for (let index = 0; index < 100; index++) {
            let x = (index % 10) * this.donut_block
            let y = Math.floor(index / 10) * this.donut_block


            this.donut_holders[index] = this.game.add.group(holder_group)

            let graphics = this.game.add.graphics(0, 0, holder_group)
            graphics.lineStyle(1, 0x585858, 0.6);
            graphics.drawRect(x, y, this.donut_block, this.donut_block)

            let style = { 
                font: "32px Arial", 
                fill: "black", 
                wordWrap: true, 
                wordWrapWidth: this.donut_block, 
                align: "center"
            };

            let text = this.game.add.text(x + this.donut_block / 2, y + this.donut_block / 2, String(index + 1), style, this.donut_holders[index] )
            text.anchor.setTo(0.5, 0.5)

            let donut_holder = this.donut_holders[index].create(x + this.donut_block / 2, y + this.donut_block / 2, "donuts", "donut_black")
            donut_holder.anchor.setTo(0.5, 0.5)
            donut_holder.scale.setTo(donut_scale, donut_scale)
            donut_holder.alpha = 0.3

        }


    }

    
    update(): any {
        
    }

    rnd_donut(): Array<string> {
        return [
            this.game.rnd.pick(["donut_1", "donut_1", "donut_2", "donut_3"]),
            this.game.rnd.pick(["glazing_1", "glazing_2", "glazing_3", "glazing_4", "glazing_5", "glazing_6",
                "glazing_zigzag_1", "glazing_zigzag_2", "glazing_zigzag_3", "glazing_zigzag_4"]),
            this.game.rnd.pick(["sprinkles_1", "sprinkles_2", "sprinkles_3", "sprinkles_4", "sprinkles_5", "stripes_1", "stripes_2", "stripes_3"])
        ]
    }

}

class Donut {
    base: Number
    glazing: Number
    glazing_zigzag: Number
    sprinkles: Number
    stripes: Number
}

window.onload = () => {
    var game = new Game()
}