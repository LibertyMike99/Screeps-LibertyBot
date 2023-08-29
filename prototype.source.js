module.exports = function() {
    
    Object.defineProperty(Source.prototype, 'memory', {
        get: function() {
            /*
            if (!this.room.memory.sources) {
                this.room.memory.sources = {}
            }
            if (!this.room.memory.sources[this.id]) {
                this.room.memory.sources[this.id] = {}
            }
            return this.room.memory.sources[this.id];
            */
            if (!Memory.sources) {
                Memory.sources = {};
            }
            if (!Memory.sources[this.id]) {
                Memory.sources[this.id] = {};
            }
            return Memory.sources[this.id];
        },
        configurable: true
    });
    
    Object.defineProperty(Source.prototype, 'creeps', {
        get: function() {
                // If we dont have the value stored locally
            if (!(this._creeps)) {
                // If we dont have the value stored in memory
                if (!this.memory.creeps) {
                    //return empty array
                    this._creeps = [];
                    this.memory.creeps = [];
                }
                else {
                    //console.log(this._creeps);
                    this.memory.creeps = _.filter(this.memory.creeps,
                    (c) => Game.creeps[c] != undefined &&
                        this.id == Game.creeps[c].memory.source
                    );
                    // Get the creep objects from the names in memory and store them locally
                    this._creeps = this.memory.creeps.map(name => Game.creeps[name]);
                }
            }
            // return the locally stored value
            return this._creeps;
        },
        set: function(newValue) {
            // when storing in memory you will want to change the setter
            // to set the memory value as well as the local value
            newValue = [newValue]
            if (this.memory.creeps[0] && this.memory.creeps.includes(newValue.name)) {
                newValue.push(this.memory.creeps);
            }
            this.memory.creeps = newValue.map(creep => creep.name);
            this._creeps = newValue;
        },
        enumerable: false,
        configurable: true
    });
    
    

};