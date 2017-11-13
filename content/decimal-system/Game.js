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
        this.centerRootGroup();
        this.initHud();
        this.initDonutHands();
        this.initNumber();
        this.initDonutCases();
        this.initGarbage();
    };
    Game.prototype.initNumber = function () {
        this.number = this.game.add.group(this.root, "number_garbage");
        this.number.y = this.donuts_hands.y + DonutLayout.donuts_hands;
    };
    Game.prototype.initDonutCases = function () {
        var _this = this;
        var donut_scale = DonutLayout.donut / this.game.cache.getFrameByName("donuts", "donut_1").width;
        this.donuts_cases = this.game.add.group(this.root, "donuts_cases");
        this.donuts_cases.y = this.number.y + DonutLayout.number_garbage;
        this.donuts_cases.x = DonutLayout.donut_cases_padding;
        var _loop_1 = function (index) {
            var x = (index % 10) * DonutLayout.block;
            var y = Math.floor(index / 10) * DonutLayout.block;
            this_1.cases[index] = this_1.game.add.group(this_1.donuts_cases);
            this_1.cases[index].x = x;
            this_1.cases[index].y = y;
            var graphics = this_1.game.add.graphics(0, 0, this_1.cases[index]);
            graphics.lineStyle(3, 0x404040, 1);
            graphics.drawRect(0, 0, DonutLayout.block, DonutLayout.block);
            //let text = this.game.add.text(x + this.donut_block / 2, y + this.donut_block / 2, String(index + 1), style, this.donut_holders[index])
            //text.anchor.setTo(0.5, 0.5)
            var donut_holder = this_1.cases[index].create(DonutLayout.block / 2, DonutLayout.block / 2, "donuts", "donut_black");
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
        var this_1 = this;
        for (var index = 0; index < 100; index++) {
            _loop_1(index);
        }
    };
    Game.prototype.initGarbage = function () {
        var garbage_scale = DonutLayout.number_garbage / (this.game.cache.getFrameByName("donuts", "recycle_bin").height + 10);
        this.garbage = this.game.add.sprite(DonutLayout.block * 10, 0, "donuts", "recycle_bin", this.donuts_cases);
        this.garbage.anchor.setTo(0.5, 0);
        this.garbage.scale.setTo(garbage_scale, garbage_scale);
        this.garbage.alpha = 0;
    };
    Game.prototype.initDonutHands = function () {
        var _this = this;
        var donut_scale = DonutLayout.donut / this.game.cache.getFrameByName("donuts", "donut_1").width;
        this.donuts_hands = this.game.add.group(this.root, "donuts_hands");
        this.donuts_hands.y = DonutLayout.hud;
        this.donuts_hands.x = DonutLayout.donut_cases_padding;
        var _loop_2 = function (index) {
            var x = (index % 10 + this_2.game.rnd.realInRange(-0.5, 0.5)) * DonutLayout.block;
            var y = this_2.game.rnd.realInRange(0, DonutLayout.donuts_hands - DonutLayout.block);
            this_2.donuts[index] = this_2.game.add.spriteBatch(this_2.donuts_hands, "donut_" + (index + 1));
            this_2.donuts[index].position.x = x + DonutLayout.block / 2;
            this_2.donuts[index].position.y = y + DonutLayout.block / 2;
            this_2.rnd_donut().forEach(function (name, layer_index) {
                var layer = _this.donuts[index].create(0, 0, "donuts", name);
                layer.anchor.setTo(0.5, 0.5);
                layer.scale.setTo(donut_scale, donut_scale);
            });
        };
        var this_2 = this;
        for (var index = 0; index < 10; index++) {
            _loop_2(index);
        }
        this.initHands();
    };
    Game.prototype.initHands = function () {
        this.hands = this.game.add.group(this.donuts_hands, "hands");
        this.hands.alpha = 0.8;
        var hand_scale = DonutLayout.donuts_hands / this.game.cache.getFrameByName("donuts", "right_hand").width;
        this.right_hand = this.game.add.sprite(DonutLayout.donuts_hands, 0, "donuts", "right_hand", this.hands);
        this.right_hand.scale.setTo(hand_scale, hand_scale);
        this.left_hand = this.game.add.sprite(DonutLayout.donuts_hands / 2, 0, "donuts", "right_hand", this.hands);
        this.left_hand.anchor.setTo(0.5, 0);
        this.left_hand.scale.setTo(-hand_scale, hand_scale);
    };
    Game.prototype.initHud = function () {
        this.hud = this.game.add.group(this.root, "hud");
        this.hud.x = DonutLayout.donut_cases_padding;
        this.timer = this.game.add.text(0, 0, "1:30", null, this.hud);
        this.title = this.game.add.text(DonutLayout.block * 4, 0, "Decimal Donuts", null, this.hud);
    };
    Game.prototype.centerRootGroup = function () {
        var ppux = this.game.width / DonutLayout.width;
        var ppuy = this.game.height / DonutLayout.height;
        var ppu = Math.min(ppux, ppuy);
        this.root = this.game.add.group();
        this.root.x = ppux > ppuy ? this.game.width / 2 - ppu * DonutLayout.width / 2 : 0;
        this.root.y = ppuy > ppux ? this.game.height / 2 - ppu * DonutLayout.height / 2 : 0;
        this.root.scale.setTo(ppu, ppu);
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
            for (var i = 0; i < 10; i++) {
                _this.donuts[cased + i].x = DonutLayout.block * i + DonutLayout.block / 2;
                _this.donuts[cased + i].y = DonutLayout.block * hand_positions[i] + DonutLayout.block / 2;
            }
            _this.hands.y = _this.donuts_cases.y - _this.donuts_hands.y + _this.cases[0].y + Math.floor((cased) / 10) * DonutLayout.block;
            cased += 10;
            if (count - cased >= 10) {
                moveTen();
            }
        };
        moveTen();
    };
    return Game;
}());
window.onload = function () {
    var game = new Game(window.innerWidth, window.innerHeight);
};
