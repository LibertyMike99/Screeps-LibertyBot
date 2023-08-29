var utils = require('utilities');

module.exports = {
    run: function(room) {
        startCpu = Game.cpu.getUsed();
        var testCpu = Game.cpu.getUsed();
        let rbm = new BM.cpu(); 
        let tbm = new BM.cpu(false);
        var towers = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER
            });
        tbm.log('Find Towers');
        //console.log('Find Towers ',Game.cpu.getUsed()-testCpu);
        room.memory.base = room.memory.base || {};
        if (towers.length) {    
            var targets = room.find(FIND_HOSTILE_CREEPS, {filter: (c) => {
                return !Memory.users.peace.includes(c.owner.username);
            }});
            tbm.log('Towers Find Hostile Creeps');
            let temp = new BM.cpu();
            if (targets.length) {
                for (let tower of towers) {
                    target = tower.pos.findClosestByRange(targets,{filter: (c) =>
                        c.pos.inRangeTo(tower,100)
                    });
                    temp.log('Tower Find Closest Hostile');
                    tower.attack(target);
                    temp.log('Tower Attack');
                    if (target) {
                        Game.notify(target.owner.username + ' ' + target.name + ' identified. Attacking! ' + Game.time);  
                    }
                }
                tbm.log('Towers Attack Hostiles',temp);
            }
            else if ((Game.time % towers.length == 0 || true) && room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= 1000) {
                
                var structures = [];
                var damageMatrix = new utils.roomMatrix(room.name);
                tbm.log('Towers roomMatrix');
                let nukes = room.find(FIND_NUKES);
                tbm.log('Towers Find Nukes');
                
                if (nukes.length) {
                    nukes.forEach(function(nuke) {
                        for (let x = -2;x<=2;x++) {
                            for (let y = -2;y<=2;y++) {
                                if (x == 0 &&
                                    y == 0) {
                                    continue;
                                    }
                                else {
                                    let newX = nuke.pos.x + x;
                                    let newY = nuke.pos.y + y;
                                    //console.log(newX,newY);
                                    damageMatrix.set(newX,
                                    newY,
                                    6000000);
                                    //console.log(damageMatrix.get(newX,newY));
                                }
                            }
                        }
                        damageMatrix.set(nuke.pos.x,nuke.pos.y,11000000);
                        room.visual.rect(nuke.pos.x-2.5,nuke.pos.y-2.5,5,5,{
                            fill: COLOR_RED, stroke: '#f00000',
                            opacity: 0.30
                        });
                        
                    });
                    
                    structures = room.find(FIND_MY_STRUCTURES, {filter : (s) =>
                        s.structureType == STRUCTURE_RAMPART &&
                        s.hits < damageMatrix.get(s.pos.x,s.pos.y) * 1 &&
                        s.pos.lookFor(LOOK_STRUCTURES).filter((l) =>
                        l.structureType == STRUCTURE_STORAGE ||
                        l.structureType == STRUCTURE_SPAWN ||
                        l.structureType == STRUCTURE_FACTORY ||
                        l.structureType == STRUCTURE_LINK ||
                        l.structureType == STRUCTURE_TERMINAL ||
                        l.structureType == STRUCTURE_LAB).length
                        
                    });
                    //console.log('structures: ',structures);
                    tbm.log('TOWERS FIND PRIORITY');
                    
                }
                
                if (!structures.length && room.name == 'W37S8') {
                    //console.log('TOWER NO PRIORITY');
                    structures = _.filter(Game.rooms.W37S8.lookForAtArea(
                        LOOK_STRUCTURES,34,11,38,15,true).map((o) => o.structure),
                        (s) => s.structureType == STRUCTURE_RAMPART && s.hits < 10000000);
                    tbm.log('TOWERS FIND BASE-RAMPARTS');
                }
                else {
                    //console.log('TOWER PRIORITY');
                }
                if (!structures.length) {
                    structures = _.filter(room.find(FIND_STRUCTURES, {filter: (s) =>
                        s.structureType == STRUCTURE_ROAD &&
                        s.hits/s.hitsMax < .9
                    }));
                    tbm.log('TOWERS FIND NO PRIORITY-ROADS');
                }
                if (!structures.length) {
                    structures = _.filter(room.find(FIND_STRUCTURES, {filter: (s) =>
                        (s.structureType == STRUCTURE_RAMPART ||
                        s.structureType == STRUCTURE_WALL) &&
                        s.hits < (room.controller.level == 8 ? 10000000 : 1000000)
                    }));
                    tbm.log('TOWERS FIND NO PRIORITY-WALLS')
                    //console.log(structures);
                }
                
                //find closest damaged structure in specified range
                var targetStructures = [];
                if (Game.time % 5 == 0 || !room.memory.towerRepairs || !room.memory.towerRepairs.length) {
                    delete room.memory.towerRepairs;
                    delete room.memory.towerRepairsLim;
                    structures.sort((a,b) => {
                        let aHitsMax = (a.structureType == STRUCTURE_WALL || a.structureType == STRUCTURE_RAMPART) ? 
                        (room.controller.level == 8 ? 10000000 : 1000000) : a.hitsMax;
                        let bHitsMax = (b.structureType == STRUCTURE_WALL || b.structureType == STRUCTURE_RAMPART) ? 
                        (room.controller.level == 8 ? 10000000 : 1000000) : b.hitsMax;
                        
                        return a.hits/aHitsMax - b.hits/bHitsMax;
                    });
                    var lowest = structures[0];
                    //console.log(`Lowest: ${lowest} ${lowest.hits/lowest.hitsMax}`);
                    for (let s of structures) {
                        if (s.hits / s.hitsMax <= 1 && s.hits / s.hitsMax <= lowest.hits / lowest.hitsMax + 0.00001) {
                            //console.log(`${s} ${s.hits / s.hitsMax}`);
                            targetStructures.push(s);
                        } else {
                            break;
                        }
                    }
                    /*
                    for (var upper = 0; upper<=.005; upper += 0.00001) {
                        targetStructures = _.filter(structures,
                        (s) => s.hits/s.hitsMax > lower && s.hits/s.hitsMax <= upper);
                        
                        if (targetStructures.length) {
                            room.memory.towerRepairs = targetStructures.map(s => s.id);
                            room.memory.towerRepairsLim = upper;
                            break;
                        }
                        else {
                            lower = upper;
                        }
                    }
                    */
                    room.memory.towerRepairs = targetStructures.map(s => s.id);
                    room.memory.towerRepairsLim = lowest ? lowest.hits / lowest.hitsMax + 0.00001 : 1;
                    tbm.log('TOWERS FIND BY DAMAGED RANGE');
                } else {
                    targetStructures = _.filter(room.memory.towerRepairs.map(id => Game.getObjectById(id)),
                    function(s) {
                        return s.hits / s.hitsMax <= room.memory.towerRepairsLim;
                    });
                    room.memory.towerRepairs = targetStructures.map(s => s.id);
                    tbm.log('TOWERS CACHED BY DAMAGED RANGE');
                }
                
                if (targetStructures.length) {
                    for (let tower of towers) {
                        var structure = tower.pos.findClosestByRange(targetStructures);
                        tower.repair(structure);
                    }
                    tbm.log('TOWERS REPAIR CLOSEST');
                }
                else {
                    //find all structures that need repair
                    var structures = _.filter(room.find(FIND_STRUCTURES), function(s) {
                        
                        //if structure is not a wall or rampart
                        if (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_ROAD) {
                            //return if it has damage
                            return s.hits < s.hitsMax;
                        } else if (s.structureType == STRUCTURE_ROAD) {
                            return s.hits / s.hitsMax < .9;
                        }
                        //if structure is wall or rampart
                        else {
                            //return if it has less than this amount of hits left
                            return s.hits < 100000;
                        }
                    });
                    tbm.log('TOWERS FIND ALL DAMAGED');
                    
                    if (structures.length) {
                        for (let tower of towers) {
                            var structure = tower.pos.findClosestByRange(structures);
                            tower.repair(structure);
                        }
                        tbm.log('TOWERS REPAIR CLOSEST');
                    }
                    else {
                        let heals = room.find(FIND_MY_CREEPS,{filter: (c)=>
                            c.hits < c.hitsMax
                        });
                        tbm.log('TOWERS FIND HEALS');
                        for (let tower of towers) {
                            tower.heal(tower.pos.findClosestByRange(heals));
                        }
                        tbm.log('TOWERS HEAL CLOSEST');
                    }
                }
            }
        }
        rbm.log('Towers',tbm);
        /*    
        for (let tower of towers) {
            testCpu = Game.cpu.getUsed();
            var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            //console.log('Find hostiles  ',Game.cpu.getUsed()-testCpu);
            if (target != undefined) {
                tower.attack(target);
                Game.notify(target.name + ' identified. Attacking! ' + Game.time);
            }
            else if (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 3000) {
                testCpu = Game.cpu.getUsed();
                //find all structures that need repair
                var structures = _.filter(room.find(FIND_STRUCTURES), function(s) {
                    
                    //if structure is a wall or rampart
                    if (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) {
                        //return if it has damage
                        return s.hits < s.hitsMax;
                    }
                });
                //console.log('Find Structures ',Game.cpu.getUsed()-testCpu);
                
                testCpu = Game.cpu.getUsed();
                //find closest damaged structure in specified range
                var lower = 0;
                var targetStructures = [];
                for (var upper = 0; upper<=.002; upper += 0.00001) {
                    targetStructures = _.filter(structures,
                    (s) => s.hits/s.hitsMax > lower && s.hits/s.hitsMax <= upper);
                    
                    if (targetStructures.length) {
                        break;
                    }
                    else {
                        lower = upper;
                    }
                }
                console.log('Rank Structures ',Game.cpu.getUsed()-testCpu);
                var structure = tower.pos.findClosestByPath(targetStructures);
                
                if (structure == undefined) {
                    //find all structures that need repair
                    var structures = _.filter(room.find(FIND_STRUCTURES), function(s) {
                        
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
        } */
        endCpu = Game.cpu.getUsed();
        //console.log('Towers : ', endCpu - startCpu, ' cpu used');
        
        startCpu = Game.cpu.getUsed();
        let lbm = new BM.cpu(false);
        var links = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_LINK
        });
        lbm.log('Find Links');
        
        for (let link of links) {
            let bm1 = new BM.cpu();
            switch (link.memory.role) {
                case 'home':
                    if (room.memory.links.controller && link.cooldown == 0 && link.store.getUsedCapacity(RESOURCE_ENERGY) > 10) {
                        target = Game.getObjectById(room.memory.links.controller);
                        bm1.log('Target Controller');
                        targetAmount = 800; //link.pos.getRangeTo(target) * 15 + 100;
                        bm1.log('Target Amount');
                        if (target && target.store.getUsedCapacity(RESOURCE_ENERGY) < targetAmount &&
                            room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                            link.transferEnergy(target,
                                Math.min(link.store.getUsedCapacity(RESOURCE_ENERGY),
                                    (targetAmount - target.store.getUsedCapacity(RESOURCE_ENERGY)) * 1.03
                                )
                            );
                            bm1.log('Transfer Controller');
                        }
                    }
                    else {
                        bm1.log('Idle');
                    }
                    break;
                case 'source':
                    if (link.cooldown == 0 && link.store.getUsedCapacity(RESOURCE_ENERGY) > (
                        room.memory.links.controller == link.id ? 800 : 50)) {
                        target = Game.getObjectById(room.memory.links.home);
                        bm1.log('Target Home');
                        link.transferEnergy(target,
                            Math.min(link.store.getUsedCapacity(RESOURCE_ENERGY),
                                target.store.getFreeCapacity(RESOURCE_ENERGY)
                        ));
                        bm1.log('Transfer Home');
                    }
                    else {
                        bm1.log('Idle');
                    }
                    break;
                case 'controller':
                    break;
            }
            lbm.log(`${link.memory.role} Link`,bm1);
        }
        rbm.log('Links',lbm);
        endCpu = Game.cpu.getUsed();
        //console.log('Links : ', endCpu - startCpu, ' cpu used');
        
        
        
        startCpu = Game.cpu.getUsed();
        if (Game.cpu.bucket > 1000 || Game.time % 5 == 2 || Game.time % 5 == 3) {
            let sbm = new BM.cpu(elaborate = false);
            //define the minimum number for each role before spawning upgraders
            //most important on BOTTOM of list
            var minNumberOfCreepsByRole = {
                'long_distance_hauler': 0,
                'labTech': 0,
                'wall_repairer': 0,
                'repairer': 0,
                'upgrader': 0,
                'builder': 0,
                'upgrader.old': 0,
                'harvester.old': 0,
                'mineralMiner': 0,
                'mineralHauler': 0,
                'healer': 0,
                'defender': 0,
                'guard': 0,
                'sorter': 0,
                'filler': 0,
                'harvester': 0,
                'savior': 0
            };
            sbm.log('Spawns Set Min Creeps');
            
            
            var numberOfCreepsByRole = {};
            var numberOfLongDistanceCreepsByRole = {};
            /*
            //count the number of live creeps by role
            for (let role in roles) {
                //assign filtered sum of creeps to corresponding role
                numberOfCreepsByRole[role] = _.sum(Game.creeps, (c) => c.memory.role == role &&
                c.memory.homeRoom == room.name &&
                c.hits > 0);
            }
            bm1.log('Spawns Count Roles');
                
            for (let role in minNumberOfLongDistanceCreepsByRole) {
                numberOfLongDistanceCreepsByRole[role] = {};
                for (let _room in minNumberOfLongDistanceCreepsByRole[role]) {
                    numberOfLongDistanceCreepsByRole[role][_room] = _.sum(Game.creeps, (c) => c.memory.role == role &&
                    c.memory.homeRoom == room.name && c.memory.targetRoom == _room &&
                    c.hits > 0);
                }
            }
            bm1.log('Spawns Count Remote Roles');
            */
            
            /*
            _.forEach(Game.creeps, function(c) {
                if (c.memory.replaceEarly && !c.spawning && (c.ticksToLive <= c.body.length * 3)) {
                    return;
                }
                if (c.hits > 0 && c.memory.homeRoom && c.memory.homeRoom == room.name && c.memory.role) {
                    if (c.memory.targetRoom) {
                        if (numberOfLongDistanceCreepsByRole[c.memory.role] != undefined) {
                            //console.log('ITS NOT UNDEFINED');
                            if (numberOfLongDistanceCreepsByRole[c.memory.role][c.memory.targetRoom] != undefined) {
                                //console.log('ITS VERY DEFINED');
                                numberOfLongDistanceCreepsByRole[c.memory.role][c.memory.targetRoom] += 1;
                            } else {
                                numberOfLongDistanceCreepsByRole[c.memory.role][c.memory.targetRoom] = 1;
                            }
                        } else {
                            numberOfLongDistanceCreepsByRole[c.memory.role] = {};
                            numberOfLongDistanceCreepsByRole[c.memory.role][c.memory.targetRoom] = 1;
                        }
                    } else {
                        if (numberOfCreepsByRole[c.memory.role] != undefined) {
                            numberOfCreepsByRole[c.memory.role] += 1;    
                        } else {
                            numberOfCreepsByRole[c.memory.role] = 1;
                        }    
                    }     
                }
            });
            sbm.log('Spawns Count All Roles');
            */
            
            //console.log(JSON.stringify(creepCount.local[room.name]));
            //console.log(JSON.stringify(creepCount.foreign[room.name]));
            numberOfCreepsByRole = creepCount.local[room.name] || {};
            numberOfLongDistanceCreepsByRole = creepCount.foreign[room.name] || {};
            
            var results = room;
            sbm.log('Spawns Room Eval');
            
            if (room.memory.links && room.memory.links.sources) {
                minNumberOfCreepsByRole['harvester'] = room.memory.links.sources.length;
            }
            if ((room.storage && room.storageAmount > 0) || (room.terminal && room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0)) {
                if (room.memory.links && room.memory.base) {
                    minNumberOfCreepsByRole['sorter'] = 1;
                }
                if (room.storage.store.getCapacity(RESOURCE_ENERGY) > 0 && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && room.controller.level > 3) {
                    minNumberOfCreepsByRole['filler'] = results.spawns.length;
                }
            }
            if (room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 50000) {
                minNumberOfCreepsByRole['wall_repairer'] = 0;
            }
            if (room.controller.level > 3 && (room.controller.level < 5 || !room.memory.links || !room.memory.links.controller)) {
                minNumberOfCreepsByRole['upgrader.old'] = 2;
            }
            minNumberOfCreepsByRole['harvester.old'] =
                (results.sources.length - minNumberOfCreepsByRole['harvester']) * 1;
            if (results.invaders) {
                minNumberOfCreepsByRole['defender'] =
                    Math.min(1,results.invaders.length - Math.max(0,results.towers.length));
                    
                minNumberOfCreepsByRole['healer'] =
                    Math.min(0,results.assailants.length - Math.max(0,results.towers.length));
            }
            if (results.invaderCore.length) {
                //console.log(results.invaderCore);
                minNumberOfCreepsByRole['defender'] += 1;
                minNumberOfCreepsByRole['healer'] += 1;
            }
            if (room.controller.level >= 5 && results.storageAmount && (results.storageAmount > 680000 || room.controller.ticksToDowngrade < 120000 || room.controller.level < 8) && (room.memory.links && room.memory.links.controller) && (Game.market.credits > -1 || room.controller.ticksToDowngrade < 120000)) {
                minNumberOfCreepsByRole['upgrader'] = 1;
                if (results.storageAmount > 750000 && room.controller.level < 8) {
                    minNumberOfCreepsByRole['upgrader'] = 2;
                        if (results.storageAmount > 800000) {
                        minNumberOfCreepsByRole['upgrader'] = 3;
                }
                }
            }
            if (!results.towers) {
                //minNumberOfCreepsByRole['repairer'] = 1;
                //minNumberOfCreepsByRole['wall_repairer'] = 1;
            }
            if (results.constructionSites.length) {
                minNumberOfCreepsByRole['builder'] = Math.min(1,results.constructionSites.length);
            }
            //console.log("ARE WE HERE YET?");
            //console.log(room.terminal);
            if (room.terminal) {
                //console.log('There is a terminal');
            }
            if (room.terminal && room.labs.length && room.memory.labManager) {
                //console.log('LabTechS!');
                minNumberOfCreepsByRole['labTech'] = 1;
            }
            let repTotal = room.find(FIND_STRUCTURES, {filter: (s) => {
                return s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART;
            }}).reduce((sum,add) => {
                return sum + Math.max(0, (room.controller.level == 8 ? 10000000 : 1000000) - add.hits);
            },0)
            if (repTotal > 1000000  && room.storageAmount > 100000) {
                let repRole = room.controller.level == 8 ? 'repairer' : 'builder';
                minNumberOfCreepsByRole[repRole] = Math.min(2, Math.ceil(repTotal / 10000000));
            }
            if (room.mineral.mineralAmount > 0 && room.controller.level >= 6 && room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 5000) {
                //console.log(room.name,'passed test')
                if (room.extractor) {
                    //console.log(room.name,'has extracto?');
                    if (room.memory.base.mineral) {
                        let spot = room.getPositionAt(room.memory.base.mineral.x,room.memory.base.mineral.y)
                        if (spot.lookFor(LOOK_STRUCTURES).map((s)=>s.structureType).includes(STRUCTURE_CONTAINER)) {
                            minNumberOfCreepsByRole['mineralMiner'] = 1;
                            minNumberOfCreepsByRole['mineralHauler'] = 1;
                        } else if (!spot.lookFor(LOOK_CONSTRUCTION_SITES).map((s)=>s.structureType).includes(STRUCTURE_CONTAINER)) {
                            spot.createConstructionSite(STRUCTURE_CONTAINER);
                        }
                    } else {
                        let target = room.terminal || room.storage
                        let spot = target.pos.findClosestByPath(room.mineral.pos.walkableNeighbors);
                        room.memory.base.mineral = {x: spot.x,y: spot.y}
                    }
                } else if (!room.mineral.pos.lookFor(LOOK_CONSTRUCTION_SITES).map((s)=>s.structureType).includes(STRUCTURE_EXTRACTOR)) {
                    room.mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
                    console.log('Buildy Extracto');
                } else {
                    console.log('No extracto');
                }
            }
            sbm.log('Spawns Adjust Room Roles');
            
            var minNumberOfLongDistanceCreepsByRole = {
                
                'guard': {},
                'scout': {},
                'defender': {},
                'healer': {},
                'dismantler': {},
                'bootStrapper': {},
                'reserver': {},
                'remote_miner': {},
                'long_distance_hauler' : {},
                'long_distance_harvester': {},
                'depositMiner:': {},
                'depositHauler': {},
                'long_distance_hauler.new' : {},
                'claimer': {},
                'unclaimer': {},
                'roomDismantler' : {},
                'bulletsponge' : {},
                'scavenger': {},
                
            };
            sbm.log('Spawns Set Remote Roles');
            
            if (room.memory.guards) {
                for (let flag of _.filter(Game.flags,(f) => {
                    return f.color == COLOR_PURPLE
                })) {
                    //Game.map.visual.line(room.controller.pos,flag.pos,{color:'#FF00FF',width:2});
                    minNumberOfLongDistanceCreepsByRole['guard'][flag.name] = 1;
                }
            }
            sbm.log('Spawns Adjust Guards');
            
            if (room.memory.scoutRooms) {
                for (let scout of scoutRooms) {
                    minNumberOfLongDistanceCreepsByRole['bulletsponge'][scout] = 1;
                }
            }
            
            if (room.memory.earlyRooms) {
                if (room.controller.level > 3 && room.storage && room.storage.structureType == STRUCTURE_STORAGE) {
                    room.memory.remoteRooms = room.memory.earlyRooms;
                    delete room.memory.earlyRooms;
                } else {
                    var earlyRooms = room.memory.earlyRooms
                    
                    for (let early of earlyRooms) {
                        if (Game.rooms[early] == undefined) {
                            minNumberOfLongDistanceCreepsByRole['scout'][early] = 1;
                            continue;
                        }
                        if (Game.rooms[early].invaders.length > 0) {
                            minNumberOfLongDistanceCreepsByRole['defender'][early] = Math.min(2,Game.rooms[early].invaders.length);
                            continue;
                        }
                        
                        
                        //Game.map.visual.line(room.controller.pos,Game.rooms[early].getPositionAt(25,25),{color:'#FFFF00',width:1,lineStyle:'dashed'});
                        minNumberOfLongDistanceCreepsByRole['long_distance_harvester'][early] = Game.rooms[early].sources.length * 2;
                    }
                }
            }
            
            if (room.memory.remoteRooms) {
                var remoteRooms = room.memory.remoteRooms;
            
            
                for (let remote of remoteRooms) {
                    //Game.map.visual.line(room.storage.pos,Game.rooms[remote].getPositionAt(25,25),{color:'#FFFF00',width:2});
                    
                    if (!Memory.rooms[remote]) {
                        Memory.rooms[remote] = {};
                    }
                    if (!Memory.rooms[remote].orders) {
                        Memory.rooms[remote].orders = {};
                    }
                    if (!Memory.rooms[remote].orders.hold) {
                        Memory.rooms[remote].orders.hold = false;  
                    }
                    if (Game.rooms[remote] == undefined) {
                        minNumberOfLongDistanceCreepsByRole['scout'][remote] = 1;
                        continue;
                    }
                    results = Game.rooms[remote];
                    
                    if (results.invaders.length) {
                        minNumberOfLongDistanceCreepsByRole['defender'][remote] = Math.min(1,results.assailants.length);
                        
                        if (room.controller.level < 7) {
                            continue;
                        }
                        minNumberOfLongDistanceCreepsByRole['healer'][remote] = Math.min(0,results.assailants.length-2);
                        continue;
                    }
                    if (results.invaderCore.length) {
                        console.log(remote, ' invader core. Responding!');
                        if (minNumberOfLongDistanceCreepsByRole['defender'][remote]) {
                            minNumberOfLongDistanceCreepsByRole['defender'][remote] += 1;
                        }
                        else {
                            minNumberOfLongDistanceCreepsByRole['defender'][remote] = 1;
                        }
                        //minNumberOfLongDistanceCreepsByRole['healer'][remote] += 1;
                    }
                    if ((results.hostileClaim || !results.mine ||
                        (results.mine && results.reservationTimer < 2500) ||
                        results.reservationTimer == false) &&
                        room.storage) {
                        minNumberOfLongDistanceCreepsByRole['reserver'][remote] = 1;
                    }
                    if (room.storage && room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 2500 && (!results.controller.reservation || results.mine == true)) {
                        minNumberOfLongDistanceCreepsByRole['remote_miner'][remote] = results.sources.length;
                    }
                    if (results.miners.length) {
                        //minNumberOfCreepsByRole['long_distance_hauler'] += results.miners.length;
                    }
                    if (results.minedSources.length) {
                        for (let source of results.minedSources) {
                            minNumberOfLongDistanceCreepsByRole['long_distance_hauler.new'][source.id] = 1;
                            //minNumberOfLongDistanceCreepsByRole['long_distance_hauler.new']['5bbcaae79099fc012e632671'] = 1;
                        }
                    }
                    if (results.assailants.length) {
                        minNumberOfLongDistanceCreepsByRole['long_distance_hauler.new'][remote] = 0;
                        minNumberOfLongDistanceCreepsByRole['remote_miner'][remote] = 0;
                        minNumberOfLongDistanceCreepsByRole['reserver'][remote] = 0;
                    }
                    if (!results.mine) {
                        break;
                    }
                }
            }
            sbm.log('Spawns Adjust Remote Rooms');
            
            if (room.memory.defendRooms) {
                var defendRooms = room.memory.defendRooms;
                
                for (let defend of defendRooms) {
                    //Game.map.visual.line(room.controller.pos,Game.rooms[defend].getPositionAt(25,25),{color:'#FF0000',width:2,lineStyle:'dashed'});
                    if (!Memory.rooms[defend]) {
                        Memory.rooms[defend] = {};
                    }
                    if (!Memory.rooms[defend].orders) {
                        Memory.rooms[defend].orders = {};
                    }
                    if (!Memory.rooms[defend].orders.hold) {
                        Memory.rooms[defend].orders.hold = false;
                    }
                    
                    if (Game.rooms[defend] == undefined) {
                        //minNumberOfLongDistanceCreepsByRole['scout'][defend] = 1;
                        //continue;
                    }
                    if (Game.rooms[defend]) {
                        var results = Game.rooms[defend];
                        minNumberOfLongDistanceCreepsByRole['defender'][defend] =
                            Math.min(3,Math.max(1,results.invaders.length));
                        minNumberOfLongDistanceCreepsByRole['healer'][defend] = 
                            Math.min(3,Math.max(1,results.assailants.length));
                    }
                    else {
                        minNumberOfLongDistanceCreepsByRole['defender'][defend] = 1;
                        minNumberOfLongDistanceCreepsByRole['healer'][defend] = 1;
                    }
                }
            }
            sbm.log('Spawns Adjust Defend Rooms');
            
            if (room.memory.attackRooms) {
                var attackRooms = room.memory.attackRooms;
                
                for (let attack of attackRooms) {
                    //Game.map.visual.line(room.controller.pos,Game.rooms[attack].getPositionAt(25,25),{color:'#FF0000',width:2});
                    if (!Memory.rooms[attack]) {
                        Memory.rooms[attack] = {};
                    }
                    if (!Memory.rooms[attack].orders) {
                        Memory.rooms[attack].orders = {};
                    }
                    if (!Memory.rooms[attack].orders.hold) {
                        Memory.rooms[attack].orders.hold = false;  
                    }
                    if (Game.rooms[attack] == undefined) {
                        //minNumberOfLongDistanceCreepsByRole['scout'][attack] = 1;
                        //continue;
                    }
                    if (Game.rooms[attack]) {
                        if (Game.rooms[attack].controller.safeMode) {
                            //minNumberOfLongDistanceCreepsByRole['bulletsponge'][attack] = 2;
                            minNumberOfLongDistanceCreepsByRole['roomDismantler'][attack] = 1;
                            continue;
                        }
                        var results = Game.rooms[attack];
                        minNumberOfLongDistanceCreepsByRole['defender'][attack] =
                            Math.min(3,Math.max(2,results.invaders.length));
                        minNumberOfLongDistanceCreepsByRole['healer'][attack] = 
                            Math.min(3,Math.max(2,results.invaders.length));
                        
                        minNumberOfLongDistanceCreepsByRole['roomDismantler'][attack] = room.controller.level >= 7 ? 2 : 0;
                    }
                    else {
                        //minNumberOfLongDistanceCreepsByRole['defender'][attack] = 0;
                        //minNumberOfLongDistanceCreepsByRole['healer'][attack] = 2;
                        //minNumberOfLongDistanceCreepsByRole['bulletsponge'][attack] = 1;
                        let observer = room.find(FIND_MY_STRUCTURES,{filter: {structureType: STRUCTURE_OBSERVER}})[0] || undefined;
                        if (observer) {
                            observer.observeRoom(attack);
                        } else {
                            minNumberOfLongDistanceCreepsByRole['bulletsponge'][attack] = 1;
                        }
                    }
                }
            }
            sbm.log('Spawns Adjust Attack Rooms');
            
            if (room.memory.siegeRooms) {
                //console.log('sieges',room.memory.siegeRooms);
                var siegeRooms = room.memory.siegeRooms;
                
                for (let siege of siegeRooms) {
                    //Game.map.visual.line(room.controller.pos,Game.rooms[siege].getPositionAt(25,25),{color:'#FF0000',width:5});
                    console.log('siege',siege);
                    if (true || Game.rooms[siege] == undefined) {
                        minNumberOfLongDistanceCreepsByRole['bulletsponge'][siege] = 1;
                        //continue;
                    }
                    if (Game.rooms[siege]) {
                        if (Game.rooms[siege].controller.safeMode) {
                            //minNumberOfLongDistanceCreepsByRole['bulletsponge'][siege] = 2;
                            //minNumberOfLongDistanceCreepsByRole['roomDismantler'][siege] = 1;
                            continue;
                        }
                        var results = Game.rooms[siege];
                        minNumberOfLongDistanceCreepsByRole['defender'][siege] = 0;
                            Math.min(2,Math.max(0,results.assailants.length));
                        minNumberOfLongDistanceCreepsByRole['healer'][siege] = 0;
                            Math.min(2,Math.max(0,results.assailants.length));
                        
                        if (Game.rooms[siege].controller.level > 0) {
                            minNumberOfLongDistanceCreepsByRole['roomDismantler'][siege] = 
                            room.controller.level == 8 ? 4 : 2;
                        }
                    }
                    else {
                        //minNumberOfLongDistanceCreepsByRole['defender'][siege] = 0;
                        //minNumberOfLongDistanceCreepsByRole['healer'][siege] = 2;
                        //minNumberOfLongDistanceCreepsByRole['bulletsponge'][siege] = 1;
                        let observer = room.find(FIND_MY_STRUCTURES,{filter: {structureType: STRUCTURE_OBSERVER}})[0] || undefined;
                        if (observer) {
                            observer.observeRoom(siege);
                        } else {
                            minNumberOfLongDistanceCreepsByRole['bulletsponge'][siege] = 1;
                        }
                    }
                }
            }
            sbm.log('Spawns Adjust Siege Rooms');
            
            if (room.memory.scavengeRooms) {
                var scavengeRooms = room.memory.scavengeRooms;
                
                for (let scavenge of scavengeRooms) {
                    //Game.map.visual.line(room.storage.pos,Game.rooms[scavenge].getPositionAt(25,25),{color:'#FFFF00',width:1,lineStyle:'dotted'});
                    if (Game.rooms[scavenge]) {
                        minNumberOfLongDistanceCreepsByRole['scavenger'][scavenge] = 2;
                        let cont = Game.rooms[scavenge].controller;
                        if (cont && !cont.my && (!cont.reservation || cont.reservation.username != MY_USERNAME) || (cont.owner && cont.owner != MY_USERNAME) &&
                        (!cont.upgradeBlocked || cont.upgradeBlocked < 150)) {
                            minNumberOfLongDistanceCreepsByRole['unclaimer'][scavenge] = 1;
                        }
                        if (Game.rooms[scavenge].invaders.length > 0) {
                            minNumberOfLongDistanceCreepsByRole['defender'][scavenge] = 1;
                        }
                    } else {
                        let observer = room.find(FIND_MY_STRUCTURES,{filter: {structureType: STRUCTURE_OBSERVER}})[0] || undefined;
                        if (observer) {
                            observer.observeRoom(scavenge);
                        } else {
                            minNumberOfLongDistanceCreepsByRole['scout'][scavenge] = 1;
                        }
                    }
                }
            }
            
            if (room.memory.expansionRooms) {
                var expansionRooms = room.memory.expansionRooms;
                
                for (let expansion of expansionRooms) {
                    //Game.map.visual.line(room.controller.pos,Game.rooms[expansion].getPositionAt(25,25),{color:'#00FF00',width:2});
                    if (Game.rooms[expansion] == undefined) {
                        minNumberOfLongDistanceCreepsByRole['scout'][expansion] = 1;
                        //room.find(FIND_MY_STRUCTURES, {filter:{structureType:STRUCTURE_OBSERVER}})[0].observeRoom(expansion);
                        continue;
                    }
                    
                    results = Game.rooms[expansion];
                    if (results.mine && Game.rooms[expansion].controller.level >= 1) {
                        minNumberOfLongDistanceCreepsByRole['bootStrapper'][expansion] = (Game.rooms[expansion].controller.level < 4) ? 4 : 2; //4 - Game.rooms[expansion].controller.level;
                    }
                    if (results.mine && Game.rooms[expansion].controller.level - room.controller.level >= -1) {
                        room.memory.expansionRooms = _.filter(room.memory.expansionRooms, {filter:
                        (r) => !expansion});
                    }
                    if (results.invaders) {
                        minNumberOfLongDistanceCreepsByRole['defender'][expansion] = Math.min(5,results.invaders.length);
                    }
                    if (results.invaderCore.length) {
                        minNumberOfLongDistanceCreepsByRole['defender'][expansion] += 1;
                    }
                    if (Game.rooms[expansion].controller.level < 1 && !(Game.rooms[expansion].controller.upgradeBlocked > 150)) {
                        if (Game.rooms[expansion].controller.reservation && Game.rooms[expansion].controller.reservation.ticksToEnd > 300) {
                            minNumberOfLongDistanceCreepsByRole['claimer'][expansion] = 1;
                        } else {
                            minNumberOfLongDistanceCreepsByRole['claimer'][expansion] = 1
                        }
                        //minNumberOfLongDistanceCreepsByRole['defender'][expansion] = 1;
                        //minNumberOfLongDistanceCreepsByRole['roomDismantler'] = 1;
                    } else if (!results.mine && Game.rooms[expansion].find(FIND_HOSTILE_STRUCTURES).length) {
                        minNumberOfLongDistanceCreepsByRole['roomDismantler'] = 1;
                    }
                }
            }
            sbm.log('Spawns Adjust Expansion Rooms');
            
            if (room.memory.assistRooms) {
                var assistRooms = room.memory.assistRooms;
                
                for (let assist of assistRooms) {
                    //Game.map.visual.line(room.controller.pos,Game.rooms[assist].getPositionAt(25,25),{color:'#00FF00',width:1,lineStyle:'dotted'});
                    minNumberOfLongDistanceCreepsByRole['defender'][assist] = 2;
                    minNumberOfLongDistanceCreepsByRole['bootStrapper'][assist] = 2;
                }
            }
          
            if (room.memory.depositRooms) {
                var depositRooms = room.memory.depositRooms;
                
                for (let deposit of depositRooms) {
                    if (Game.rooms[deposit.room] == undefined) {
                        minNumberOfLongDistanceCreepsByRole['scout'][deposit.room] = 1;
                        continue;
                    }
                    let dep = Game.rooms[deposit.room].lookForAt(LOOK_DEPOSITS,deposit.x,deposit.y)[0];
                    if (dep && (!dep.lastCooldown || dep.lastCooldown <= 200 - (50 * 1.2 * (Game.map.getRoomLinearDistance(room.name,deposit.room) - 3)))) {
                        //console.log(JSON.stringify(minNumberOfLongDistanceCreepsByRole['depositHauler']));
                        let numHaulers = (numberOfLongDistanceCreepsByRole['depositHauler'] && numberOfLongDistanceCreepsByRole['depositHauler'][JSON.stringify(deposit)]) ?
                        numberOfLongDistanceCreepsByRole['depositHauler'][JSON.stringify(deposit)] : 0;
                        let numMiners = (numberOfLongDistanceCreepsByRole['depositMiner'] && numberOfLongDistanceCreepsByRole['depositMiner'][JSON.stringify(deposit)]) ?
                        numberOfLongDistanceCreepsByRole['depositMiner'][JSON.stringify(deposit)] : 0;
                        minNumberOfLongDistanceCreepsByRole['depositHauler'][JSON.stringify(deposit)] = Math.min(2,numMiners + 1,dep.pos.walkableNeighbors.length);
                        minNumberOfLongDistanceCreepsByRole['depositMiner'] = minNumberOfLongDistanceCreepsByRole['depositMiner'] || {};
                        minNumberOfLongDistanceCreepsByRole['depositMiner'][JSON.stringify(deposit)] = Math.min(2,numHaulers,dep.pos.walkableNeighbors.length);
                    } else {
                        room.memory.depositRooms = _.filter(room.memory.depositRooms, (r) => r != deposit);
                    }
                }
            }
            sbm.log('Spawns Adjust Deposit Rooms');
            
            var bm1 = new BM.cpu(false);
            
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
            
            //console.log(JSON.stringify(numberOfLongDistanceCreepsByRole));
                
            //create placeholder for potential spawned creeps for logging name
            var name = undefined;
            //create placeholder for potential spawned creeps for logging role
            var spawnRole = undefined;
            if ((!numberOfCreepsByRole['harvester.old'] &&
                !numberOfCreepsByRole['filler'] &&
                (room.energyAvailable < 900 ||
                (room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 900)
                )) &&
                !numberOfCreepsByRole['savior']) {
                    
        
                //console.log('failed');
                name = room.spawn(
                    Math.max(300,room.energyAvailable),
                    `${room.name}_Savior`,
                    roles['savior'].spawnInfo,
                    {homeRoom: room.name}
                );
                //console.log(name);
                spawnRole = 'savior';
                bm1.log('Spawn savior');
            }
            else {
                let bm2 = new BM.cpu();
                for (let _role in minNumberOfCreepsByRole) {
                    let bm3 = new BM.cpu();
                    if (!numberOfCreepsByRole[_role]) {
                        numberOfCreepsByRole[_role] = 0;
                    }
                    //if there are less creeps of role than required,
                    if (numberOfCreepsByRole[_role] < minNumberOfCreepsByRole[_role]) {
                        let needed = minNumberOfCreepsByRole[_role] - numberOfCreepsByRole[_role];
                        let freeCreeps = room.freeCreeps[_role];
                        bm3.log('Get Free Creeps');
                        if (false && needed > 0 && freeCreeps && Object.keys(freeCreeps) && Object.keys(freeCreeps).length) {
                            let closest = Object.entries(freeCreeps).sort((a,b) => {
                                return Game.map.getRoomLinearDistance(room.name,a[1]) - Game.map.getRoomLinearDistance(room.name,b[1]);
                            });
                            bm3.log('Sort By Closest Free Creep');
                            closest = closest.slice(0,needed);
                            bm3.log('Select Number Of Needed Closest Creeps');
                            //let closest = [false, Infinity];
                            //for (let creep in freeCreeps) {
                            //    let dist = Game.map.getRoomLinearDistance(room.name,freeCreeps[creep]);
                            //    closest = dist < closest[1] ? [creep,dist] : closest;
                            //}
                            for (let [id,r] in closest) {
                                let creep = Game.getObjectById(id);
                                creep.memory.homeRoom = room.name;
                                delete room.freeCreeps[_role][id];
                                needed--;
                                Game.notify(`Assigning ${creep.name} to ${room.name}`);
                            }
                            bm3.log('Assign Selected Creeps');
                        } 
                        if (room.energyAvailable >=
                        room.find(FIND_MY_SPAWNS)[0].findBodyCost(room.find(FIND_MY_SPAWNS)[0].buildBody(
                            room.energyCapacityAvailable,roles[_role].spawnInfo)) &&
                            room.openSpawns.length && needed > 0) {
                            //spawn a new creep of the needed role and save the name for logging
                            
                            name = room.spawn(
                                room.energyCapacityAvailable, //energy
                                `${_role}${Memory.creepNum}`, //name
                                roles[_role].hasOwnProperty('spawnInstructions') ?
                                roles[_role].spawnInstructions({home:room.name}) : roles[_role].spawnInfo,
                                {homeRoom: room.name}
                            );
                            if (!(name < 0)) {
                                console.log(name + ' adding memory');
                                bm3.log(`Spawn ${_role} Success`);
                            }
                            else {
                                console.log(`Spawn ${_role} Fail: ${name}`);
                                bm3.log(`Spawn ${_role} Fail: ${name}`);
                            }
                            
                            //name = Game.spawns.Spawn1.createCreep(bodyByRole[_role], undefined,
                            //{role:_role, transit:false});
                            
                            
                        }
                        //save the role for logging
                        spawnRole = _role;
                        //log number of live creeps vs minimum
                        console.log(room.name + ' ' + _role + ': ' + numberOfCreepsByRole[_role] +
                        ' out of ' + minNumberOfCreepsByRole[_role]);
                        bm3.log('Finish');
                    }
                    bm2.log(_role,bm3);
                }
                bm1.log('Local Spawning',bm2);
            }
            
            
            //if all roles are satified
            var bm2 = new BM.cpu();
            for (let _role in minNumberOfLongDistanceCreepsByRole) {
                let bm3 = new BM.cpu();
                for (let _room in minNumberOfLongDistanceCreepsByRole[_role]) {
                    let bm4 = new BM.cpu();
                    //if there are less creeps of role than required,
                    numberOfLongDistanceCreepsByRole[_role] = numberOfLongDistanceCreepsByRole[_role] || {};
                    numberOfLongDistanceCreepsByRole[_role][_room] = numberOfLongDistanceCreepsByRole[_role][_room] || 0;
                    if (numberOfLongDistanceCreepsByRole[_role][_room] < minNumberOfLongDistanceCreepsByRole[_role][_room]) {
                        let needed = minNumberOfLongDistanceCreepsByRole[_role][_room] - numberOfLongDistanceCreepsByRole[_role][_room];
                        let freeCreeps = room.freeCreeps[_role];
                        bm4.log('Get Free Creeps');
                        if (needed > 0 && freeCreeps && Object.keys(freeCreeps) && Object.keys(freeCreeps).length) {
                            console.log(room.name,'Free Creeps: ', JSON.stringify(freeCreeps));
                            let closest = Object.entries(freeCreeps).sort((a,b) => {
                                return Game.map.getRoomLinearDistance(_room,a[1]) - Game.map.getRoomLinearDistance(_room,b[1]);
                            });
                            console.log(closest[0]);
                            bm4.log('Sort By Closest Free Creep');
                            closest = closest.slice(0,needed);
                            bm4.log('Select Number Of Needed Closest Creeps');
                            //let closest = [false, Infinity];
                            //for (let creep in freeCreeps) {
                            //    let dist = Game.map.getRoomLinearDistance(room.name,freeCreeps[creep]);
                            //    closest = dist < closest[1] ? [creep,dist] : closest;
                            //}
                            if (closest.length) {
                                for (let [id,r] of closest) {
                                    //console.log(id,r);
                                    let creep = Game.getObjectById(id);
                                    if (creep) {
                                        creep.memory.targetRoom = _room;
                                        needed--;
                                        delete room.freeCreeps[_role][id];
                                        Game.notify(`${creep.name} assigned to ${_room}`);
                                        console.log(`${creep.name} assigned to ${_room}`);
                                    }
                                }
                            }
                            bm4.log('Assign Selected Creeps');
                        } 
                        
                        if (numberOfLongDistanceCreepsByRole[_role][_room] < 3 &&
                            (_role == 'defender' || _role == 'healer')) {
                            if (!Memory.rooms[_room]) {
                                Memory.rooms[_room] = {orders:{}};
                            }
                            if (!Memory.rooms[_room].orders) {
                                Memory.rooms[_room].orders = {};
                            }
                            Memory.rooms[_room].orders.hold = true;
                            bm4.log('Spawning Block Room');
                        }
                        
                        
                        
                        if (room.energyAvailable >=
                        room.find(FIND_MY_SPAWNS)[0].findBodyCost(room.find(FIND_MY_SPAWNS)[0].buildBody(
                            room.energyCapacityAvailable,roles[_role].spawnInfo)) &&
                            room.openSpawns.length && spawnRole == undefined && needed > 0) {
                            bm4.log('Spawns If Enough Energy');
                            //spawn a new creep of the needed role and save the name for logging
                            
                            let _spawnInfo = roles[_role].spawnInstructions({home: room, target : _room});
                            bm4.log('Spawns Get Spawn Info');
                            name = room.spawn(
                                room.energyCapacityAvailable, //energy
                                `${_role}${Memory.creepNum}`, //name
                                _spawnInfo,
                                {homeRoom: room.name, targetRoom: _room}
                            );
                            bm4.log('Room Spawn Remote Creep');
                            
                            if (Game.map.describeExits(_room)) {
                                var expRoom = _room;
                                bm4.log('Spawns Expense Room');
                            }
                            else if (Game.flags[_room]) {
                                var expRoom = Game.flags[_room].pos.room;
                                bm4.log('Spawns Expense Flag');
                            }
                            else {
                                var expRoom = Game.getObjectById(_room) ? Game.getObjectById(_room).room.name : 'unseen';
                                bm4.log('Spawns Expense Object');
                            }
                            
                            if (!Memory.report) {
                                Memory.report = {};
                            }
                            if (!Memory.report.expenses) {
                                Memory.report.expenses = {};
                            }
                            if (!Memory.report.expenses[expRoom]) {
                                Memory.report.expenses[expRoom] = 0;
                            }
                            if (!(name < 0) && (name != undefined)) {
                                Memory.report.expenses[expRoom] +=
                                room.find(FIND_MY_SPAWNS)[0].findBodyCost(room.find(FIND_MY_SPAWNS)[0].buildBody(
                                    room.energyCapacityAvailable,_spawnInfo));
                                bm4.log('Spawns Report Expenses');
                            }
                            
                            //save the role for logging
                            spawnRole = _role;
                        }
                        //log number of live creeps vs minimum
                        console.log(room.name + ' ' + _role + ' - ' + _room + ': ' + numberOfLongDistanceCreepsByRole[_role][_room] + 
                        ' out of ' + minNumberOfLongDistanceCreepsByRole[_role][_room]);
                    }
                    bm4.log('Finish');
                    bm3.log(_room, bm4);
                }
                bm2.log(_role, bm3);
            }
            bm1.log('Remote Spawning', bm2);
            
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
            bm1.log('Spawns Test Spawn Status');
            sbm.log('Executing Spawning',bm1);
            rbm.log('Spawning',sbm);
        }
        endCpu = Game.cpu.getUsed();
        //console.log('Spawning : ', endCpu - startCpu, ' cpu used');
        startCpu = endCpu;
        
        let mbm = new BM.cpu(false);
        
        if (room.terminal && room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 20000 &&
        room.terminal.cooldown == 0 &&
        room.storage.store.getUsedCapacity(RESOURCE_ENERGY) + room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 820000 &
        Game.cpu.bucket > 1000) {
            mbm.log('Test To Sell');
            const minEnergySellPrice = .1;
            mbm.log('Set Min Sell Price');
            var marketOrders = Game.market.getAllOrders({
                resourceType: RESOURCE_ENERGY,
                type: ORDER_BUY
                
            });
            mbm.log('Get Energy Buy Orders');
            
            
            marketOrders.forEach(function(order) {
                Object.defineProperty(order, 'adjPrice', {
                    value: (order.amount * order.price) / (order.amount + Game.market.calcTransactionCost(
                    order.amount,order.roomName,room.name)),
                    configurable: true
                });
            });
            mbm.log('Add adjPrice To All Orders');
            
                
            marketOrders.sort(function(a,b) {
                return b.adjPrice - a.adjPrice;
            });
            mbm.log('Sort Orders By adjPrice');
            //console.log(marketOrders.map(order => order.adjPrice));
            sellAmount = room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) - 20000 - 800000 + room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
            mbm.log('Set Sell Amount');
            for (let order of marketOrders) {
                let sendCost = order.adjPrice / order.price;
                //console.log(`Send Cost: ${sendCost}`);
                //console.log(`Price: ${order.adjPrice}`);
                //console.log(`Sell Amount: ${sellAmount}\nSold: ${Math.min(order.amount,sellAmount * sendCost)}`);
                if (order.adjPrice < minEnergySellPrice ||
                sellAmount <= 0) {
                    break;
                }
                Game.market.deal(
                    order.id,
                    Math.min(order.amount,sellAmount * sendCost),
                    room.name);
                sellAmount -= Math.min(order.amount,sellAmount * sendCost);
                break;
            }
            mbm.log('Execute All Eligible Orders');
        }
        
        if (Game.market.credits > 10000 && room.terminal &&
        room.terminal.cooldown == 0 &&
        room.storage.store.getUsedCapacity(RESOURCE_ENERGY) + room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 720000 &&
        Game.cpu.bucket > 1000) {
            mbm.log('Test To Buy');
            const maxBuyPrice = 2.5;
            mbm.log('Set Max Buy Price');
            var marketOrders = Game.market.getAllOrders({
                resourceType: RESOURCE_ENERGY,
                type: ORDER_SELL
                
            });
            mbm.log('Get Energy Sell Orders');
            
            marketOrders.forEach(function(order) {
                Object.defineProperty(order, 'adjPrice', {
                    value: (order.amount * order.price) / (order.amount - Game.market.calcTransactionCost(
                    order.amount,order.roomName,room.name)),
                    configurable: true
                });
            });
            mbm.log('Add adjPrice To All Orders');
            
             marketOrders.sort(function(a,b) {
                //return a.price - b.price;
                return a.adjPrice - b.adjPrice;
            });
            mbm.log('Sort Orders By adjPrice');
            //console.log(marketOrders.map(order => order.adjPrice));
            buyAmount = 700000 - room.storage.store.getUsedCapacity(RESOURCE_ENERGY) - room.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
            mbm.log('Set Buy Amount');
            
            for (let order of marketOrders) {
                //console.log(`Buy Amount: ${buyAmount}`);
                if (order.price > maxBuyPrice ||
                buyAmount <= 0) {
                    break;
                }
                Game.market.deal(
                    order.id,
                    Math.min(order.amount,buyAmount),
                    room.name);
                buyAmount -= Math.min(order.amount,buyAmount);
            }
            mbm.log('Execute All Eligible Orders');
            
        }
        if (room.memory.labs && Game.market.credits > 15000 && room.terminal && room.terminal.cooldown == 0 && Game.cpu.bucket > 1000) {
            let minerals = {};
            for (let mineral of Object.values(room.memory.labs)) {
                minerals[mineral] = minerals[mineral] || 0;
                minerals[mineral] += 15000;
            }
            mbm.log('Calc Gross Needed Minerals');
            for (let mineral in minerals) {
                if (room.terminal && room.terminal.store[mineral]) {
                    minerals[mineral] -= room.terminal.store.getUsedCapacity(mineral);
                }
            }
            mbm.log('Calc Net Needed Minerals');
            
            /*let maxPrices = {
                'KH': 10,
            };*/
            for (let mineral in minerals) {
                if (minerals[mineral] > 5000) {
                    var marketOrders = Game.market.getAllOrders({
                        resourceType: mineral,
                        type: ORDER_SELL});
                    mbm.log('Get Mineral Sell Orders');
                    marketOrders.sort(function(a,b) {
                        return a.price - b.price;    
                    });
                    mbm.log('Sort by Price');
                    let order = marketOrders[0];
                    let amtAfford = Math.floor(Game.market.credits / ((order) ? order.price : (Game.market.credits * 2)));
                    //console.log(JSON.stringify(order));
                    //console.log(`${room.name} can afford ${amtAfford} ${mineral}`);
                    if (amtAfford <= 0) continue;
                    if (order) {
                        if (order.price <= 700) {
                            Game.market.deal(order.id,Math.min(order.remainingAmount,minerals[mineral],amtAfford),room.name);
                        } else {
                            console.log(order.resourceType, order.price);
                            continue;
                        }
                    }
                    mbm.log('Execute Mineral Order');
                    if (order) {
                        break;
                    }
                }
            }
        }
        mbm.log('Finish');
        rbm.log('Market',mbm);
        //console.log('Trading : ', Game.cpu.getUsed()- startCpu, ' cpu used');
        
        for (let observer of room.find(FIND_MY_STRUCTURES, {filter: (s) =>
            s.structureType == STRUCTURE_OBSERVER
        })) {
            if (Game.time % 3 == 0) {
                //observer.observeRoom('W38S14');
            }
        }
        rbm.log('Observer Observations');
        /*
        var totalCostPerTick = 0;
        for (role in minNumberOfCreepsByRole) {
            totalCostPerTick += Game.spawns.Spawn3.findBodyCost(Game.spawns.Spawn3.buildBody(
                room.energyCapacityAvailable,
                roles[role].spawnInfo
            )) * minNumberOfCreepsByRole[role];
        }
        //console.log(totalCostPerTick);
        for (role in minNumberOfLongDistanceCreepsByRole) {
            let cost = Game.spawns.Spawn3.findBodyCost(Game.spawns.Spawn3.buildBody(
                room.energyCapacityAvailable,
                roles[role].spawnInfo
            ));
            for (let r in minNumberOfLongDistanceCreepsByRole[role]) {
                totalCostPerTick += cost * minNumberOfLongDistanceCreepsByRole[role][r];
            }
        }
        rbm.log('Calc Creep Costs Per Tick');
        */
        bm.log(`${room.name}`,rbm);
        //console.log(rbm.report());
        //console.log(totalCostPerTick / 1500);
    }
};