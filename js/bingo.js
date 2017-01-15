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
        $(this).trigger("change");
    };

    this.selected = function(){
        this.set("selected", true);
    };
};


var BingoCollection = function(player){
    var el = $(player);
    this.models = [];
//public init()
// 초기화 함수
    this.init = function(){
        var numbers = [];
        var self = this;

        for (var i=1;i<=25;i++){
            numbers.push(i);
        }
        numbers = getRandomSet(numbers);

        for(var i=0, length=numbers.length;i<length;i++){
            this.models.push(new BingoModel(numbers[i]));
            $(this.models[i]).on("change", function() {
                $(self).trigger("update");
            });
        }
    };

    var getRandomSet = function(numberSet){
        numberSet.sort(function(a,b){
            var temp =  Math.random()>0.5? 1:-1;
            return (temp);
        });
        return numberSet;
    };
};

var BingoView = function(player){
    var el = $(player);
    var collection = null;

    this.init = function(){
        collection = new BingoCollection(el);
        collection.init();
        this.render();

        el.find("td").on("click", onClick);

        $(collection).on("update", this.render);
    };

    var onClick = function(event){
        var model_id = $(this).attr("model");
        collection.models[model_id].select();
    };

    this.render = function(){
        el.find("td").each(function(i) {
            $(this).attr("model", i).text(collection.models[i].get("number"));
            if(collection.models[i].get("selected")){
                $(this).addClass("selected");
            }
            else{
                $(this).removeClass("selected");
            }
        });
    };
};

$(function() {
    var player1 = new BingoView("#player1");
    player1.init();
    var player2 = new BingoView("#player2");
    player2.init();
});