/// <reference path="../../typescript/phaser.d.ts" />
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.donuts = [];
        this.donut_holders = [];
        this.aspect_ratio = { width: 900, height: 1600 };
        this.donuts_center = { x: 450, y: 300 };
        this.donuts_radius = 150;
        this.donut_size = 70;
        this.donut_block = this.donut_size + 6;
        this.game = new Phaser.Game(this.aspect_ratio.width, this.aspect_ratio.height, Phaser.AUTO, "content", {
            preload: function () { return _this.preload(); },
            create: function () { return _this.create(); },
            update: function () { return _this.update(); }
        });
    }
    Game.prototype.preload = function () {
        this.game.load.atlasJSONArray("donuts", "assets/donuts_atlas.png", "assets/donuts_atlas.json");
        this.game.stage.backgroundColor = 0xB20059;
    };
    Game.prototype.create = function () {
        var _this = this;
        var donut_scale = this.donut_size / this.game.cache.getFrameByName("donuts", "donut_1").width;
        var circle = new Phaser.Circle(this.donuts_center.x, this.donuts_center.y, 2 * this.donuts_radius);
        var rnd_point = new Phaser.Point();
        var _loop_1 = function (index) {
            circle.random(rnd_point);
            this_1.donuts[index] = this_1.game.add.spriteBatch(null, "donut_" + (index + 1));
            this_1.rnd_donut().forEach(function (name, layer_index) {
                var layer = _this.donuts[index].create(rnd_point.x, rnd_point.y, "donuts", name);
                layer.anchor.setTo(0.5, 0.5);
                layer.scale.setTo(donut_scale, donut_scale);
            });
        };
        var this_1 = this;
        for (var index = 0; index < 55; index++) {
            _loop_1(index);
        }
        var holder_group = this.game.add.group();
        holder_group.x = 70;
        holder_group.y = 600;
        for (var index = 0; index < 100; index++) {
            var x = (index % 10) * this.donut_block;
            var y = Math.floor(index / 10) * this.donut_block;
            this.donut_holders[index] = this.game.add.group(holder_group);
            var graphics = this.game.add.graphics(0, 0, holder_group);
            graphics.lineStyle(1, 0x585858, 0.6);
            graphics.drawRect(x, y, this.donut_block, this.donut_block);
            var style = {
                font: "32px Arial",
                fill: "black",
                wordWrap: true,
                wordWrapWidth: this.donut_block,
                align: "center"
            };
            var text = this.game.add.text(x + this.donut_block / 2, y + this.donut_block / 2, String(index + 1), style, this.donut_holders[index]);
            text.anchor.setTo(0.5, 0.5);
            var donut_holder = this.donut_holders[index].create(x + this.donut_block / 2, y + this.donut_block / 2, "donuts", "donut_black");
            donut_holder.anchor.setTo(0.5, 0.5);
            donut_holder.scale.setTo(donut_scale, donut_scale);
            donut_holder.alpha = 0.3;
        }
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
