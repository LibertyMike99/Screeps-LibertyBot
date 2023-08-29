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
    'long_distance_hauler': roleLongDistanceHauler
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
    
    
    
    startCpu = Game.cpu.getUsed();
    //define the minimum number for each role before spawning upgraders
    //most important on BOTTOM of list
    var minNumberOfCreepsByRole = {
        'builder': 1,
        'wall_repairer': 0,
        'repairer': 0,
        'upgrader': 0,
        'defender': 0,
        'harvester.old': 1,
        'sorter': 1,
        'filler': 1,
        'harvester': 1
    };
    
    var minNumberOfLongDistanceCreepsByRole = {
        'long_distance_harvester': {
            'W37S7': 3,
            'W38S8': 2,
            'W36S8': 1
        },
        'reserver': {
            'W38S8': 1,
            'W37S7': 1
        }
        
        
    };
    
    //define default creep if all minimums are met
    var defaultCreep = 'upgrader'; 
    
    //if map has more than 500 ticks left, don't spawn defenders
    //for (let r in Game.rooms) {
    //    var room = Game.rooms[r];
    //    if(room.controller.safeMode > 500) {
    //        minNumberOfCreepsByRole['defender'] = 0;
    //    }
    //}
    
    /*
    var bodyByRole = {
        'repairer': [WORK,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
        'builder': [WORK,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
        'upgrader': [WORK,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
        'harvester': [WORK,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
        'small_harvester': [WORK,WORK,CARRY,MOVE],
        'defender': [ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE],
        'wall_repairer': [WORK,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,MOVE,MOVE]
    };
    */
    
    //count the number of live creeps by role
    var numberOfCreepsByRole = {};
    for (let role in roles) {
        //assign filtered sum of creeps to corresponding role
        numberOfCreepsByRole[role] = _.sum(Game.creeps, (c) => c.memory.role == role);
        }
        
    var numberOfLongDistanceCreepsByRole = {};
    for (let role in minNumberOfLongDistanceCreepsByRole) {
        numberOfLongDistanceCreepsByRole[role] = {};
        for (let room in minNumberOfLongDistanceCreepsByRole[role]) {
            numberOfLongDistanceCreepsByRole[role][room] = _.sum(Game.creeps, (c) => c.memory.role == role && c.memory.target == room);
        }
    }
        
    //create placeholder for potential spawned creeps for logging name
    var name = undefined;
    //create placeholder for potential spawned creeps for logging role
    var spawnRole = undefined;
    
    if (numberOfCreepsByRole['harvester.old'] == 0 &&
        numberOfCreepsByRole['filler'] == 0 &&
        Game.spawns.Spawn1.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 3000 &&
        !Game.creeps['Savior'])
    {
        console.log('failed');
        name = Game.spawns.Spawn1.createCustomCreep(
            Game.spawns.Spawn1.room.energyAvailable,
            'Savior',
            roles['harvester.old'].spawnInfo
        );
        console.log(name);
        spawnRole = 'savior';
    }
    else {
        for (let _role in minNumberOfCreepsByRole) {
            //if there are less creeps of role than required,
            if (numberOfCreepsByRole[_role] < minNumberOfCreepsByRole[_role]) {
                
                //spawn a new creep of the needed role and save the name for logging
                
                name = Game.spawns.Spawn1.createCustomCreep(
                    Game.spawns.Spawn1.room.energyCapacityAvailable, //energy
                    undefined, //name
                    roles[_role].spawnInfo
                    );
                
                //name = Game.spawns.Spawn1.createCreep(bodyByRole[_role], undefined,
                //{role:_role, transit:false});
                
                //save the role for logging
                spawnRole = _role;
                //log number of live creeps vs minimum
                console.log(_role + ': ' + numberOfCreepsByRole[_role] +
                ' out of ' + minNumberOfCreepsByRole[_role]);
            }
        }
    }
    
    
    //if all roles are satified
    if (spawnRole == undefined) {
        for (let _role in minNumberOfLongDistanceCreepsByRole) {
            for (let _room in minNumberOfLongDistanceCreepsByRole[_role]) {
                //if there are less creeps of role than required,
                
                if (numberOfLongDistanceCreepsByRole[_role][_room] < minNumberOfLongDistanceCreepsByRole[_role][_room]) {
                    
                    //spawn a new creep of the needed role and save the name for logging
                    
                    name = Game.spawns.Spawn1.createCustomCreep(
                        Game.spawns.Spawn1.room.energyCapacityAvailable, //energy
                        undefined, //name
                        roles[_role].spawnInfo
                    );
                    if (!(name < 0)) {
                        console.log(name + ' adding memory');
                        Game.creeps[name].memory['home'] = Game.spawns.Spawn1.room.name;
                        Game.creeps[name].memory['target'] = _room;
                        Game.creeps[name].memory['sourceIndex'] = 0;
                    }
                    
                    //save the role for logging
                    spawnRole = _role;
                    //log number of live creeps vs minimum
                    console.log(_role + ' - ' + _room + ': ' + numberOfLongDistanceCreepsByRole[_role][_room] + 
                    ' out of ' + minNumberOfLongDistanceCreepsByRole[_role][_room]);
                }
            }
        }
    }
    /*
    //if all long distance roles are satisfied
    if (spawnRole == undefined) {
        //spawn a new default role and save the name for logging
            
        name = Game.spawns.Spawn1.createCustomCreep(
            Game.spawns.Spawn1.room.energyCapacityAvailable, //energy
            undefined, //name
            roles[defaultCreep].spawnInfo
            );
        
        
        //name = Game.spawns.Spawn1.createCreep(bodyByRole[defaultCreep], undefined,
        //{role:defaultCreep, transit:false});
        
        
        //save the role for logging
        spawnRole = defaultCreep;
    }
    */
    
    //name is < 0 if there is an error spawning
    //if there was not an error
    if (!(name < 0) && (name != undefined)) {
        //log the role and name of the new creep
        console.log("Spawning new " + spawnRole + ': ' + name);
    }
    endCpu = Game.cpu.getUsed();
    //console.log('Spawning : ', endCpu - startCpu, ' cpu used');
    
    var totalCostPerTick = 0;
    for (role in minNumberOfCreepsByRole) {
        totalCostPerTick += Game.spawns.Spawn1.findBodyCost(Game.spawns.Spawn1.buildBody(
            Game.spawns.Spawn1.room.energyCapacityAvailable,
            roles[role].spawnInfo
        )) * minNumberOfCreepsByRole[role];
    }
    //console.log(totalCostPerTick);
    for (role in minNumberOfLongDistanceCreepsByRole) {
        let cost = Game.spawns.Spawn1.findBodyCost(Game.spawns.Spawn1.buildBody(
            Game.spawns.Spawn1.room.energyCapacityAvailable,
            roles[role].spawnInfo
        ));
        for (room in minNumberOfLongDistanceCreepsByRole[role]) {
            totalCostPerTick += cost * minNumberOfLongDistanceCreepsByRole[role][room];
        }
    }
    
    console.log(totalCostPerTick / 1500);

};