module.exports = {
    run: function(creep) {
        
        
        // if creep is in target room
        if (creep.room.name == creep.memory.targetRoom) {
            
            var source;
            // if creep has target source
            if (creep.memory.source) {
                // get source object
                source = Game.getObjectById(creep.memory.source);
            }
            // else creep has no target source
            else {
                // if the room is visible to the script
                if (Game.rooms[creep.memory.targetRoom] != undefined) {
                    // target source is first open source
                    source = Game.rooms[creep.memory.targetRoom].openSources[0];
                    // if there is a target source
                    if (source != undefined) {
                        // save source id in creep memory
                        creep.memory.source = source.id;
                        // save creep to source memory
                        source.creeps = creep;
                    }
                }
            }
            //find closest source
            //attempt to harvest energy; if source is not adjacent,
            if (creep.harvest(source) == ERR_NOT_IN_RANGE || true) {
                if (!source.memory.miningSpot) {
                    source.memory.miningSpot = creep.pos.findClosestByPath(
                        creep.room.lookAtArea(source.pos.y-1,source.pos.x-1,
                        source.pos.y+1,source.pos.x+1, true).filter((t)=>
                        t.type == 'terrain' && t.terrain != 'wall').map((p) =>
                        new RoomPosition(p.x,p.y,creep.room.name))
                    );
                }
                //move towards source
                //console.log(creep.name,source.id);
                creep.moveTo(source.memory.miningSpot.x,source.memory.miningSpot.y);
            }
        }
        // else creep is not in target room
        else {
            if (creep.memory.exitPath && creep.memory.exitPath[creep.room.name]) {
                
            }
            else {
                //var exit = creep.room.findExitTo(creep.memory.targetRoom);
                //creep.moveTo(creep.pos.findClosestByPath(exit));
                if (!Game.rooms[creep.memory.targetRoom]) {
                    roleScout.run(creep);
                    return;
                }
                creep.moveTo(Game.rooms[creep.memory.targetRoom].controller);
            }
        }
    },
    
    spawnInfo: {
            'head': [WORK],
            'torso': [],
            'tail': [MOVE],
            'memory': {role:'remote_miner'},
            'numberOfHeads': 5,
            'numberOfTails': 3
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};