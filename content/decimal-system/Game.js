/// <reference path="../../typescript/phaser.comments.d.ts" />
var DonutLayout = /** @class */ (function () {
    function DonutLayout() {
    }
    DonutLayout.width = 900;
    DonutLayout.height = 1500;
    DonutLayout.hud = 100;
    DonutLayout.donut = 66;
    DonutLayout.block = DonutLayout.donut + 10;
    DonutLayout.donuts_hands = DonutLayout.block * 5;
    DonutLayout.number_garbage = DonutLayout.block * 3;
    DonutLayout.donut_cases_padding = 50;
    DonutLayout.hands_speed = 0.8;
    return DonutLayout;
}());
var State;
(function (State) {
    State[State["WAITING_FOR_CASE"] = 0] = "WAITING_FOR_CASE";
    State[State["CASE_SELECTED"] = 1] = "CASE_SELECTED";
})(State || (State = {}));
var Game = /** @class */ (function () {
    function Game(width, height) {
        var _this = this;
        this.donuts = [];
        this.cases = [];
        this.selection_made = false;
        this.game = new Phaser.Game(width, height, Phaser.AUTO, "content", {
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
        var ppux = this.game.width / DonutLayout.width;
        var ppuy = this.game.height / DonutLayout.height;
        var ppu = Math.min(ppux, ppuy);
        this.root = this.game.add.group();
        this.root.x = ppux > ppuy ? this.game.width / 2 - ppu * DonutLayout.width / 2 : 0;
        this.root.y = ppuy > ppux ? this.game.height / 2 - ppu * DonutLayout.height / 2 : 0;
        this.root.scale.setTo(ppu, ppu);
        this.timer = this.game.add.text(DonutLayout.donut_cases_padding, 0, "1:30", null, this.root);
        this.title = this.game.add.text(DonutLayout.block * 4, 0, "Decimal Donuts", null, this.root);
        this.world = this.game.add.group(this.root);
        this.world.y = DonutLayout.hud;
        this.world.x = DonutLayout.donut_cases_padding;
        this.donut_group = this.game.add.group(this.world);
        var y_offset = 0;
        var donut_scale = DonutLayout.donut / this.game.cache.getFrameByName("donuts", "donut_1").width;
        var _loop_1 = function (index) {
            var x = (index % 10 + this_1.game.rnd.realInRange(-0.5, 0.5)) * DonutLayout.block;
            var y = y_offset + this_1.game.rnd.realInRange(0, DonutLayout.donuts_hands - DonutLayout.block);
            this_1.donuts[index] = this_1.game.add.spriteBatch(this_1.donut_group, "donut_" + (index + 1));
            this_1.donuts[index].position.x = x + DonutLayout.block / 2;
            this_1.donuts[index].position.y = y + DonutLayout.block / 2;
            this_1.rnd_donut().forEach(function (name, layer_index) {
                var layer = _this.donuts[index].create(0, 0, "donuts", name);
                layer.anchor.setTo(0.5, 0.5);
                layer.scale.setTo(donut_scale, donut_scale);
            });
        };
        var this_1 = this;
        for (var index = 0; index < 56; index++) {
            _loop_1(index);
        }
        this.hands = this.game.add.group(this.world, "hands");
        this.hands.y = y_offset;
        this.hands.alpha = 0.8;
        var hand_scale = DonutLayout.donuts_hands / this.game.cache.getFrameByName("donuts", "right_hand").width;
        this.right_hand = this.game.add.sprite(DonutLayout.donuts_hands, 0, "donuts", "right_hand", this.hands);
        this.right_hand.scale.setTo(hand_scale, hand_scale);
        this.left_hand = this.game.add.sprite(DonutLayout.donuts_hands / 2, 0, "donuts", "right_hand", this.hands);
        this.left_hand.anchor.setTo(0.5, 0);
        this.left_hand.scale.setTo(-hand_scale, hand_scale);
        y_offset += DonutLayout.donuts_hands;
        y_offset += DonutLayout.number_garbage;
        var _loop_2 = function (index) {
            var x = (index % 10) * DonutLayout.block;
            var y = y_offset + Math.floor(index / 10) * DonutLayout.block;
            this_2.cases[index] = this_2.game.add.group(this_2.world);
            this_2.cases[index].x = x;
            this_2.cases[index].y = y;
            var graphics = this_2.game.add.graphics(0, 0, this_2.cases[index]);
            graphics.lineStyle(3, 0x404040, 1);
            graphics.drawRect(0, 0, DonutLayout.block, DonutLayout.block);
            var donut_holder = this_2.cases[index].create(DonutLayout.block / 2, DonutLayout.block / 2, "donuts", "donut_black");
            donut_holder.anchor.setTo(0.5, 0.5);
            donut_holder.scale.setTo(donut_scale, donut_scale);
            donut_holder.alpha = 1;
            donut_holder.data.index = index;
            donut_holder.inputEnabled = true;
            donut_holder.events.onInputOver.add(function () {
                if (_this.selection_made == false) {
                    _this.case_selected = donut_holder.data.index;
                    _this.previewCaseSelected(0.3);
                    console.log("Over ", donut_holder.data.index);
                }
            });
            donut_holder.events.onInputUp.add(function () {
                _this.case_selected = donut_holder.data.index;
                _this.selection_made = true;
                console.log("Up on ", donut_holder.data.index);
                _this.previewCaseSelected(0);
                _this.caseDonuts();
            });
        };
        var this_2 = this;
        for (var index = 0; index < 100; index++) {
            _loop_2(index);
        }
        var garbage_scale = DonutLayout.number_garbage / (this.game.cache.getFrameByName("donuts", "recycle_bin").height + 10);
        this.garbage = this.game.add.sprite(DonutLayout.block * 10, 0, "donuts", "recycle_bin", this.world);
        this.garbage.anchor.setTo(0.5, 0);
        this.garbage.scale.setTo(garbage_scale, garbage_scale);
        this.garbage.alpha = 0;
        this.world.bringToTop(this.donut_group);
        this.world.bringToTop(this.hands);
    };
    Game.prototype.initDonutCases = function () {
    };
    Game.prototype.previewCaseSelected = function (alpha) {
        for (var i = 0; i < this.cases.length; i++) {
            if (i <= this.case_selected) {
                this.cases[i].alpha = 1;
            }
            else {
                this.cases[i].alpha = alpha;
            }
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
    Game.prototype.caseDonuts = function () {
        var _this = this;
        var count = this.donuts.length;
        var cased = 0;
        var hand_positions = [1, 0, 0, 1, 2, 2, 1, 0, 0, 1];
        var moveTen = function () {
            var y = _this.cases[0].y + Math.floor((cased) / 10) * DonutLayout.block;
            var time = (y - _this.hands.y) / DonutLayout.hands_speed;
            console.log("Moving");
            for (var i = 0; i < 10; i++) {
                _this.donuts[cased + i].x = DonutLayout.block * i + DonutLayout.block / 2;
                _this.donuts[cased + i].y = DonutLayout.block * hand_positions[i] + DonutLayout.block / 2;
                _this.donut_group.bringToTop(_this.donuts[cased + i]);
                var time_to_sub = (DonutLayout.block * hand_positions[i]) / DonutLayout.hands_speed;
                _this.game.add.tween(_this.donuts[cased + i]).to({ y: y + DonutLayout.block / 2 }, time - time_to_sub, null, true, 0, 0, false);
            }
            var tween = _this.game.add.tween(_this.hands).to({ y: y }, time, null, true, 0, 0, true);
            tween.start();
            cased += 10;
            if (count - cased >= 10) {
                tween.onComplete.add(function () {
                    moveTen();
                });
            }
        };
        moveTen();
    };
    return Game;
}());
window.onload = function () {
    var game = new Game(window.innerWidth, window.innerHeight);
};
