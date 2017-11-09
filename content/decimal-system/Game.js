/// <reference path="../../typescript/phaser.d.ts" />
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.donuts = [];
        this.donut_holders = [];
        this.aspect_ratio = { width: 900, height: 1600 };
        this.donuts_center = { x: 450, y: 180 };
        this.donuts_radius = 130;
        this.donut_size = 62;
        this.donut_block = this.donut_size + 8;
        this.game = new Phaser.Game(this.aspect_ratio.width, this.aspect_ratio.height, Phaser.AUTO, "content", {
            preload: function () { return _this.preload(); },
            create: function () { return _this.create(); },
            update: function () { return _this.update(); }
        });
    }
    Game.prototype.preload = function () {
        this.game.load.atlasJSONHash("donuts", "assets/donuts.png", "assets/donuts.json");
        this.game.stage.backgroundColor = 0x3f7cb6;
    };
    Game.prototype.create = function () {
        var _this = this;
        var holder_group = this.game.add.group();
        holder_group.x = 100;
        holder_group.y = 700;
        var style = {
            font: "32px Arial",
            fill: "black",
            wordWrap: true,
            wordWrapWidth: this.donut_block,
            align: "center"
        };
        var donut_scale = this.donut_size / this.game.cache.getFrameByName("donuts", "donut_1").width;
        var rect = new Phaser.Rectangle(holder_group.x, this.donut_block, this.donut_block * 9, 2 * this.donuts_radius);
        var circle = new Phaser.Circle(this.donuts_center.x, this.donuts_center.y, 2 * this.donuts_radius);
        var rnd_point = new Phaser.Point();
        var _loop_1 = function (index) {
            var x = holder_group.x + (index % 10) * this_1.donut_block + this_1.game.rnd.realInRange(-this_1.donut_block / 2, this_1.donut_block / 2);
            var y = this_1.donut_block + this_1.game.rnd.realInRange(0, 2 * this_1.donuts_radius);
            rect.random(rnd_point);
            this_1.donuts[index] = this_1.game.add.spriteBatch(null, "donut_" + (index + 1));
            this_1.rnd_donut().forEach(function (name, layer_index) {
                var layer = _this.donuts[index].create(x + _this.donut_block / 2, y + _this.donut_block / 2, "donuts", name);
                layer.anchor.setTo(0.5, 0.5);
                layer.scale.setTo(donut_scale, donut_scale);
            });
            //let text = this.game.add.text(x + this.donut_block / 2, y + this.donut_block / 2, String(index + 1), style, this.donut_holders[index])
            //text.anchor.setTo(0.5, 0.5)
        };
        var this_1 = this;
        for (var index = 0; index < 15; index++) {
            _loop_1(index);
        }
        for (var index = 0; index < 100; index++) {
            var x = (index % 10) * this.donut_block;
            var y = Math.floor(index / 10) * this.donut_block;
            this.donut_holders[index] = this.game.add.group(holder_group);
            // let graphics = this.game.add.graphics(0, 0, holder_group)
            // graphics.lineStyle(1, 0x585858, 0.6);
            // graphics.drawRect(x, y, this.donut_block, this.donut_block)
            //let text = this.game.add.text(x + this.donut_block / 2, y + this.donut_block / 2, String(index + 1), style, this.donut_holders[index])
            //text.anchor.setTo(0.5, 0.5)
            var donut_holder = this.donut_holders[index].create(x + this.donut_block / 2, y + this.donut_block / 2, "donuts", "donut_black");
            donut_holder.anchor.setTo(0.5, 0.5);
            donut_holder.scale.setTo(donut_scale, donut_scale);
            donut_holder.alpha = 1;
        }
        var hand_frame = this.game.cache.getFrameByName("donuts", "right_hand");
        var hand_scale = this.donut_block * 4 / hand_frame.width;
        this.hands = this.game.add.group();
        this.hands.alpha = 0.8;
        this.right_hand = this.game.add.sprite(this.donut_block * 5, 0, "donuts", "right_hand", this.hands);
        this.right_hand.anchor.setTo(0.5, 0);
        this.right_hand.scale.setTo(hand_scale, hand_scale);
        this.left_hand = this.game.add.sprite(0, 0, "donuts", "right_hand", this.hands);
        this.left_hand.anchor.setTo(0.5, 0);
        this.left_hand.scale.setTo(-hand_scale, hand_scale);
        this.hands.x = holder_group.x + this.donut_block * 2.5;
        this.hands.y = holder_group.y - this.right_hand.height;
    };
    Game.prototype.update = function () {
    };
    Game.prototype.rnd_donut = function () {
        return [
            this.game.rnd.pick(["donut_1", "donut_1", "donut_2", "donut_3"]),
            this.game.rnd.pick(["glazing_1", "glazing_2", "glazing_3", "glazing_4", "glazing_5", "glazing_6",
                "glazing_zigzag_1", "glazing_zigzag_2", "glazing_zigzag_3", "glazing_zigzag_4"]),
            this.game.rnd.pick(["sprinkles_1", "sprinkles_2", "sprinkles_3", "sprinkles_4", "sprinkles_5", "stripes_1", "stripes_2", "stripes_3"])
        ];
    };
    return Game;
}());
var Donut = /** @class */ (function () {
    function Donut() {
    }
    return Donut;
}());
window.onload = function () {
    var game = new Game();
};
