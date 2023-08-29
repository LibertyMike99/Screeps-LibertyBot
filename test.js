//Import dependencies here

module.exports = {
    run: function(creep) {
        let cpu = {};
        cpu.start = Game.cpu.getUsed();
        
        if (creep.memory.transit) {
            if (creep.isEmpty && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                creep.memory.transit = false;
            }
            let structures;
            if (this.cache && this.cache[creep.room]) {
                if (this.cache[creep.room].structures) {
                    structures = this.cache[creep.room].structures.filter(s =>
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            }
            if (!structures) {
                structures = creep.room.find(FIND_MY_STRUCTURES, {filter:
                    (s) => (s.structureType == STRUCTURE_SPAWN ||
                    s.structureType == STRUCTURE_EXTENSION) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });
                cpu.find_spawns_and_extensions = Game.cpu.getUsed();
            }
            
            if (!structures.length) {
                structures = creep.room.find(FIND_MY_STRUCTURES, {filter:
                    (s) => s.structureType == STRUCTURE_TOWER &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });
                cpu.find_towers = Game.cpu.getUsed();
            }
            
            if (!structures.length) {
                structures = creep.room.find(FIND_MY_STRUCTURES, {filter:
                    (s) => s.structureType == STRUCTURE_LAB &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });
                cpu.find_labs = Game.cpu.getUsed();
            }
            
            if (structures.length) {
                if (!this.cache) {
                    this.cache = {};
                }
                if (!this.cache[creep.room]) {
                    this.cache[creep.room] = {};
                }
                this.cache[creep.room].structures = structures;
                
                var structure = creep.pos.findClosestByPath(structures);
                cpu.find_closest = Game.cpu.getUsed();
                
                console.log('Error: ',structure.id,structure.structureType,creep.transfer(structure,RESOURCE_ENERGY));
                if (creep.transfer(structure,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                    cpu.transit_true_range = Game.cpu.getUsed();
                }
                else {
                    cpu.transit_true_xfer = Game.cpu.getUsed();
                }
            }
            
            
            
            else if (!structures.length || creep.isEmpty) {
                if (creep.isFull ||
                creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                      creep.moveTo(creep.pos.findClosestByPath(creep.room.find(FIND_FLAGS),{filter:
                          (f) => f.color == COLOR_BLUE
                        }));
                    cpu.idle = Game.cpu.getUsed(); 
                }
                else {
                    creep.memory.transit = false;
                    cpu.change_transit_false = Game.cpu.getUsed();
                }
            }
        }
        else {
            if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) == 0 ||
            creep.isFull) {
                if (!creep.isEmpty) {
                    creep.memory.transit = true;
                    cpu.change_transit_true = Game.cpu.getUsed();
                }
                else {
                    creep.moveTo(creep.pos.findClosestByPath(creep.room.find(FIND_FLAGS),{filter:
                        (f) => f.color == COLOR_BLUE
                    }));
                }
            }
            else if (creep.withdraw(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
                cpu.transit_false_range = Game.cpu.getUsed();
            }
            else {
                cpu.transit_false_xfer = Game.cpu.getUsed();
            }
        }
        let last = cpu.start;
        cpu.end = Game.cpu.getUsed();
        for (let data in cpu) {
            console.log(data, ': ', (cpu[data]-last));
            last = cpu[data];
        }
        console.log('Total: ', (cpu.end-cpu.start));
    
    },
    
    spawnInfo: {
        /*creep spawning instructions here
         *head is FIRST, least protected
         *torso fills in body
         *tail is LAST, most protected
         memory is the initial creep memory
         */
        'head': [CARRY],
        'torso': [],
        'tail': [MOVE],
        'numberOfHeads': 10,
        'numberOfTails': 5,
        'maxEnergy': Infinity,
        'maxTorsos': Infinity,
        'memory': {role: 'filler', transit: false}
    },
    
    cache: {
    
    }
};