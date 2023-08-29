module.exports = {
    run: function(creep) {
        let cbm = new BM.cpu();
        
        if (creep.spawning) {
            cbm.log('Spawning');
            return;
        }
        if (creep.getBoosted()) {
            return;
        }
        if (!creep.memory.transit && creep.room.name == creep.memory.homeRoom && creep.ticksToLive < creep.memory.path.length * 2) {
            creep.memory.transit = true;
            creep.memory.role = 'retiree';
            return;
        }
        //console.log(creep.name);
        if (creep.memory.transit == true &&
        creep.store.getUsedCapacity() == 0) {
            creep.memory.transit = false;
            creep.memory.priority = 0;
            cbm.log('Change To False Transit');
        }
        else if (creep.memory.transit == false &&
        creep.store.getFreeCapacity() == 0) {
            //switch state
            creep.memory.transit = true;
            creep.memory.priority = 1;
            cbm.log('Change To True Transit');
        }
        cbm.log('Transit Testing');
    
        //if creep is transitting energy to spawn
        if (creep.memory.transit == true) {
            cbm.log('True Transit');
            if (creep.pos.isNearTo(Game.rooms[creep.memory.homeRoom].storage)) {
                cbm.log('True Transit Test Near Storage');
                if (!Memory.report) {
                    Memory.report = {};
                }
                if (!Memory.report.revenue) {
                    Memory.report.revenue = {};
                }
                if (!Memory.report.revenue[creep.memory.sourceRoom]) {
                    Memory.report.revenue[creep.memory.sourceRoom] = 0;
                }     
                Memory.report.revenue[creep.memory.sourceRoom] += creep.store.getUsedCapacity();
                cbm.log('Log Revenue');
                creep.transfer(creep.room.storage, RESOURCE_ENERGY);
                creep.memory.transit = false;
                creep.memory.priority = 0;
                cbm.log('Storage Xfer and Transit Change False');
                console.log(creep.moveByPath(creep.memory.path.slice(1)),creep.name);
                cbm.log('Xfer Reverse Path');
            }
            else if (creep.buildRoute == ERR_NAME_EXISTS) {
                cbm.log('True Transit Build Route')
                if (creep.moveByPath(creep.memory.path.slice().reverse().map((p) => new RoomPosition(p.x,p.y,p.roomName))) == ERR_NOT_FOUND) {
                    cbm.log('Test If Path and If Off Path');
                    //creep.moveTo(new RoomPosition(
                    //    creep.memory.path[0].x,
                    //    creep.memory.path[0].y,
                    //    creep.memory.path[0].roomName));
                    creep.moveTo(creep.pos.findClosestByPath(creep.memory.path.map((p) => new RoomPosition(p.x,p.y,p.roomName))));
                    cbm.log('Move Back To Path');
                };
                cbm.log('True Transit Move By Reverse Path');
            }
        }
        //if creep is collecting energy
        else {
            cbm.log('False Transit');
        
            let miningSpot = (Memory.sources[creep.memory.targetRoom].miningSpot) ?
            new RoomPosition(
                Memory.sources[creep.memory.targetRoom].miningSpot.x,
                Memory.sources[creep.memory.targetRoom].miningSpot.y,
                Memory.sources[creep.memory.targetRoom].miningSpot.roomName
            ) : new RoomPosition(
                creep.memory.path[creep.memory.path.length - 1].x,
                 creep.memory.path[creep.memory.path.length - 1].y,
                  creep.memory.path[creep.memory.path.length - 1].roomName);
            //console.log(miningSpot);
            cbm.log('False Transit Get Mining Spot');
            if (creep.pos.isNearTo(miningSpot)) {
                cbm.log('False Transit Test Near Mining Spot')
                creep.memory.sourceRoom = Game.getObjectById(creep.memory.targetRoom).room.name;
                cbm.log('Set Memory Source Room');
                let target = miningSpot.lookFor(LOOK_ENERGY)[0];
                cbm.log('Look For Energy');
                creep.collect(target);
                cbm.log('Collect Energy');
                creep.memory.transit = true;
                creep.memory.priority = 1;
                cbm.log('Transit Change True');
                if (creep.store.getUsedCapacity() == 0 || creep.buildRoute == ERR_NAME_EXISTS) {
                    creep.moveByPath(creep.memory.path.slice().reverse().map((p) => new RoomPosition(p.x,p.y,p.roomName)));
                    cbm.log('Empty or Route Exists Move By Reverse Path');
                }
            }
            else {
                /*
                let index = _.findIndex(creep.memory.path.map((p)=> new RoomPosition(p.x,p.y,p.roomName)),
                creep.pos);
                console.log(index + ' index');
                if (index == -1) {
                    console.log('no path');
                    console.log(creep.memory.path[0]);
                    creep.moveTo(creep.memory.path[0].x,creep.memory.path[0].y);
                }
                else {
                    creep.moveTo(new RoomPosition(
                        creep.memory.path[index+1].x,
                        creep.memory.path[index+1].y,
                        creep.memory.path[index+1].roomName));
                }
                */
                if (creep.memory.path &&
                    creep.moveByPath(creep.memory.path.map((p) => new RoomPosition(p.x,p.y,p.roomName))) == ERR_NOT_FOUND) {
                        cbm.log('Test If Path and If Off Path');
                    //creep.moveTo(new RoomPosition(
                    //    creep.memory.path[0].x,
                    //    creep.memory.path[0].y,
                    //    creep.memory.path[0].roomName));
                    creep.moveTo(creep.pos.findClosestByPath(creep.memory.path.map((p) => new RoomPosition(p.x,p.y,p.roomName))));
                    cbm.log('Move Back To Path');
                }
                cbm.log('Move By Path');
            }
        }
        let visualize = false;
        if (creep.memory.path && visualize) {
            creep.memory.path.reduce(function(last,current) {
                if (last.roomName == current.roomName) {
                    lastPos = new RoomPosition(last.x,last.y,last.roomName);
                    currentPos = new RoomPosition(current.x,current.y,current.roomName);
                    
                    new RoomVisual(current.roomName).line(
                        lastPos,
                        currentPos,
                        {
                            color: '#ffff00'
                        });
                    Game.map.visual.line(lastPos,currentPos, {
                        color: '#ffff00'
                    });
                }
                return current;
            });
            
            cbm.log(`Visualize Path ${creep.memory.path.length} Length`);
        }
        cbm.log(creep.name);
        //console.log(cbm.report());
    },
    
    spawnInfo: {
        'head': [WORK],
        'torso': [[CARRY,CARRY,MOVE]],
        'tail': [MOVE],
        'memory': {role:'long_distance_hauler.new', transit:false},
        'numberOfHeads': 1,
        'numberOfTails': 1,
        'boosts': {'carry': ['KH']}
    },
    
    spawnInstructions: function(info) {
        let home = info.home;
        console.log(home.storage.pos);
        let target = Game.getObjectById(info.target);
        console.log(target, target.memory.miningSpot);
        let spot = target.memory.miningSpot;
        
        let allowedRooms = {};
        allowedRooms[home.name] = true;
        
        let route = Game.map.findRoute(home.name, spot.roomName, {
            routeCallback: function(roomName) {
                
                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                let isHighway = (parsed[1] % 10 === 0) || 
                        (parsed[2] % 10 === 0);
                let isMyRoom = Game.rooms[roomName] &&
                    Game.rooms[roomName].controller &&
                    (Game.rooms[roomName].controller.my ||
                    Game.rooms[roomName].controller.reservation &&
                    Game.rooms[roomName].controller.reservation.username == MY_USERNAME);
                if (isHighway || isMyRoom) {
                    return 1;
                } else {
                    return 2.5;
                }
                if (Game.map.getRoomStatus(roomName).status != 'normal') return Infinity;
                if (roomName == 'W37S9') return Infinity;
            }
        });//.forEach(function(info) {
        //    allowedRooms[info.room] = true;
        //});
        
        route.forEach(function(info) {
            allowedRooms[info.room] = true;
        })
        
        console.log(route);
        
        console.log(JSON.stringify(allowedRooms));
        
        
        let pathInfo = PathFinder.search(
            home.storage.pos,
            {pos: new RoomPosition(spot.x,spot.y,spot.roomName), range: 1},
            {
                plainCost: 2,
                swampCost: 10,
                roomCallback: function(roomName) {
                    
                    let room = Game.rooms[roomName];
                    if (allowedRooms[roomName] == undefined) return false;
                    
                    let costs = new PathFinder.CostMatrix;
                    
                    if (room) {
                        room.find(FIND_STRUCTURES).forEach(function(s) {
                            if (s.structureType != STRUCTURE_CONTAINER &&
                            (s.structureType != STRUCTURE_RAMPART ||
                            !s.my) &&
                            s.structureType != STRUCTURE_STORAGE) {
                                costs.set(s.pos.x, s.pos.y, 255);
                                
                            if (s.structureType == STRUCTURE_ROAD) {
                                costs.set(s.pos.x, s.pos.y, 1);
                            }
                            }
                        });
                        room.find(FIND_FLAGS).forEach(function(f) {
                            if (f.color == COLOR_BROWN) {
                                costs.set(f.pos.x,f.pos.y,255)
                            }
                        });
                        let cont = Game.rooms[roomName].controller;
                        if (cont) {
                            let pos = cont.pos;
                            for (let x = -1; x <= 1; x++) {
                                for (let y = -1; y <= 1; y++) {
                                    costs.set(cont.pos.x - x,cont.pos.y - y,255);
                                }
                            }
                        }
                    }
                    
                    
                    
                    return costs;
                },
                maxOps: 4000
                
            }
        );
        if (pathInfo.incomplete) {
            Game.notify(`Spawning Error: ${JSON.stringify(target.memory.miningSpot)} Ops:${pathInfo.ops}`);
        }
        console.log(pathInfo.ops,pathInfo.cost,pathInfo.incomplete);
        let _path = pathInfo.path;
        
        _path.reduce(function(last,current) {
            if (last.roomName == current.roomName) {
                new RoomVisual(current.roomName).line(
                    last.x,last.y,
                    current.x,current.y);
            }
            return current;
        });
        console.log(_path.length);
        console.log(_path[_path.length - 1]);
        let lapLength = (_path.length - 1) * 2;    // Round trip length
        let energyMinedPerLap = lapLength * 10;    // Energy mined per round trip
        let carryParts = energyMinedPerLap / 50;   // Parts needed
        let maxTorsos = Math.ceil(carryParts / 2); // Parts / 2 parts per torso
        console.log(maxTorsos);
        let newMemory = {...module.exports.spawnInfo.memory,...{'path': _path}};
        return {...module.exports.spawnInfo,...{'maxTorsos':maxTorsos,'memory':newMemory}};
    }
};