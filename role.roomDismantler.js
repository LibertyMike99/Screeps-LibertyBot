let dismantler = require('role.dismantler');
//let CombatNav = require('Navigation').CombatNav;

module.exports = {
    run: function(creep) {
        let cbm = new BM.cpu();
        cbm.log(creep.name);
        if (creep.getBoosted()) {
            return;
        }
        cbm.log('boosted test');
        if (creep.spawning) {
            return;
        }
        cbm.log('spawning test');
        if (creep.room.name != creep.memory.targetRoom) {
            if (creep.hits < creep.hitsMax) {
                creep.say('stay home');
                creep.heal(creep);
                creep.clearExit()
                return;
            }
            cbm.log('not in target room');
            //console.log('not in target room!');
            let rooms = creep.memory.route.map(r => r.room);
            //console.log(creep.memory.route.map(r => r));
            //console.log(rooms[rooms.indexOf(creep.room.name) + 1]);
            //let exit = (4 + creep.memory.route[rooms.indexOf(creep.room.name)].exit) % 8;
            //console.log('---\n',creep.name,'exitDir:',exit,'\n---');
            let pos;
            if (creep.memory.path.length) {
                pos = new RoomPosition(creep.memory.path[0][0],creep.memory.path[0][1],creep.memory.targetRoom) //creep.pos.findClosestByPath(exit);
            } else {
                pos = new RoomPosition(25,25,creep.memory.targetRoom);
            }
            //let pos = (creep.memory.path.length) ? new RoomPosition(creep.memory.path[0][0], creep.memory.path[0][1], creep.memory.targetRoom) : new RoomPosition(25,25, creep.memory.targetRoom);
            creep.moveTo(pos,{ignoreCreeps:true,reusePath: 50,avoid:creep.room.find(FIND_HOSTILE_CREEPS)});
            cbm.log('move to obstacle');
            let squad = creep.room.find(FIND_MY_CREEPS,{filter: (c) => {
                return c.memory.role == creep.memory.role && c.memory.targetRoom == creep.memory.targetRoom &&
                c.name != creep.name && c.pos.x != 0 && c.pos.x != 49 && c.pos.y != 0 && c.pos.y != 49 && 
                c.pos.y != 0 && c.pos.y != 49 && creep.memory.homeRoom == c.memory.homeRoom;
            }});
            cbm.log('find squad');
            //console.log(squad);
            let nearest = creep.pos.findClosestByPath(squad);
            //console.log(nearest);
            cbm.log('find nearest');
            if (creep.pos.getRangeTo(nearest) > 2 && creep.pos.x != 0 && creep.pos.x != 49 &&
            creep.pos.y != 0 && creep.pos.y != 49) {
                creep.moveTo(nearest,{ignoreCreeps:true});
                //console.log('Move to nearest squad');
                cbm.log('move to nearest if not adjacent');
            }
            cbm.log('test if not adjacent');
            creep.heal(creep);
            cbm.log('heal self');
        } else if (creep.memory.tag && false) {
            if (creep.signController(creep.room.controller, "Tag, you're it!") == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            if (creep.room.controller.sign && creep.room.controller.sign.text == "Tag, you're it!") {
                creep.say('My job here is done!');
                Memory.rooms[creep.memory.homeRoom].siegeRooms = _.filter(Memory.rooms[creep.memory.homeRoom].siegeRooms,(r) => r != creep.memory.targetRoom);
                Memory.rooms[creep.memory.homeRoom].attackRooms = Memory.rooms[creep.memory.homeRoom].attackRooms || [];
                Memory.rooms[creep.memory.homeRoom].attackRooms.push(creep.memory.targetRoom);
                dismantler.run(creep);
            }
        } else {
            if (!creep.getActiveBodyparts(WORK)) {
                creep.moveTo(new RoomPosition(25,25,creep.memory.homeRoom));
                creep.heal(creep);
                return;
            }
            cbm.log('in target room');
            var target;
            for (let node of creep.memory.path) {
                //console.log(node);
                let structs = creep.room.lookForAt(LOOK_STRUCTURES,node[0],node[1]);
                //console.log(structs);
                if (structs.length) {
                    target = structs[0];
                    //console.log(structs[0]);
                    break;
                }
            }
            cbm.log('target first obstacle');
            //creep.heal(creep);
            //creep.say('Heal Self');
            if (target) {
                cbm.log('there is an obstacle');
                //console.log(`${creep.name} found target`);
                //console.log(typeof target);
                //console.log('dismantle',creep.dismantle(target));
                let result = creep.dismantle(target);
                cbm.log(`dismantle target: ${result}`);
                creep.say(result == OK);
                if (result != OK && !creep.room.controller.safeMode) {
                    cbm.log('result not ok, or room in safe mode');
                    /*
                    let pf = PathFinder.search(creep.pos,{pos: target.pos, range: 1}, {
                        roomCallback: function(roomName) {
                    
                            let room = Game.rooms[roomName];
                            if (!room) return;
                            let costs = new PathFinder.CostMatrix;
                            room.find(FIND_CREEPS).forEach((c) => costs.set(c.pos.x, c.pos.y, 255));
                            room.find(FIND_STRUCTURES).forEach((s) => {
                                if (s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTAINER) {
                                    costs.set(s.pos.x,s.pos.y,255);
                                }
                            });
                            
                            return costs;
                        }
                    }); 
                    
                    let pf = creep.memory.pf;
                    if (!pf) {
                        creep.say('no pf!');
                        let cn = new CombatNav(creep.memory.targetRoom);
                        pf = cn.navigate(creep.pos.x,creep.pos.y,
                            {pos: target.pos, range: 1},
                            creep.body.reduce((total,part) => {
                                let val = total
                                if (part.type == HEAL && part.hits > 0) {
                                    let boostAmt = 50;
                                    if (part.boost) {
                                        boostAmt * BOOSTS.heal[part.boost].heal;
                                    }
                                    val += boostAmt
                                }
                                return val;
                            }, 0) / 0.3,
                            1,
                            false,
                            creep.memory.targetRoom
                        );
                        creep.memory.pf = pf;
                    }
                    if (pf.incomplete) {
                        console.log('path incomplete', pf.path, pf.ops, pf.cost);
                        */
                    if (creep.moveTo(target,{ignoreRoads: true, avoid: creep.room.find(FIND_CREEPS)}) == ERR_NO_PATH) {
                        cbm.log('no path to obstacle');
                        if (creep.hits == creep.hitsMax) {
                            cbm.log('creep at full health');
                            let squad = creep.room.find(FIND_MY_CREEPS,{filter: (c) => {
                                return c.memory.role == creep.memory.role && c.memory.targetRoom == creep.memory.targetRoom &&
                                c.name != creep.name;
                            }});
                            cbm.log('find squad');
                            //console.log(squad);
                            let near = _.filter(squad,(c) => {
                                return (creep.pos.isNearTo(c) || creep.pos.isEqualTo(c)) && c.hits < c.hitsMax
                            });
                            //console.log(near);
                            cbm.log('find near');
                            if (near.length) {
                                cbm.log('there are neighbors');
                                creep.heal(near.reduce((most,test) => {
                                    let diff = (most.hitsMax - most.hits) - (test.hitsMax - test.hits);
                                    if (diff < 0) {
                                        return test;
                                    } else {
                                        return most;
                                    }
                                }));
                                cbm.log('heal most hurt neighbor');
                                creep.say('Heal Other, Hurt');
                            } else {
                                creep.heal(creep);
                                creep.say('Heal Self, No Near');
                                cbm.log('heal self, no hurt neighbor');
                            }
                        } else {
                            cbm.log('creep hurt');
                            creep.heal(creep);
                            creep.say('Heal Self, Hurt');
                            cbm.log('heal self');
                        }
                    } else {
                        creep.heal(creep);
                        cbm.log('there is path, heal self');
                        //console.log('path',pf.path);
                        //creep.moveByPath(pf.path);
                    }
                }
                
                let cn = new CombatNav(creep.memory.targetRoom);
                cbm.log('create CombatNav');
                let spotDamage = cn.damageMap().get(creep.pos.x,creep.pos.y);
                cbm.log('get spot damage');
                //let spotDamage = creep.room.damageMap(true).get(creep.pos.x,creep.pos.y);
                if (creep.damagePotential(spotDamage,spotDamage) >= creep.body.reduce((total,part) => {
                    let val = total
                    if (part.type == HEAL && part.hits > 0) {
                        let boostAmt = 50;
                        if (part.boost) {
                            boostAmt *= BOOSTS.heal[part.boost].heal;
                        }
                        val += boostAmt
                    }
                    return val;
                }, 0)) {
                    cbm.log('cannot withstand not healing');
                    creep.cancelOrder('dismantle');
                    creep.heal(creep);
                    cbm.log('heal self');
                } else {
                    cbm.log('can withstand not healing');
                    Game.notify(`spot damage: ${spotDamage}\ndamage potential: ${creep.damagePotential(spotDamage)}\nnext damage: ${creep.damagePotential(spotDamage,spotDamage)}`);
                }
                cbm.log('test if can withstand not healing');
                
            } else {
                cbm.log('there is no obstacle');
                if (false && (!creep.room.controller.sign || creep.room.controller.sign.text != "Tag, you're it!" && 
                creep.signController(creep.room.controller, "Tag, you're it!") == ERR_NOT_IN_RANGE)) {
                    creep.moveTo(creep.room.controller);
                    creep.heal(creep);
                    creep.say('sign');
                } else if (true || creep.room.controller.sign && creep.room.controller.sign.text == "Tag, you're it!") {
                    //console.log('Already!');
                    //Memory.rooms[creep.memory.homeRoom].siegeRooms = _.filter(Memory.rooms[creep.memory.homeRoom].siegeRooms,(r) => r != creep.memory.targetRoom);
                    //Memory.rooms[creep.memory.homeRoom].attackRooms = Memory.rooms[creep.memory.homeRoom].attackRooms || [];
                    //Memory.rooms[creep.memory.homeRoom].attackRooms.push(creep.memory.targetRoom);
                    //dismantler.run(creep);
                    //Memory.rooms[creep.memory.homeRoom].attackRooms = _.filter(Memory.rooms[creep.memory.homeRoom].attackRooms,(r) => r != creep.memory.homeRoom);
                    //creep.suicide();
                    let dismantleOrder = [[STRUCTURE_TOWER,STRUCTURE_SPAWN,STRUCTURE_POWER_SPAWN,
                    STRUCTURE_NUKER,STRUCTURE_LINK,STRUCTURE_EXTENSION,STRUCTURE_RAMPART,STRUCTURE_WALL],[STRUCTURE_RAMPART,STRUCTURE_WALL]];
                    //dismantleOrder = [STRUCTURE_LINK,STRUCTURE_EXTENSION];
                    let targs;
                    for (let sType of dismantleOrder) {
                        console.log(sType);
                        if (Array.isArray(sType)) {
                            targs = creep.room.find(FIND_STRUCTURES, {filter: (s) => sType.includes(s.structureType)});
                            if (targs.length > 0) {
                                break;
                            } else if (sType.includes(STRUCTURE_TOWER)) {
                                Memory.rooms[creep.memory.homeRoom].scavengeRooms = Memory.rooms[creep.memory.homeRoom].scavengeRooms || [];
                                if (!Memory.rooms[creep.memory.homeRoom].scavengeRooms.includes(creep.room.name)) {
                                    Memory.rooms[creep.memory.homeRoom].scavengeRooms.push(creep.room.name);
                                }
                            }
                        } else {
                            targs = creep.room.find(FIND_STRUCTURES, {filter: {structureType: sType}});
                            if (targs.length > 0) {
                                break;
                            } else if (sType == STRUCTURE_TOWER) {
                                Memory.rooms[creep.memory.homeRoom].scavengeRooms = Memory.rooms[creep.memory.homeRoom].scavengeRooms || [];
                                if (!Memory.rooms[creep.memory.homeRoom].scavengeRooms.includes(creep.room.name)) {
                                    Memory.rooms[creep.memory.homeRoom].scavengeRooms.push(creep.room.name);
                                }
                            }
                        }
                    }
                    /*
                    let targs = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (s) => {
                        return dismantleOrder.includes(s.structureType) && s.hits > 0;
                    }}).sort((first,second) => {
                        if (dismantleOrder.indexOf(second) < dismantleOrder.indexOf(first)) {
                            return second;
                        }
                        return first;
                    });
                    */
                    let targ = creep.pos.findClosestByPath(targs);
                    //console.log(creep.name,targ);
                    if (targ && !creep.pos.isNearTo(targ)) {
                        creep.moveTo(targ);
                        creep.heal(creep);
                    } else {
                        creep.dismantle(targ);
                    }
                    
                }
            }
        }
        if (creep.hits == creep.hitsMax) {
            let squad = creep.room.find(FIND_MY_CREEPS,{filter: (c) => {
                return c.memory.role == creep.memory.role && c.memory.targetRoom == creep.memory.targetRoom &&
                c.name != creep.name;
            }});
            //console.log(squad);
            let near = _.filter(squad,(c) => {
                return (creep.pos.isNearTo(c) || creep.pos.isEqualTo(c)) && c.hits < c.hitsMax
            });
            //console.log(near);
            if (near.length) {
                creep.heal(near.reduce((most,test) => {
                    let diff = (most.hitsMax - most.hits) - (test.hitsMax - test.hits);
                    if (diff < 0) {
                        return test;
                    } else {
                        return most;
                    }
                }));
            } else {
                //creep.heal(creep);
            }
        } else {
            let cn = new CombatNav(creep.memory.targetRoom);
            let spotDamage = cn.towerMap().get(creep.pos.x,creep.pos.y);
            //let spotDamage = creep.room.damageMap(true).get(creep.pos.x,creep.pos.y);
            if (creep.damagePotential(spotDamage,spotDamage) > creep.body.reduce((total,part) => {
                let val = total
                if (part.type == HEAL && part.hits > 0) {
                    let boostAmt = 50;
                    if (part.boost) {
                        boostAmt * BOOSTS.heal[part.boost].heal;
                    }
                    val += boostAmt
                }
                return val;
            }, 0)) {
                creep.cancelOrder('dismantle');
                creep.heal(creep);
            }
            //creep.heal(creep);
        }
        console.log(cbm.report());
        if (cbm.total > 20) {
            Game.notify(cbm.report());
        }
    },
    
    spawnInfo: {
        'head': [WORK],
        'torso': [HEAL],
        'tail': [MOVE],
        'numberOfTails': 25,
        'memory': {role:'roomDismantler',priority:4},
        'boosts': {
            //heal: [RESOURCE_LEMERGIUM_OXIDE,RESOURCE_LEMERGIUM_ALKALIDE,RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE],
            //tough: [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]
        },
        'moveSpeed':1,
    },
    
    spawnInstructions: function(info) {
        let home = info.home;
        let target = info.target;
        console.log(home,target);
        let room = Game.rooms[target];
        if (room) {
            let baseTarg = room.controller || room.storage || room.terminal || room.find(FIND_HOSTILE_SPAWNS)[0];
            let graph = new Regions.RoomGraph(target);
            
            let route = Game.map.findRoute(target, home, {
                routeCallback: function(roomName) {
                    
                    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    let isHighway = (parsed[1] % 10 === 0) || 
                            (parsed[2] % 10 === 0);
                    let isSourceKeeper = (parsed[1] % 10 <= 6 && parsed[1] % 10 >= 4) && 
                        (parsed[2] % 10 <= 6 && parsed[2] % 10 >= 4);
                    let isMyRoom = Game.rooms[roomName] &&
                        Game.rooms[roomName].controller &&
                        (Game.rooms[roomName].controller.my ||
                        Game.rooms[roomName].controller.reservation &&
                        Game.rooms[roomName].controller.reservation.username == 'LibertyMike');
                    if (isHighway || isMyRoom) {
                        return 1;
                    } else {
                        return 2.5;
                    }
                    //if (isSourceKeeper) return Infinity;
                    if (Game.map.getRoomStatus(roomName).status != 'normal') return Infinity;
                    if (roomName == 'W37S9') return Infinity;
                }
            });
            console.log(JSON.stringify(route));
            let exit = route[0].exit;
            console.log(route[0].room,route[0].exit);
            
            let nav = graph.navigate(baseTarg.pos,exit);
            console.log('wallPaths',JSON.stringify(graph.wallGraphs));
            let cost = nav.cost;
            if (cost <= 3 && false) {
                return {
                    'memory': {role:'roomDismantler',priority:4},
                    'head' : [HEAL],
                    'torso' : [WORK],
                    'tail' : [MOVE],
                    'numberOfHeads' : 24,
                    'numberOfTails' : 25,
                    'path': [],
                    'tag': true
                }
            }
            let path = nav.path;
            //console.log(path[0]);
            //console.log(baseTarg.pos.x,baseTarg.pos.y,path,cost);
            //console.log(graph.regions.spots[baseTarg.pos.x * 50 + baseTarg.pos.y]);
            let wallPaths = [];
            path.forEach((reg,idx,arr) => {
                //console.log(reg);
                //console.log('idx',idx);
                if (idx == arr.length - 1) {
                    return;
                }
                //console.log([arr[idx - 1]],[arr[idx + 1]]);
                if (graph.wallGraphs[reg]) {
                    //console.log(graph.wallGraphs[reg]);
                    if (graph.wallGraphs[reg][arr[idx - 1]]) {
                        //console.log(JSON.stringify(graph.wallGraphs[reg][arr[idx - 1]]))
                        if (graph.wallGraphs[reg][arr[idx - 1]][arr[idx + 1]]) {
                            //console.log('PATH:\n',graph.wallGraphs[reg][arr[idx - 1]][arr[idx + 1]].path);
                            wallPaths = wallPaths.concat(_.filter(graph.wallGraphs[reg][arr[idx - 1]][arr[idx + 1]].path,(n) => n != 'start' && n != 'finish'));
                        }
                    }
                }
            });
            /*
            if (!wallPaths.length) {
                let creep.room = Game.rooms[target];
                let targs = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_TERMINAL}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_LAB}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_EXTRACTOR}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_FACTORY}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_POWER_SPAWN}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_OBSERVER}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_NUKER}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}})).concat(
                    creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}}));
                wallPaths = targs.map(s => [s.pos.x,s.pos.y]);
            }
            */
            console.log('paths',wallPaths.length);
            let cn = new CombatNav(target);
            let towerMap = cn.towerMap();
            //let towerMap = Game.rooms[target].damageMap(true);
            //console.log(wallPaths)
            
            /*
            let max = wallPaths.reduce((max,check) => {
                maxAmount = towerMap.get(Math.floor(max / 50), max % 50);
                checkAmount = towerMap.get(Math.floor(check / 50), check % 50);
                console.log(maxAmount,checkAmount);
                max = (maxAmount >= checkAmount) ? max : check;
                return max;
            });
            */
            
            //let maxDamage = towerMap.get(Math.floor(max / 50), max % 50);
            let availableBoosts = {};
            if (home.labs) {
                home.labs.forEach((lab) => {
                    if (lab.mineralType) {
                        availableBoosts[lab.mineralType] = availableBoosts[lab.mineralType] || 0;
                        availableBoosts[lab.mineralType] += lab.store.getUsedCapacity(lab.mineralType);
                    }
                });
            }
            for (let boost in availableBoosts) {
                availableBoosts[boost] = Math.floor(availableBoosts[boost] / LAB_BOOST_MINERAL);
            }
            
            let boosts = {};
            
            let maxDamage = towerMap.max();
            console.log('maxDamage',maxDamage);
            let toughs = 0;
            let toughBoost = undefined;
            if (availableBoosts[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] ||
            availableBoosts[RESOURCE_GHODIUM_ALKALIDE]) {
                [damageMod,toughBoost] = availableBoosts[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] ? 
                [0.3,RESOURCE_CATALYZED_GHODIUM_ALKALIDE] : [0.5,RESOURCE_GHODIUM_ALKALIDE];
                maxDamage *= damageMod;
                toughs = Math.ceil(maxDamage / 100);
            }
            let [moveQuotient,moveBoost] = availableBoosts[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] ? [4,RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] :
                availableBoosts[RESOURCE_ZYNTHIUM_ALKALIDE] ? [3,RESOURCE_ZYNTHIUM_ALKALIDE] :
                availableBoosts[RESOURCE_ZYNTHIUM_OXIDE] ? [2,RESOURCE_ZYNTHIUM_OXIDE] : [1,undefined];
                
            let movesNeeded = Math.ceil(50 / (moveQuotient * module.exports.spawnInfo.moveSpeed + 1));
                
            let healBoosts = [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,RESOURCE_LEMERGIUM_ALKALIDE,RESOURCE_LEMERGIUM_OXIDE].filter(
                value => Object.keys(availableBoosts).includes(value));
                
            let workBoost = availableBoosts[RESOURCE_CATALYZED_ZYNTHIUM_ACID] ? RESOURCE_CATALYZED_ZYNTHIUM_ACID :
                availableBoosts[RESOURCE_ZYNTHIUM_ACID] ? RESOURCE_ZYNTHIUM_ACID :
                availableBoosts[RESOURCE_ZYNTHIUM_HYDRIDE] ? RESOURCE_ZYNTHIUM_HYDRIDE : undefined;
                
            let healsNeeded = Math.ceil(maxDamage / HEAL_POWER);
            let heads = Math.max(5, 50 - movesNeeded - healsNeeded);
            
            if (toughs > 0 && toughBoost) {
                boosts[toughBoost] = toughs;
            }
            if (moveBoost) {
                boosts[moveBoost] = movesNeeded;
            }
            if (workBoost) {
                boosts[workBoost] = heads;
            }
            if (healBoosts.length) {
                module.exports.spawnInfo.boosts.heal = healBoosts;
            }
            
            let torsos = 50 - movesNeeded - heads - toughs;
            //[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = heads;
            //boosts[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = 10;
            
            
            let newMemory = {...module.exports.spawnInfo.memory,...{'path': wallPaths.map((p) => [Math.floor(p / 50), p % 50]),
            'route': route.reverse()}};
            return {...module.exports.spawnInfo,...{'numberOfToughs':toughs,'numberOfHeads':heads,'maxTorsos':healsNeeded,'numberOfTails':movesNeeded,'memory':newMemory,'adtlBoosts':boosts}};
            
        } else {
            return module.exports.spawnInfo;
        }
    },
    
    spawnCheck: function(info) {
        
    }
};