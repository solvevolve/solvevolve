class DonutLayout {
}
DonutLayout.width = 900;
DonutLayout.height = 1300;
DonutLayout.hud = 100;
DonutLayout.donut = 65;
DonutLayout.block = DonutLayout.donut + 5;
DonutLayout.hands_width = DonutLayout.block * 5;
DonutLayout.number_height = DonutLayout.block * 2;
DonutLayout.donuts_height = DonutLayout.block * 5;
DonutLayout.donut_cases_padding = 50;
DonutLayout.hands_speed = 0.4;
class Game {
    constructor(width, height) {
        this.donuts = [];
        this.cases = [];
        this.selection_made = false;
        this.game = new Phaser.Game(width, height, Phaser.AUTO, "content", {
            preload: () => this.preload(),
            create: () => this.create(),
            update: () => this.update()
        });
    }
    preload() {
        this.game.load.atlasJSONHash("donuts", "assets/donuts.png", "assets/donuts.json");
        this.game.stage.backgroundColor = 0x3f7cb6;
    }
    create() {
        let ppux = this.game.width / DonutLayout.width;
        let ppuy = this.game.height / DonutLayout.height;
        let ppu = Math.min(ppux, ppuy);
        this.root = this.game.add.group();
        this.root.x = ppux > ppuy ? this.game.width / 2 - ppu * DonutLayout.width / 2 : 0;
        this.root.y = ppuy > ppux ? this.game.height / 2 - ppu * DonutLayout.height / 2 : 0;
        this.root.scale.setTo(ppu, ppu);
        let graphics = this.game.add.graphics(0, 0, this.root);
        graphics.lineStyle(10, 0xAA0000, 1);
        graphics.drawRect(0, 0, DonutLayout.width, DonutLayout.height);
        // graphics.lineStyle(5, 0xAA0000, 0.7)
        // graphics.drawRect(0, 0, DonutLayout.width, DonutLayout.hud)
        // graphics.lineStyle(5, 0x00AA00, 0.7)
        // graphics.drawRect(0, DonutLayout.hud, DonutLayout.width, DonutLayout.number_height)
        this.timer = this.game.add.text(DonutLayout.donut_cases_padding, 0, "1:30", null, this.root);
        this.title = this.game.add.text(DonutLayout.block * 4, 0, "Decimal Donuts", null, this.root);
        this.world = this.game.add.group(this.root);
        this.world.y = DonutLayout.hud;
        this.world.x = DonutLayout.donut_cases_padding;
        let donut_scale = DonutLayout.donut / this.game.cache.getFrameByName("donuts", "donut_1").width;
        for (let index = 0; index < 100; index++) {
            let x = (index % 10) * DonutLayout.block;
            let y = DonutLayout.number_height + DonutLayout.donuts_height + Math.floor(index / 10) * DonutLayout.block;
            this.cases[index] = this.game.add.group(this.world);
            this.cases[index].x = x;
            this.cases[index].y = y;
            let graphics = this.game.add.graphics(0, 0, this.cases[index]);
            graphics.lineStyle(3, 0x404040, 1);
            graphics.drawRect(0, 0, DonutLayout.block, DonutLayout.block);
            let donut_holder = this.cases[index].create(DonutLayout.block / 2, DonutLayout.block / 2, "donuts", "donut_black");
            donut_holder.anchor.setTo(0.5, 0.5);
            donut_holder.scale.setTo(donut_scale, donut_scale);
            donut_holder.alpha = 1;
            donut_holder.data.index = index;
            donut_holder.inputEnabled = true;
            donut_holder.events.onInputOver.add(() => {
                if (this.selection_made == false) {
                    this.case_selected = donut_holder.data.index;
                    this.previewCaseSelected(0.3);
                    console.log("Over ", donut_holder.data.index);
                }
            });
            donut_holder.events.onInputUp.add(() => {
                this.case_selected = donut_holder.data.index;
                this.selection_made = true;
                console.log("Up on ", donut_holder.data.index);
                this.previewCaseSelected(0);
                this.putDonutsInCase();
            });
        }
        let total = 39;
        for (let i = 0; i < total; i++) {
            let index = total - 1 - i;
            let x = (index % 10 + this.game.rnd.realInRange(-0.5, 0.3)) * DonutLayout.block;
            let y = DonutLayout.number_height + this.game.rnd.realInRange(0, DonutLayout.donuts_height - DonutLayout.block);
            this.donuts[index] = this.game.add.spriteBatch(this.world, "donut_" + (index + 1));
            this.donuts[index].position.x = x + DonutLayout.block / 2;
            this.donuts[index].position.y = y + DonutLayout.block / 2;
            this.rnd_donut().forEach((name, layer_index) => {
                let layer = this.donuts[index].create(0, 0, "donuts", name);
                layer.anchor.setTo(0.5, 0.5);
                layer.scale.setTo(donut_scale, donut_scale);
            });
        }
        this.hands = this.game.add.group(this.world, "hands");
        this.hands.y = DonutLayout.number_height;
        this.hands.alpha = 0.6;
        let hand_scale = DonutLayout.hands_width / this.game.cache.getFrameByName("donuts", "right_hand").width;
        let hand_height_scale = DonutLayout.donuts_height / this.game.cache.getFrameByName("donuts", "right_hand").height;
        this.right_hand = this.game.add.sprite(DonutLayout.hands_width, 0, "donuts", "right_hand", this.hands);
        this.right_hand.scale.setTo(hand_scale, hand_height_scale);
        this.left_hand = this.game.add.sprite(DonutLayout.hands_width / 2, 0, "donuts", "right_hand", this.hands);
        this.left_hand.anchor.setTo(0.5, 0);
        this.left_hand.scale.setTo(-hand_scale, hand_height_scale);
        this.right_hand_one = this.game.add.sprite(DonutLayout.hands_width, 0, "donuts", "right_hand_one", this.hands);
        this.right_hand_one.scale.setTo(hand_scale, hand_height_scale);
        this.right_hand_one.renderable = false;
        this.right_hand_one.anchor.setTo(0.2, 0);
        let garbage_scale = DonutLayout.hands_width / (this.game.cache.getFrameByName("donuts", "recycle_bin").height + 10);
        this.garbage = this.game.add.sprite(DonutLayout.block * 10, 0, "donuts", "recycle_bin", this.world);
        this.garbage.anchor.setTo(0.5, 0);
        this.garbage.scale.setTo(garbage_scale, garbage_scale);
        this.garbage.alpha = 0;
    }
    previewCaseSelected(alpha) {
        for (let i = 0; i < this.cases.length; i++) {
            if (i <= this.case_selected) {
                this.cases[i].alpha = 1;
            }
            else {
                this.cases[i].alpha = alpha;
            }
        }
    }
    update() {
    }
    rnd_donut() {
        return [
            this.game.rnd.pick(["donut_1", "donut_1", "donut_2", "donut_3"]),
            this.game.rnd.pick(["glazing_1", "glazing_2", "glazing_3", "glazing_4", "glazing_5", "glazing_6",
                "glazing_zigzag_1", "glazing_zigzag_2", "glazing_zigzag_3", "glazing_zigzag_4"]),
            this.game.rnd.pick(["sprinkles_1", "sprinkles_2", "sprinkles_3", "sprinkles_4", "sprinkles_5", "stripes_1", "stripes_2", "stripes_3"])
        ];
    }
    putDonutsInCase() {
        let total_donuts = this.donuts.length;
        let donuts_cased = 0;
        let caseTen = () => {
            if (total_donuts - donuts_cased >= 10) {
                this.animateCaseTen(donuts_cased).then(() => {
                    donuts_cased += 10;
                    caseTen();
                });
            }
            else {
                this.switchToRightOneHand();
                caseOne();
            }
        };
        let caseOne = () => {
            if (total_donuts - donuts_cased > 0) {
                this.animateCaseOne(donuts_cased).then(() => {
                    donuts_cased++;
                    caseOne();
                });
            }
            else {
                this.verifyCases();
            }
        };
        caseTen();
    }
    verifyCases() {
    }
    animateCaseTen(from) {
        return new Promise((resolve) => {
            let hand_positions = [1, 0, 0, 1, 2, 2, 1, 0, 0, 1];
            let y = this.cases[0].y + Math.floor(from / 10) * DonutLayout.block;
            let time = (y - this.hands.y) / DonutLayout.hands_speed;
            for (let i = 0; i < 10; i++) {
                this.world.bringToTop(this.donuts[from + i]);
                this.donuts[from + i].x = DonutLayout.block * i + DonutLayout.block / 2;
                this.donuts[from + i].y = DonutLayout.number_height + DonutLayout.block * hand_positions[i] + DonutLayout.block / 2;
                let time_to_sub = (DonutLayout.block * hand_positions[i]) / DonutLayout.hands_speed;
                this.game.add.tween(this.donuts[from + i]).to({ y: y + DonutLayout.block / 2 }, time - time_to_sub, null, true, 0, 0, false);
            }
            this.world.bringToTop(this.hands);
            let tween = this.game.add.tween(this.hands).to({ y: y }, time, null, true, 0, 0, false);
            tween.onComplete.add(() => {
                this.hands.y = DonutLayout.number_height;
                resolve();
            });
        });
    }
    animateCaseOne(from) {
        return new Promise((resolve) => {
            this.world.bringToTop(this.donuts[from]);
            this.world.bringToTop(this.hands);
            this.donuts[from].x = DonutLayout.block * (from % 10) + DonutLayout.block / 2;
            this.donuts[from].y = DonutLayout.number_height + DonutLayout.block / 2;
            let y = this.cases[0].y + Math.floor(from / 10) * DonutLayout.block;
            let time = (y - this.hands.y) / (DonutLayout.hands_speed * 1.5);
            let tween = this.game.add.tween(this.donuts[from]).to({ y: y + DonutLayout.block / 2 }, time, null, true, 0, 0, false);
            tween.onComplete.add(() => resolve());
            this.right_hand_one.x = this.donuts[from].x;
            this.hands.y = this.donuts[from].y;
            this.game.add.tween(this.hands).to({ y: y }, time, null, true, 0, 0, true);
        });
    }
    switchToRightOneHand() {
        this.right_hand.renderable = false;
        this.left_hand.renderable = false;
        this.right_hand_one.renderable = true;
    }
}
window.onload = () => {
    var game = new Game(window.innerWidth, window.innerHeight - 300);
};
