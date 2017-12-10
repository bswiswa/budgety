// Budget controller
var budgetController = (function(){
    //need data model from expenses and income
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
     var Income= function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };
    
    return{
        addItem: function(type, desc, val){
            var newItem, ID;
            if(data.allItems[type].length > 0)
            ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            else
                ID = 0;
            if(type === "inc"){
                newItem = new Income (ID, desc, val);
            }
            else{
                newItem = new Expense(ID, desc, val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;      
        },
        testing: function(){
            console.log(data);
        }
    }
     
})();

//UI controller
var UIController = (function(){
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list"
    };
    return {
        getInput: function(){
            return {
                type : document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: document.querySelector(DOMstrings.inputValue).value
            };      
        },
        getDOMstrings(){
            return DOMstrings;
        },
        addListItem: function(obj, type){
            // create HTML string with placeholder text
            var html, newHtml, element;
            if(type == "inc"){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
           else{
               element = DOMstrings.expensesContainer;
               html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
            // replace placeholder text with actual data
           newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);
            
            // insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        }
    }
})();

//App controller
var controller = (function(budgetCtrl, UICtrl){
    
    var setUpEventListeners = function(){
        
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    
        document.addEventListener("keypress", function(e){
       if(e.keyCode == 13 || event.which == 13){
           ctrlAddItem();
       }
    });
    }
   
    
    var ctrlAddItem = function(){
        var input, newItem;
        //get input data
        input = UICtrl.getInput();
        // add value to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // add new item to UI
        UICtrl.addListItem(newItem, input.type);
        //clear fields
        UICtrl.clearFields();
        // calculate budget
        
        // display budget  
    }
   
    return {
        init: function(){
            console.log("application has started");
            setUpEventListeners();
        }
    }
    
})(budgetController, UIController);

controller.init();