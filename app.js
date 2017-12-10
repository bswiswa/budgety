// Budget controller
var budgetController = (function(){
    //need data model from expenses and income
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round(100*this.value/totalIncome);
        }
        else
            this.percentage = -1;
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
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
        },
        budget: 0,
        percentage: -1
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr, index, arr){
            sum += curr.value;
        });
        data.totals[type] = sum;
    }
    
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
        calculateBudget: function(){
            // calculate total income & expenses
            calculateTotal("exp");
            calculateTotal("inc");
            // calculate budget: incom - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate % of income spent
            if(data.totals.inc > 0)
            data.percentage = Math.round(100*data.totals.exp/data.totals.inc);
            else
                data.percentage = -1;
        },
        calculatePercentages: function(){
          data.allItems.exp.forEach(function(curr){
             curr.calcPercentage(data.totals.inc); 
          });  
        },
        getPercentages: function(){
          var allPerc = data.allItems.exp.map(function(curr){
              return curr.getPercentage();
          });
            return allPerc;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        deleteItem: function(type, id){
         var ids, index;
         ids = data.allItems[type].map(function(current, index, array){
              return current.id;
          });
        index = ids.indexOf(id);
        //-1 if item is not found
        if(index !== -1)
            data.allItems[type].splice(index,1);
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
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage"
        
    };
    return {
        getInput: function(){
            return {
                type : document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
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
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
           else{
               element = DOMstrings.expensesContainer;
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
            // replace placeholder text with actual data
           newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);
            
            // insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        deleteListItem: function(selectorID){
           var el = document.getElementById(selectorID); el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            
           if(obj.percentage > 0) document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +"%";
            else
             document.querySelector(DOMstrings.percentageLabel).textContent = "---"   
        },
        displayPercentages: function(percentages){
           var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            var nodeListForEach = function(list, callback){
                for(let i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            }
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + "%";
                else
                    current.textContent = "---";
            });
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
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        
        
    }
   
    
    var ctrlAddItem = function(){
        var input, newItem;
        //get input data
        input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // add value to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // add new item to UI
            UICtrl.addListItem(newItem, input.type);
            //clear fields
            UICtrl.clearFields();
            // calculate & update budget
            updateBudget();  
            //update percentages
            updatePercentages();
        }
       
    };
    
    var ctrlDeleteItem = function(e){
        var itemID, splitID, type, id;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            id = parseInt(splitID[1]);
            //delete from data
            budgetCtrl.deleteItem(type, id); 
            //delete from UI
            UICtrl.deleteListItem(itemID);
            //update budget
            updateBudget();
            //update %
            updatePercentages();
        }
    };
    
    var updateBudget = function(){
        // calculate budget
        budgetCtrl.calculateBudget();
        // return budget
        var budget = budgetCtrl.getBudget();
        // display the budget on the UI
        UICtrl.displayBudget(budget);
    };
   
    var updatePercentages = function(){
        //calculate %
        budgetCtrl.calculatePercentages();
        // read % from budgetController
        var percentages = budgetCtrl.getPercentages();
        //update UI
        UICtrl.displayPercentages(percentages);
    }
    
   
    return {
        init: function(){
            console.log("application has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    }
    
})(budgetController, UIController);

controller.init();