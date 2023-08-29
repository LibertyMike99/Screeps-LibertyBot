/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('console_utils');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    GCL: function() {
        console.log(`GCL: ${Game.gcl.level}, Progress: ${Game.gcl.progress.toFixed(0)}/${Game.gcl.progressTotal.toFixed(0)}`);
    },
  
    RCL: function(...rooms) {
        if (rooms.length) {
            for (let roomName of rooms) {
                let room = Game.rooms[roomName].controller;
                if (room.level == 8) {
                    console.log(`${roomName} RCL: ${room.level}`);
                    continue;
                }
                console.log(`${roomName} RCL: ${room.level}, Progress ${room.progress.toFixed(0)}/${room.progressTotal.toFixed(0)}`);
            }
        } else {
            for (let roomName in Game.rooms) {
                let room = Game.rooms[roomName].controller || undefined;
                if (room && room.level > 0 && room.my) {
                    if (room.level == 8) {
                        console.log(`${roomName} RCL: ${room.level}`);
                        continue;
                    }
                    console.log(`${roomName} RCL: ${room.level}, Progress ${room.progress.toFixed(0)}/${room.progressTotal.toFixed(0)}`);
                }
            }
            for (let roomName in Game.rooms) {
                let room = Game.rooms[roomName].controller || undefined;
                if (room && room.level > 0 && !room.my) {
                    if (room.level == 8) {
                        console.log(`${room.owner.username}'s ${roomName} RCL: ${room.level}`);
                        continue;
                    }
                    console.log(`${room.owner.username}'s ${roomName} RCL: ${room.level}, Progress ${room.progress.toFixed(0)}/${room.progressTotal.toFixed(0)}`);
                }
            }
        }
    },
    
    spawn: function(spawnName,role) {
        
        let spawn = Game.spawns[spawnName];
        
        if (!spawn) {
            console.log(`There is no spawn '${spawnName}'.`);
            return ERR_INVALID_ARGS;
        }
        if (spawn.spawning) {
            console.log('Spawn is spawning another creep.');
            return ERR_BUSY;
        }
        
        
    },

    send: function(resource, amount, fromRoom, toRoom) {
        if (amount == 'all') amount = Game.rooms[fromRoom].terminal.store[resource];
        let sendCost = amount / (amount + Game.market.calcTransactionCost(amount,fromRoom,toRoom));
        if (resource == RESOURCE_ENERGY) {
            amount = Math.floor(amount * sendCost);
        }
        console.log(Game.rooms[fromRoom].terminal.send(resource,amount,toRoom));
    }
      
};