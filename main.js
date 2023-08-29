var startCpu = Game.cpu.getUsed();
require('CONSTANTS');
require('prototype.spawn')();
require('prototype.creep')();
require('prototype.room')();
require('prototype.source')();
require('prototype.link')();
require('prototype.RoomPosition')();
require('prototype.container')();
console.log(Game.cpu.getUsed()-startCpu);
global.MY_USERNAME = 'Michael';
global.TICK_FREQ = 1;
//global.TRANSIT_AUTHORITY_ENABLED = true;

global.roleHarvester = require('role.harvester');
global.roleUpgrader = require('role.upgrader');
global.roleUpgraderOld = require('role.upgrader.old');
global.roleBuilder = require('role.builder');
global.roleRepairer = require('role.repairer');
global.roleDefender = require('role.defender');
global.roleWallRepairer = require('role.wall_repairer');
global.roleLongDistanceHarvester = require('role.long_distance_harvester');
global.roleClaimer = require('role.claimer');
global.roleReserver = require('role.reserver');
global.roleFiller = require('role.filler');
global.roleSorter = require('role.sorter');
global.roleHarvesterOld = require('role.harvester.old');
global.roleLongDistanceHauler = require('role.long_distance_hauler');
global.roleLongDistanceHaulerNew = require('role.long_distance_hauler.new');
global.roleRemoteMiner = require('role.remote_miner');
global.roleScout = require('role.scout');
global.roleSavior = require('role.savior');
global.roleHealer = require('role.healer');
global.roleGuard = require('role.guard');
global.roleDismantler = require('role.dismantler');
global.roleRoomDismantler = require('role.roomDismantler');
global.roleBulletsponge = require('role.bulletsponge');
global.roleLabTech = require('role.labTech');
global.roleBootStrapper = require('role.bootStrapper');
global.roleDepositMiner = require('role.depositMiner');
global.roleDepositHauler = require('role.depositHauler');
global.roleRetiree = require('role.retiree');
global.roleScavenger = require('role.scavenger');
global.roleHelper = require('role.helper');
global.roleMineralMiner = require('role.mineralMiner');
global.roleMineralHauler = require('role.mineralHauler');
global.roleUnclaimer = require('role.unclaimer')

global.managerBaseRoom = require('manager.base_room');
global.managerLabs = require('manager.labs');
global.LAB_PRODUCTS = managerLabs.LAB_PRODUCTS;
global.cu = require('console_utils');
global.utilities = require('utilities');
global.GameMap = require('Map');

Navigation = require('Navigation');
global.CombatNav = Navigation.CombatNav;
BM = require('Benchmark');
Regions = require('Regions');
Intel = require('Intel');
Game.notify(`Global Reset Tick: ${Game.time}`);

Recon = new Intel.segmentManager(0);
Object.keys(Game.rooms).forEach(room => Recon.store(room,Intel.roomSet(room)));
Recon.stringify();

Memory.bucket = 1000;

//Memory.rooms.W37S8.base = {center: {x: 13, y: 37}, controller: {x: 28, y: 43}};
//Memory.rooms.W37S8.links = {home: '5fceac457a0c4d4dc0c16caf', controller: '5fce8dabfb0e3dda34cb9014', sources: ['600cf697306ac67aa49f45ab','5ff0145178f87487a825e5c4']};
//Memory.rooms.W37S8.links.links = {'5fceac457a0c4d4dc0c16caf': {role: 'home'}, '5fce8dabfb0e3dda34cb9014': {role: 'controller'},
//'600cf697306ac67aa49f45ab': {role: 'source'}, '5ff0145178f87487a825e5c4': {role: 'source'}};
//Memory.rooms.W37S8.remoteRooms = ['W38S8','W37S7','W36S8','W36S9','W38S9']; //cut 'W37S6', 'W34S9', 'W36S7', 'W35S8
//Memory.rooms.W35S9.labs = {};


global.roles = {
    'harvester': roleHarvester,
    'harvester.old': roleHarvesterOld,
    'upgrader': roleUpgrader,
    'upgrader.old': roleUpgraderOld,
    'builder': roleBuilder,
    'repairer': roleRepairer,
    'defender': roleDefender,
    'guard': roleGuard,
    'wall_repairer': roleWallRepairer,
    'long_distance_harvester': roleLongDistanceHarvester,
    'claimer': roleClaimer,
    'reserver': roleReserver,
    'filler': roleFiller,
    'sorter': roleSorter,
    'long_distance_hauler': roleLongDistanceHauler,
    'long_distance_hauler.new': roleLongDistanceHaulerNew,
    'long_distance_hauler_new': roleLongDistanceHaulerNew,
    'remote_miner': roleRemoteMiner,
    'scout': roleScout,
    'savior': roleSavior,
    'healer' : roleHealer,
    'dismantler': roleDismantler,
    'roomDismantler': roleRoomDismantler,
    'bulletsponge': roleBulletsponge,
    'labTech': roleLabTech,
    'bootStrapper': roleBootStrapper,
    'depositMiner': roleDepositMiner,
    'depositHauler': roleDepositHauler,
    'retiree': roleRetiree,
    'scavenger': roleScavenger,
    'helper': roleHelper,
    'mineralMiner': roleMineralMiner,
    'mineralHauler': roleMineralHauler,
    'unclaimer': roleUnclaimer
};

