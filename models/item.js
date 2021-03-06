var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = Schema({
   name: {type: String, required: true, max: 255},
    quantity: {type: Number, required: true, max: 1000},
   price:{type:Number,required:true},
   sold:{type:Number},
   total:{
     type:Number
   }
  },{
    toObject:{
      virtuals:true
    },
    toJSON:{
      virtuals:true
    }
  });

// Virtual for item's full name
ItemSchema
.virtual('item_name')
.get(function () {
  return this.name + ', ' + this.quantity + ',' + this.price
});

// Virtual to update item quantity
ItemSchema
.virtual('quantityupdate')
.get(function(){
  return ((this.quantity-1));
});

ItemSchema
.virtual('currentqty')
.get(function(){
  return  (this.quantity);
})

ItemSchema
.virtual('currentsold')
.get(function(){
  return  (this.sold)
})

ItemSchema
.virtual('currentTotal')
.get(function () 
{ 
  return (this.total)
 })
// Virtual to update item total
ItemSchema
.virtual('totalupdate')
.get(function(){
  return((this.total + this.price));
});

ItemSchema
.virtual('currentprice')
.get(function(){
  return(this.price)
})
// Virtual to update item sold.
ItemSchema
.virtual('soldupdate')
.get(function(){
  return  (this.sold+1)
});


//Export model
module.exports = mongoose.model('Item', ItemSchema);