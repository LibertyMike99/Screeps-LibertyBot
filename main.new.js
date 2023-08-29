require('prototype.spawn')();
require('prototype.creep')();
require('prototype.room')();
require('prototype.source')();
require('prototype.link')();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleDefender = require('role.defender');
var roleWallRepairer = require('role.wall_repairer');
var roleLongDistanceHarvester = require('role.long_distance_harvester');
var roleClaimer = require('role.claimer');
var roleReserver = require('role.reserver');
var roleFiller = require('role.filler');
var roleSorter = require('role.sorter');
var roleHarvesterOld = require('role.harvester.old');
var roleLongDistanceHauler = require('role.long_distance_hauler');
var roleRemoteMiner = require('role.remote_miner');
var roleScout = require('role.scout');

var managerBaseRoom = require('manager.base_room');

var roles = {
    'harvester': roleHarvester,
    'harvester.old': roleHarvesterOld,
    'upgrader': roleUpgrader,
    'builder': roleBuilder,
    'repairer': roleRepairer,
    'defender': roleDefender,
    'wall_repairer': roleWallRepairer,
    'long_distance_harvester': roleLongDistanceHarvester,
    'claimer': roleClaimer,
    'reserver': roleReserver,
    'filler': roleFiller,
    'sorter': roleSorter,
    'long_distance_hauler': roleLongDistanceHauler,
    'remote_miner': roleRemoteMiner
};

module.exports.loop = function () {
    //clear memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
            console.log(name + '\'s memory will not live on. It just got deleted');
        }
    }
    
    
    //for each creep name in Game.creeps
    for (let name in Game.creeps) {
        //get creep object
        var creep = Game.creeps[name];
        
        //if creep.role matches a set role, run that creep's role
        var startCpu = Game.cpu.getUsed();
        switch (creep.memory.role) {
            case 'harvester.old':
                roleHarvesterOld.run(creep);
                break;
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'repairer':
                roleRepairer.run(creep);
                break;
            case 'defender':
                roleDefender.run(creep);
                break;
            case 'wall_repairer':
                roleWallRepairer.run(creep);
                break;
            case 'long_distance_harvester':
                roleLongDistanceHarvester.run(creep);
                break;
            case 'claimer':
                roleClaimer.run(creep);
                break;
            case 'reserver':
                roleReserver.run(creep);
                break;
            case 'filler':
                roleFiller.run(creep);
                break;
            case 'sorter':
                roleSorter.run(creep);
                break;
            case 'long_distance_hauler':
                roleLongDistanceHauler.run(creep);
                break;
            case 'remote_miner':
                roleRemoteMiner.run(creep);
                break;
        }
        var endCpu = Game.cpu.getUsed();
        //console.log(creep, ': ', endCpu - startCpu, ' cpu used');
    }
    //managerBaseRoom.run(Game.rooms.W37S8);
    startCpu = Game.cpu.getUsed();
    var towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_TOWER
        });
        
    for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined) {
            tower.attack(target);
            Game.notify(target.name + 'identified. Attacking! ' + Game.time);
        }
        else if (tower.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 3000) {
            //find all structures that need repair
            var structures = _.filter(tower.room.find(FIND_STRUCTURES), function(s) {
                
                //if structure is a wall or rampart
                if (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) {
                    //return if it has damage
                    return s.hits < s.hitsMax;
                }
            });
            
            //find closest damaged structure in specified range
            var lower = 0;
            var targetStructures = [];
            for (var upper = 0; upper<=.004; upper += 0.00001) {
                targetStructures = _.filter(structures,
                (s) => s.hits/s.hitsMax > lower && s.hits/s.hitsMax <= upper);
                
                if (targetStructures[0] != undefined) {
                    break;
                }
                else {
                    lower = upper;
                }
            }
            var structure = tower.pos.findClosestByPath(targetStructures);
            
            if (structure == undefined) {
                //find all structures that need repair
                var structures = _.filter(tower.room.find(FIND_STRUCTURES), function(s) {
                    
                    //if structure is not a wall or rampart
                    if (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) {
                        //return if it has damage
                        return s.hits < s.hitsMax;
                    }
                    //if structure is wall or rampart
                    else {
                        //return if it has less than this amount of hits left
                        return s.hits < 100000;
                    }
                });
            
                //find closest damaged structure
                structure = tower.pos.findClosestByPath(structures);    
            }
            
            if (structure != undefined) {
                tower.repair(structure);
            }
        }
    }
    endCpu = Game.cpu.getUsed();
    //console.log('Towers : ', endCpu - startCpu, ' cpu used');
    
    startCpu = Game.cpu.getUsed();
    var links = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_LINK
    });
    
    for (let link of links) {
        switch (link.memory.role) {
            case 'home':
                if (link.cooldown == 0 && link.store.getUsedCapacity(RESOURCE_ENERGY) > 10) {
                    target = Game.getObjectById(link.room.memory.links.controller);
                    targetAmount = link.pos.getRangeTo(target) * 20 + 100;
                    if (target.store.getUsedCapacity(RESOURCE_ENERGY) < targetAmount &&
                        link.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 3000) {
                        link.transferEnergy(target,
                            Math.min(link.store.getUsedCapacity(RESOURCE_ENERGY),
                                (targetAmount - target.store.getUsedCapacity(RESOURCE_ENERGY)) * 1.03
                            )
                        );
                    }
                }
                break;
            case 'source':
                if (link.cooldown == 0 && link.store.getUsedCapacity(RESOURCE_ENERGY) > 10) {
                    target = Game.getObjectById(link.room.memory.links.home);
                    link.transferEnergy(target,
                        Math.min(link.store.getUsedCapacity(RESOURCE_ENERGY),
                            target.store.getFreeCapacity(RESOURCE_ENERGY)
                    ));
                }
                break;
            case 'controller':
                break;
            case 'mineral':
                break;
        }
    }
    endCpu = Game.cpu.getUsed();
    //console.log('Links : ', endCpu - startCpu, ' cpu used');
    
    var baseRooms = [];
    for (let spawn in Game.spawns) {
        if (!(baseRooms.includes(Game.spawns[spawn].room.name))) {
            baseRooms.push(Game.spawns[spawn].room.name);
        }
    }
    console.log(baseRooms);
    for (let base of baseRooms) {
        console.log(base);
        managerBaseRoom.run(Game.rooms.base);
    }
    
};