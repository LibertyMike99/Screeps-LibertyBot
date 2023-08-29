//var roleFiller = require('role.filler');

module.exports = {
    run: function(creep) {
        if (true) {
            roleBootStrapper.run(creep);
            return;
        }
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
            
            var yellowFlags = _.filter(Game.flags, function(f) {
                var flag = f;
                return flag.color == COLOR_YELLOW;
            });
            if (yellowFlags.length > 0) {
                creep.moveTo(yellowFlags[0].pos);
                if (creep.pos.isEqualTo(yellowFlags[0])) {
                    yellowFlags[0].remove();
                }
            }
            
            else {
                target = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                if (target != undefined) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    //console.log(creep.name + ' is repairing instead');
                    roleRepairer.run(creep);
                }
            }
            
        }
        //if creep is harvesting energy
        else {
            if (creep.room.storage) {
                let result = creep.withdraw(creep.room.storage,RESOURCE_ENERGY);
                switch (result) {
                    case ERR_NOT_IN_RANGE:
                        //move towards source
                        creep.moveTo(creep.room.storage);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.transit = true;
                        break;
                    
                }
            }
            else {
                let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    },
    
    spawnInfo: {
        'head': [],
        'torso': [WORK,CARRY,MOVE],
        'tail': [WORK,CARRY,MOVE],
        'maxEnergy': 1600,
        'memory': {role:'builder', transit:false}
    }
};