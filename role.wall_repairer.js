//var roleRepairer = require('role.repairer');

module.exports = {
    run: function(creep) {
        //if creep is transporting energy to structure but has none left
        if (creep.memory.transit == true && creep.store.getUsedCapacity() == 0) {
            //switch state
            creep.memory.transit = false;
        }
        //if creep is harvesting but energy is full
        else if (creep.memory.transit == false && creep.store.getFreeCapacity() == 0) {
            //switch state
            creep.memory.transit = true;
        }
    
        //if creep is transitting energy to structure
        if (creep.memory.transit == true) {
            
            //find all structures that need repair
            /*var structures = _.filter(creep.room.find(FIND_STRUCTURES), function(s) {
                
                //if structure is a wall or rampart
                if (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_RAMPART) {
                    //return if it has damage
                    return s.hits < s.hitsMax;
                }
            });*/
            var structures = _.filter(Game.rooms.W37S8.lookForAtArea(
                LOOK_STRUCTURES,31,8,43,18,true).map((o) => o.structure),
                (s) => s.structureType == STRUCTURE_RAMPART && s.hits/s.hitsMax < .051 &&
                ['5ffb13fb9f63cd49fd2164ab','5ffb0dc0d39f2ea5b136733d','5ffb0ddc3904ca258952fea3',
                '5ffb6a03e65b9a86e8de2f8b','5ffb0da18708f257956b8df3','5ffb0db32ff2e54188c4b776',
                '5ffb0dbd05ceb2c187e12f2e','5ffb0d9b24b88ef90939bbec','5ffb0dc59b0eb0199ea99494'].includes(s.id));
                
            if (!structures.length) {
                var structures = _.filter(Game.rooms.W37S8.lookForAtArea(
                LOOK_STRUCTURES,31,8,43,18,true).map((o) => o.structure),
                (s) => s.structureType == STRUCTURE_RAMPART && s.hits/s.hitsMax < .051 &&
                ['5fcec7142b146cb4516a954f','5ff004d5e0f48210095d5036','5fd1c61970df75639013ce0c',
                '5ff00376758503365ea2fda9','5fd1ea896f9d889942864272','5ffbaf769b0eb071e4a9b8d7',
                '5ffb2afe9b0eb0d0d4a99b42','5fce4bbe2005b9b5b724cc9a'].includes(s.id));    
            }
            
            if (!structures.length) {
                //console.log('NO PRIORITY');
                structures = _.filter(Game.rooms.W37S8.lookForAtArea(
                    LOOK_STRUCTURES,31,8,43,18,true).map((o) => o.structure),
                    (s) => s.structureType == STRUCTURE_RAMPART && s.hits/s.hitsMax < .12)
            }
            else {
                //console.log("PRIORITY");
            }
            
            //find closest damaged structure in specified range
            var lower = 0;
            var targetStructures = [];
            for (var upper = 0; upper<=.11; upper += 0.00001) {
                targetStructures = _.filter(structures,
                (s) => s.hits/s.hitsMax > lower && s.hits/s.hitsMax <= upper);
                
                if (targetStructures[0] != undefined) {
                    break;
                }
                else {
                    lower = upper;
                }
            }
            var structure = creep.pos.findClosestByPath(targetStructures);
            
            //if there are damaged structures
            if (structure != undefined) {
                
                //attempt to repair structure
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    //move closer if not in range
                    creep.moveTo(structure);
                }
            }
            
                
            //otherwise upgrade controller
            else {
                console.log(creep.name + ' is repairing instead');
                roleRepairer.run(creep);
            }
        }
        
    
        //if creep is harvesting energy
        else {
            if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //move towards source
                creep.moveTo(creep.room.storage);
            }
        }
    },
    
    spawnInfo: {
        'head': [],
        'torso': [CARRY,WORK],
        'tail': [MOVE],
        'numberOfTails': 25,
        'memory': {role:'wall_repairer', transit:false}
    }
};