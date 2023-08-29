module.exports = function() {
    
    Object.defineProperty(StructureLink.prototype, 'memory', {
        get: function() {
            if (!this.room.memory.links) {
                
                this.room.memory.links = {
                    senders: {},
                    receivers: {},
                    requests: {}
                }
            }
            if (!this.room.memory.links.linkIds) {
                    this.room.memory.links.linkIds = this.room.find(FIND_MY_STRUCTURES, {filter : 
                        (s) => s.structureType == STRUCTURE_LINK}
                        ).map(structure => structure.id);
            }
            
            if(!this.room.memory.links.links) {
                this.room.memory.links.links = {};
            }
            if(!this.room.memory.links.links[this.id]) {
                this.room.memory.links.links[this.id] = {};
            }
            return this.room.memory.links.links[this.id];
            
        },
                
        configurable: true
    });
    
};