//Howdy = 'Howdy';

module.exports.loop = function () {
    RawMemory.setActiveSegments([0]);
    if (Game.time % TICK_FREQ != 0 || Game.cpu.bucket < 100) {
        console.log("Bucket", Game.cpu.bucket);
        return;
    }
    if (Game.cpu.bucket < Memory.bucket) {
        //Memory.bucket = 3000;
        //console.log("Bucket", Game.cpu.bucket);
        //return;
    } else {
        Memory.bucket = 1000;
    }
    bm = new BM.cpu(false);
    if (Game.time % 10 == 0) {
        //clear memory
        startCpu = Game.cpu.getUsed();
        for (let name in Memory.creeps) {
            if (Game.creeps[name] == undefined || !(Game.creeps[name].spawning || Game.creeps[name].ticksToLive > 0)) {
                //delete Memory.rooms.W37S8.freeCreeps[Memory.creeps[name].role][name];
                delete Memory.creeps[name];
                /*
                for (let room in Memory.rooms) {
                    if (Memory.rooms[room].freeCreeps.length) {
                        for (let role in Memory.rooms[room].freeCreeps) {
                            console.log(Memory.rooms[room].freeCreeps[role]);
                        }
                    }
                
                */
                console.log(name + '\'s memory will not live on. It just got deleted');
            }
        }
        
        bm.log('Dead Creep Memory Clear');
        //console.log(Game.cpu.getUsed()-startCpu);
    }
    if (Game.time % 150 == 0) {
        for (let room in Memory.rooms) {
            //console.log('room',room);
            if (Memory.rooms[room].combatNav) {
                delete Memory.rooms[room].combatNav;
            }
        }
        if (Memory.Regions) delete Memory.Regions;
        bm.log('Combat Nav Cleanup');
    }
    Navigation.TransitAuthorities = [];
    bm.log('Cleanup TransitAuthorities');
    //var startCpu = Game.cpu.getUsed();
    let creepBM = new BM.cpu(elaborate = false);
    //for each creep name in Game.creeps
    Memory.creeps;
    creepBM.log('Load creep memory');
    global.creepCount = {local:{},foreign:{}};
    let roleCount = {};
    for (let name in Game.creeps) {
        //var creepCpu = Game.cpu.getUsed();
        //get creep object
        var creep = Game.creeps[name];
        roleCount[creep.memory.role] = roleCount[creep.memory.role] || 0;
        roleCount[creep.memory.role] += 1;
        //creep.say(creep.memory.role);
        
        //if creep.role matches a set role, run that creep's role
        //var startCpu = Game.cpu.getUsed();
        if (roles[creep.memory.role]) {
            
            if ((Game.time % 5 != 2 || Game.time % 5 != 3) && creep.memory.replaceEarly && !creep.spawning && creep.ticksToLive <= (creep.body.length * CREEP_SPAWN_TIME)) {}
            else if (creep.hits > 0 && creep.memory.homeRoom && creep.memory.homeRoom) {
                if (creep.memory.targetRoom) {
                    creepCount.foreign[creep.memory.homeRoom] = creepCount.foreign[creep.memory.homeRoom] || {};
                    creepCount.foreign[creep.memory.homeRoom][creep.memory.role] = creepCount.foreign[creep.memory.homeRoom][creep.memory.role] || {};
                    creepCount.foreign[creep.memory.homeRoom][creep.memory.role][creep.memory.targetRoom] = creepCount.foreign[creep.memory.homeRoom][creep.memory.role][creep.memory.targetRoom] || 0;
                    creepCount.foreign[creep.memory.homeRoom][creep.memory.role][creep.memory.targetRoom] += 1;
                } else {
                    creepCount.local[creep.memory.homeRoom] = creepCount.local[creep.memory.homeRoom] || {};
                    creepCount.local[creep.memory.homeRoom][creep.memory.role] = creepCount.local[creep.memory.homeRoom][creep.memory.role] || 0;
                    creepCount.local[creep.memory.homeRoom][creep.memory.role] += 1;
                }
            }
            
            try {
                roles[creep.memory.role].run(creep);
            }
            catch(err) {
                console.log(name,err);
                Game.notify(creep.name);
                Game.notify(err);
                //throw err;
            }
           //roles[creep.memory.role].run(creep);
        }
        creepBM.log(`${name}`);
        
        /*
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
            case 'guard':
                roleGuard.run(creep);
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
            case 'scout':
                roleScout.run(creep);
                break;
            case 'savior':
                roleSavior.run(creep);
                break;
            case 'healer':
                roleHealer.run(creep);
                break;
            case 'dismantler':
                roleDismantler.run(creep);
                break;
            case 'long_distance_hauler.new':
                roleLongDistanceHaulerNew.run(creep);
                break;
        }
        */
        
        //var endCpu = Game.cpu.getUsed();
        //var cpuUsed = endCpu - startCpu;
        //console.log('%s %s: %s cpu used', creep.role, creep.name, endCpu);
        //console.log(creep.memory.role, creep.name,creep.memory.transit, ': ', endCpu - creepCpu, ' cpu used');
    }
    console.log(JSON.stringify(roleCount));
    bm.log('Creeps',creepBM);
    //console.log(JSON.stringify(creepCount));
    let TAbm = new BM.cpu(enumerate = true);
    //console.log(`Creeps: ${cpuUsed} cpu used`);
    for (let TA of Navigation.TransitAuthorities) {
        let subTAbm = new BM.cpu(false);
        TA.process();
        subTAbm.log('Process Requests');
        TA.resolve();
        subTAbm.log('Resolve Request Conflicts');
        TA.execute();
        subTAbm.log('Execute Requests');
        TAbm.log(`${TA.roomName}`,subTAbm);
    }
    bm.log('Transit Authorities', TAbm);
    
    startCpu = Game.cpu.getUsed();
    var baseRooms = [];
    for (let spawn in Game.spawns) {
        if (!(baseRooms.includes(Game.spawns[spawn].room.name))) {
            baseRooms.push(Game.spawns[spawn].room.name);
        }
    }
    
    for (let room in Memory.rooms) {
        //console.log(room);
        if (Memory.rooms[room]) {
            //console.log('room');
            if (Memory.rooms[room].orders) {
                //console.log('orders');
                if (Memory.rooms[room].orders.hold) {
                    //console.log('hold');
                    Memory.rooms[room].orders.hold = false;
                }
            }
        }
    }
    for (let base of baseRooms) {
        if (Game.cpu.bucket >= Memory.bucket) {
            managerBaseRoom.run(Game.rooms[base]);
        } else {
            Memory.bucket = 1500;
        }
    }
    if (Game.time % 2000 == 0) {
        let report = {};
        let report2 = {};
        let revenue = Memory.report.revenue;
        let expenses = Memory.report.expenses;
        let profit = {};
        let ppt = {};
        for (let room in Memory.report.revenue) {
            profit[room] = Memory.report.revenue[room];
        }
        for (let room in Memory.report.expenses) {
            if (!profit[room]) {
                profit[room] = 0;
            }
            profit[room] -= Memory.report.expenses[room];
        }
        for (let room in profit) {
            ppt[room] = profit[room] / 2000;
        }
        
        revenue.total = (Object.keys(revenue).length) ? Object.values(revenue).reduce(function(a,b) {
        return a + b}) : 0;
        expenses.total = (Object.keys(expenses).length) ? Object.values(expenses).reduce(function(a,b) {
        return a + b}) : 0;
        profit.total = revenue.total - expenses.total;
        ppt.total = (Object.keys(ppt).length) ? Object.values(ppt).reduce(function(a,b) {
        return a + b}) : 0;
        var dt = new Date();
        var utcDate = dt.toUTCString();
        report = {
            time: {tick: Game.time, date: utcDate},
            revenue: revenue,
            expenses: expenses,
            profit: profit
        };
        report2 = {
            profit_per_tick: ppt
        }
        let notification = '';
        let notification2 = ''
        for (let category in report) {
            notification = notification.concat(category, ':\n');
            for (let data in report[category]) {
                notification = notification.concat('\t', data, ': ', report[category][data], '\n');
            }
        }
        for (let category in report2) {
            notification2 = notification2.concat(category, ':\n');
            for (let data in report2[category]) {
                notification2 = notification2.concat('\t', data, ': ', report2[category][data], '\n');
            }
        }
        console.log(notification);
        Game.notify(notification);
        console.log(notification2);
        Game.notify(notification2);
        //Game.notify(JSON.stringify(report));
        Memory.report.revenue = {};
        Memory.report.expenses = {};
    }
    endCpu = Game.cpu.getUsed();
    cpuUsed = endCpu - startCpu;
    //console.log('bases', ': ', endCpu - startCpu, ' cpu used');
    console.log(bm.report());
    console.log('Bucket:',Game.cpu.bucket);
    console.log('Tick: ', Game.time);
    
    //for (let x = 0; x < 50; x++) {
    //    for (let y = 0; y < 50; y++) {
            //Game.rooms.W37S8.visual.text((x + y) % 4, x, y, {color: '#00ffff'});
            //Game.rooms.W37S8.visual.text(Math.ceil(Math.sqrt(x * 50 + y)), x, y, {color: '#00ffff'});
    //    }
    //}
    //console.log(JSON.stringify(roleRoomDismantler.spawnInstructions({home:'W37S8',target:'W35S7'})));
    
    //console.log(JSON.stringify(roleRoomDismantler.spawnInstructions({home:'W37S8',target:'W38S7'})));
    
    
    //console.log(Game.rooms.W38S7.damageMap(true).get(21,19));
    //Game.rooms.W38S7.damageMap(true).visualize();
    //cn = new Navigation.CombatNav('W38S7');
    //cn.towerMap
    
    
    //let reg = new Regions.Regions('W37S8');
    //reg = new Regions.Regions('W38S7');
    //reg.test();
    //console.log(JSON.stringify(reg.spots));
    //reg = new Regions.Regions('W38S7');
    //reg.test();
    
    /*
    var m1 = new utilities.roomMatrix('W0S0');
    m1.set(0,0,10).set(0,1,5).set(1,0,2).set(1,1,7);
    var m2 = new utilities.roomMatrix('W0S0');
    m2.set(0,0,6).set(0,1,3).set(1,0,1).set(1,1,7);
    var m3 = m1.combine(m2);
    for (let x in m3.matrix) {
        for (let y in m3.matrix[x]) {
            console.log(`${m1.get(x,y)} + ${m2.get(x,y)} = ${m3.get(x,y)}`);
        }
    }
    console.log(JSON.stringify(m1));
    console.log(JSON.stringify(m2));
    console.log(JSON.stringify(m3));
    console.log(`m1 ${m1.get(0,0)}`);
    m3.set(0,0,15);
    console.log(`m1 ${m1.get(0,0)} m3 ${m3.get(0,0)}`)
    */
    /*
    let visCPU = Game.cpu.getUsed();
    let map = Game.rooms.W37S8.damageMap(false);
    Game.notify(`Map CPU: ${Game.cpu.getUsed() - visCPU}`);
    map.visualize();
    Game.notify(`Visual CPU: ${Game.cpu.getUsed() - visCPU}`);
    */
    
    if (Game.rooms.sim) {
        let simCPU = new Date();
        let nav = new Navigation.CombatNav('sim');
        let fMap = nav.damageMap();
        let navCPU = new Date();
        fMap.visualize();
        let visCPU = new Date();
        console.log(`Nav CPU: ${navCPU - simCPU}\nVis CPU: ${visCPU - navCPU}`);
        /*
        for (let x=0;x<50;x++) {
            for (let y=0;y<50;y++) {
                let opac = (dMap.max() > 0 ? dMap.get(x,y)/dMap.max() : 0);
                let color_strength = '#'.concat(Math.ceil(opac*255).toString(16).concat('0000'));
                //console.log(color_strength);
                Game.rooms.sim.visual.rect(x-.5,y-.5,1,1,{fill:color_strength,opacity:.4});
                //console.log(`${dMap.max()} max, ${dMap.get(x,y)} this, ${dMap.get(x,y)/dMap.max()} ratio`);
                //Game.rooms.sim.visual.text(opac,x,y);
                //Game.rooms.sim.visual.rect(x-.5,y-.5,1,1,{fill:COLOR_RED,opacity:opac});
                //console.log(Game.rooms.sim.visual.export());
            }
        }
        
        let a = ['1','2','3','4','5'];
        let b = ['1','2','3','4','5'];
        console.log(a.every(i=>b.includes(i)));
        console.log(b.every(i=>a.includes(i)));
        console.log(a.every(i=>b.includes(i)) && b.every(i=>a.includes(i)))
        
        
        let costs = new PathFinder.CostMatrix;
        costs.set(1,1,15);
        console.log(costs.serialize());
        
        var m4 = new utilities.roomMatrix('W1S1');
        m4.set(0,0,1).set(0,1,2).set(1,0,3).set(1,1,0);
        let s_data = m4.serialize();
        m4 = utilities.matrixDeserialize(s_data);
        console.log(m4.roomName, m4.get(1,4));
        */
        
        let path = nav.navigate(1,48,
            new RoomPosition(48,1, 'sim'),
	        0, 10000);
	    Game.rooms.sim.visual.poly(path.path);
	    console.log(path.cost, path.incomplete);
    }
    
    //roleLongDistanceHaulerNew.spawnInstructions({home:Game.rooms.W37S8,target:'5bbcaae79099fc012e632671'});
};