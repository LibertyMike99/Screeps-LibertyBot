module.exports = {
    run: function(creep) {
        if (Game.flags[creep.memory.targetRoom] && 
            //creep.room.name == creep.memory.homeRoom &&
            !creep.pos.isEqualTo(Game.flags[creep.memory.targetRoom].pos)) {
            creep.moveTo(Game.flags[creep.memory.targetRoom].pos);
        }
        let enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS,3);
        if (enemies.length) {
            if (enemies.length > 1) {
                creep.rangedMassAttack();
            }
            else {
                creep.rangedAttack(enemies[0]);
            }
            creep.attack(creep.pos.findClosestByRange(enemies));
        }
    },
    
    spawnInfo: {
        'head': [MOVE],
        'torso': [RANGED_ATTACK],
        'tail': [ATTACK],
        'numberOfHeads': 4,
        'maxTorsos': 4,
        'numberOfTails': 4,
        'memory': {role:'guard'}
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};