module.exports = function() {
    
    StructureContainer.prototype.amount = function() {
        return this.store.getUsedCapacity(RESOURCE_ENERGY);
    }
    
};