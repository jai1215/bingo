var BingoModel= function(number){
    var attributes = {
        number:number,
        selected: false
    };

    this.get = function(attr){
        if(attributes[attr]){
            return attributes[attr];
        }
        else{
            return null;
        }
    };

    this.set = function(attr, value){
        attributes[attr] = value;
        $(this).trigger("change", {number: this.get("number")});
    };

    this.selected = function(){
        if(!this.get("selected")){
            this.set("selected", true);
        }
    };
};


var BingoCollection = function(player){
    var el = $(player);
    this.models = [];
    var bingo_lines;
//public init()
// 초기화 함수
    this.init = function(){
        var numbers = [];
        var self = this;
        bingo_lines = 0;

        for (var i=1;i<=25;i++){
            numbers.push(i);
        }
        numbers = getRandomSet(numbers);

        for(var i=0, length=numbers.length;i<length;i++){
            this.models.push(new BingoModel(numbers[i]));
            $(this.models[i]).on("change", function(e, data) {
                var bingo = checkBingo.call(self);
                if(bingo_lines !== bingo){
                    bingo_lines = bingo;
                    console.log("Trigger bingo\n");
                    $(self).trigger("bingo", {bingo_lines:bingo});
                }
                $(self).trigger("update", data);
            });
        }
    };

    var checkBingo = function(){
        var bingo = 0;
        for (var i=0;i<5;i++) {
            if(this.models[i*5].get("selected")
                &&this.models[i*5+1].get("selected")
                &&this.models[i*5+2].get("selected")
                &&this.models[i*5+3].get("selected")
                &&this.models[i*5+4].get("selected")){
                bingo++;
            }
            if(this.models[0*5+i].get("selected")
                &&this.models[1*5+i].get("selected")
                &&this.models[2*5+i].get("selected")
                &&this.models[3*5+i].get("selected")
                &&this.models[4*5+i].get("selected")){
                bingo++;
            }
        }
        return bingo;

    };

    var getRandomSet = function(numberSet){
        numberSet.sort(function(a,b){
            var temp =  Math.random()>0.5? 1:-1;
            return (temp);
        });
        return numberSet;
    };

    this.sync = function(number){
        for(var i=0, length = this.models.length;i<length;i++) {
            if(this.models[i].get("number") == number){
                this.models[i].selected();
                return ;
            }
        }
    }
};

var BingoView = function(player){
    var el = $(player);
    var collection = null;
    var myturn = false;

    this.init = function(){
        collection = new BingoCollection(el);
        collection.init();
        this.render();

        el.find("td").on("click", onClick);

        $(collection).on("update bingo", this.render);
    };

    var onClick = function(event){
        if(myturn) {
            var model_id = $(this).attr("model");
            collection.models[model_id].selected();
        }
    };

    this.render = function(e, data){
        el.find("td").each(function(i) {
            $(this).attr("model", i).text(collection.models[i].get("number"));
            if(collection.models[i].get("selected")){
                $(this).addClass("selected");
            }
            else{
                $(this).removeClass("selected");
            }
        });
        if(e && e.type == "bingo"){
            if(data.bingo_lines >= 3) {
                el.find(".bingo_lines").text("Win!!");
                el.find("caption").css("color", "red");
            }
            else{
                el.find(".bingo_lines").text("(" + data.bingo_lines + " bingo)");
            }
        }
        else if(e && e.type == "update"){
            $(document).trigger("checked", data);
            myturn = false;
            el.css("border-color", "black");
        }
    };

    this.setTurn = function(){
        el.css("border-color", "red");
        myturn = true;
    };

    this.sync = function(number){
        collection.sync(number);
    };
};

$(function() {
    var player1 = new BingoView("#player1");
    player1.init();
    var player2 = new BingoView("#player2");
    player2.init();

    var turn = "player1";
    player1.setTurn();

    $(document).on("checked", function (e, data) {
        if (turn == "player1") {
            player2.sync(data.number);
            turn = "player2";
            player2.setTurn();
        }
        else if (turn == "player2") {
            player1.sync(data.number);
            turn = "player1";
            player1.setTurn();
        }
    });
});