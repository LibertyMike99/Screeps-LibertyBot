module.exports.Regions = function(roomName) {
    this.roomName = roomName;
    this.regions = [];
    this.wallRegions = [];
    this.exitRegions = [];
    this.borders = {};
    this.ids = [];
    

    var Region = function(id,edges = [], internal = []) {
        this.id = id;
        this.edges = edges;
        this.internal = internal;
        this.addEdge = function(index) {
            this.edges.push(index);
        }
        this.addBorder = function(thisIdx,otherIdx) {
            //this.border[thisIdx] = this.border[thisIdx] || [];
            //this.border[thisIdx].push(otherIdx);
            
            this.border[otherIdx] = this.border[otherIdx] || [];
            this.border[otherIdx].push(thisIdx);
        }
        this.add = function(index) {
            this.internal.push(index);
        }
        this.serialize = function() {
            data = {
                id: this.id,
                edges: Array.from(new Set(this.edges)),
                internal: this.internal
            }
            return data;
        }
        this.getAdjacentList = function(neighbors,regions) {
            if (!data) {
                let dirList = [-1,49,50,51,1,-49,-50,-51];
                let results = {};
                let borders = {}
                for (let idx of this.internal) {
                    results[idx] = [];
                    dirList.forEach((offset) => {
                        if (this.internal.includes(idx + offset)) {
                            results[idx].push(idx + offset);
                        }
                        
                       
                        if (this.edges.includes(idx + offset))  {
                            //results[idx + offset] = results[idx + offset] || []
                            //results[idx].push(idx + offset);
                            //results[idx + offset].push(idx);
                            
                            neighbors.forEach((id) => {
                                let neighbor = regions.ids[id];
                                //console.log('neighbor',id);
                                if (neighbor.internal.includes(idx + offset)) {
                                    borders[id] = borders[id] || [];
                                    borders[id].push(idx);
                                }
                            });
                        }
                        
                    })
                }
                var data = {
                    edgeDirection: false,
                    graph: results,
                    borders: borders
                }
            }
            return data;
        }
    
    }
    this.calculate = function() {
        let walls = this.obtainWalls();
        this.populateWalls(walls);
        this.findRegions();
        this.serialize();
    }
    
    this.serialize = function() {
        this.memory.data.regions = [];
        this.memory.data.wallRegions = [];
        this.memory.data.exitRegions = [];
        this.memory.data.borders = this.borders;
        this.memory.data.spots = this.spots;
        //console.log(JSON.stringify(this.spots));
        //this.memory.data.spots = this.spots;
        this.memory.data.validation = this.encodeWalls(this.obtainWalls());
        for (let region of this.regions) {
            this.memory.data.regions.push(region.serialize());
        }
        for (let region of this.wallRegions) {
            this.memory.data.wallRegions.push(region.serialize());
        }
        for (let region of this.exitRegions) {
            this.memory.data.exitRegions.push(region.serialize());
        }
    }
    
    this.deserialize = function(data = this.memory.data) {
        for (let region of data.regions) {
            let reg = new Region(region.id, region.edges, region.internal);
            this.ids[region.id] = reg;
            this.regions.push(reg);
        }
        for (let region of data.wallRegions) {
            let reg = new Region(region.id, region.edges, region.internal);
            //console.log('wallID', region.id,reg.id);
            this.ids[region.id] = reg;
            this.wallRegions.push(reg);
        }
        for (let region of data.exitRegions) {
            let reg = new Region(region.id, region.edges, region.internal);
            //console.log('exitID', region.id,reg.id);
            this.ids[region.id] = reg;
            this.exitRegions.push(reg);
        }
        this.borders = this.memory.data.borders;
        this.spots = this.memory.data.spots;
    }
    
    //returns array of terrain, val of 3 means room exit.
    this.obtainTerrain = function() {
        //if _terrain hasn't already been calced
        if (!_terrain) {
            //get raw terrain data
            let rawTerrain = new Room.Terrain(this.roomName);
            var _terrain = [];
            for (let x = 0; x < 50; x++) {
                for (let y = 0; y < 50; y++) {
                    let idx = x * 50 + y;
                    let val = rawTerrain.get(x,y);
                    //if space is not a wall and is on the edge
                    if ((val != 1) && (x == 0 || x == 49 || y == 0 || y == 49)) {
                        //then it is an exit space
                        val = 3;
                    }
                    _terrain[idx] = val;
                }
            }
        }
        return _terrain;
    }
    this.obtainWalls = function() {
        if (!_walls) {
            let rawWalls = Game.rooms[this.roomName].find(FIND_STRUCTURES, {filter: (s) => {
                return s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART;
            }});
            var _walls = rawWalls;
            }
        
        return _walls;
    }
    this.populateWalls = function(_walls) {
        //console.log(JSON.stringify(this.obstacles));
        for (let s of _walls) {
            let idx = s.pos.x * 50 + s.pos.y;
            if (s.structureType == STRUCTURE_WALL) {
                this.obstacles[idx] = 4; //structure is wall
            } else {
                this.obstacles[idx] = 5; //structure is rampart
            }
        }
    }
    this.findRegions = function() {
        var floodFill = (pos_x,pos_y,region,targetVals,fromIdx = false,ignore = [1]) => { //targetVals is array of acceptable tiles types, ignore TERRAIN walls by default
            let idx = pos_x * 50 + pos_y;
            let terr = this.obstacles[idx];
            //console.log(`Terr: ${terr}`);
            if (pos_x < 0 || pos_x >= 50 || pos_y < 0 || pos_y >= 50) { // if pos is outside bounds
                return;
            }
            if (ignore.includes(terr)) {
                return;
            }
            if (targetVals.includes(terr)) { // if pos has desired fill type
                if (this.spots[idx] != 0) { // if pos has been visited already
                    return;
                } else {
                    this.spots[idx] = region.id;
                }
                region.add(idx);
                
                floodFill(pos_x + 0,pos_y - 1,region,targetVals,idx,ignore);
                floodFill(pos_x + 1,pos_y - 1,region,targetVals,idx,ignore);
                floodFill(pos_x + 1,pos_y - 0,region,targetVals,idx,ignore);
                floodFill(pos_x + 1,pos_y + 1,region,targetVals,idx,ignore);
                floodFill(pos_x + 0,pos_y + 1,region,targetVals,idx,ignore);
                floodFill(pos_x - 1,pos_y + 1,region,targetVals,idx,ignore);
                floodFill(pos_x - 1,pos_y + 0,region,targetVals,idx,ignore);
                floodFill(pos_x - 1,pos_y - 1,region,targetVals,idx,ignore);
               
            } else {
                region.addEdge(idx);
                if (fromIdx >= 0) {
                    this.borders[idx] = this.borders[idx] || [];
                    this.borders[idx].push(fromIdx);
                }
            }
            return;
            
            
        }
        let regID = 1;
        for (let idx in this.obstacles) {
            if (this.spots[idx] != 0) {
                continue;
            }
            if (this.obstacles[idx] == 0 || this.obstacles[idx] == 2) { // if plains or swamp
                var reg = new Region(regID);
                regID++;
                this.regions.push(reg);
                let [x,y] = [Math.floor(idx/50), idx % 50];
                floodFill(x,y,reg,[0,2]);
            } else if (this.obstacles[idx] == 3) { // if exit tile
                var reg = new Region(regID);
                regID++;
                this.exitRegions.push(reg)
                let [x,y] = [Math.floor(idx/50), idx % 50];
                floodFill(x,y,reg,[3]);
            } else if (this.obstacles[idx] == 4 || this.obstacles[idx] == 5) { // if wall or rampart
                var reg = new Region(regID);
                regID++;
                this.wallRegions.push(reg)
                let [x,y] = [Math.floor(idx/50), idx % 50];
                floodFill(x,y,reg,[4,5]);
            }
        }
    }
    
    this.encodeWalls = function(source = this.obtainWalls()) {
        let product = Array.from({length:2500}, () => 0);
        for (let obj of source) {
            product[obj.pos.x * 50 + obj.pos.y] = '1';
        }
        return ''.concat(product);
        //return product;
    }
    
    this.isValid = function(data = this.memory.data) {
        if (data) {
            if (data.validation == this.encodeWalls(this.obtainWalls())) {
                return true;
            }
            return false;
        }
        return false;
    }
    
    //if Memory is not instantiated, instantiate it.
    if (!Memory.Regions) {
        Memory.Regions = {};
    }
    if (!Memory.Regions[roomName]) {
        Memory.Regions[roomName] = {};
    }
    this.memory = Memory.Regions[roomName];
    this.memory.data = this.memory.data || {};
    this.memory.terrain = this.memory.terrain || this.obtainTerrain();
    this.terrain = this.memory.terrain;
    this.obstacles = Object.assign({},this.terrain)
    
    
    this.spots = Array.from({length:2500}, () => 0);
    
    if (this.isValid()) {
        this.deserialize();
    } else {
        this.calculate();
    }
};

module.exports.RoomGraph = function(roomName) {
    var regions = Game.rooms[roomName].Regions;
    regions.memory.graph = regions.memory.graph || {};
    this.memory = regions.memory.graph;
    this.wallGraphs = {};
    this.regions = regions;
    
    function Node(value, adjacents = []) {
        this.value = value;
        this.adjacents = adjacents; // adjacency list

        this.addAdjacent = function(node) {
            this.adjacents.push(node);
        }

        this.removeAdjacent = function(node) {
            const index = this.adjacents.indexOf(node);
            if(index > -1) {
                this.adjacents.splice(index, 1);
                return node;
            }  
        }

        this.getAdjacents = function() {
            return this.adjacents;
        }

        this.isAdjacent = function(node) {
            return this.adjacents.indexOf(node) > -1;
        }
    }
    
    function Graph(isDirected = false) {
        this.nodes = new Map();
        this.edgeDirection = isDirected;
        
        this.addEdge = function(source, destination) {
            const sourceNode = this.addVertex(source);
            const destinationNode = this.addVertex(destination);

            if (!sourceNode.isAdjacent(destinationNode)) {
                sourceNode.addAdjacent(destinationNode);
    
                if(!this.edgeDirection) {
                    destinationNode.addAdjacent(sourceNode);
                }
            }

            return [sourceNode, destinationNode];
        }
        
        this.addVertex = function(value) {
            if(this.nodes.has(value)) {
                return this.nodes.get(value);
            } else {
                const vertex = new Node(value);
                this.nodes.set(value, vertex);
                //console.log(vertex.value);
                return vertex;
            }
        }
        
        this.lowestCostNode = function(costs, processed) {
            return Object.keys(costs).reduce((lowest, node) => {
                if (lowest === null ||costs[node] < costs[lowest]) {
                    if (!processed.includes(node)) {
                        lowest = node;
                    }
                }
                return lowest;
            }, null);
        }
        
        this.dijkstra = function(graph,costCallback) {
            //console.log(JSON.stringify(graph));
            var costs = Object.assign({finish: 10 ** 100},costCallback('start',graph));
            
            var parents = {finish: null};
            for (let child of graph.start) {
                parents[child] = 'start';
                costs[child] = 1;
            }
            
            //console.log(JSON.stringify(costs));
            const processed = [];
            
            let node = this.lowestCostNode(costs, processed);
            let n = 0;
            while (node) {
                n++
                if (node == 'finish') {
                    //console.log('Finished!');
                    break;
                }
                
                //console.log(n);
                //console.log('node',node);
                let cost = costs[node];
                //console.log('cost', cost);
                var children = costCallback(node,graph,parents[node]);
                
                for (let c in children) {
                    //console.log(node,'child', c);
                    let newCost = cost + children[c];
                    //console.log('new cost',newCost);
                    if ((c != 0 && !costs[c]) || costs[c] > newCost) {
                        if (!costs[c]) {
                            //console.log('priceless');
                        }
                        //console.log(`Update ${c} parent to ${node}`);
                        costs[c] = newCost;
                        if (c != 'start') {
                            parents[c] = node;
                        }
                    }
                }
                
                
                
                processed.push(node);
                node = this.lowestCostNode(costs, processed);
                //console.log('next node',node);
                //console.log('next node parent',graph[node],parents[node]);
                //console.log(JSON.stringify(costs));
                //console.log(processed);
            }
            
            let optimalPath = ['finish'];
            let parent = parents.finish;
            //console.log('parent',parent);
            while (parent) {
                optimalPath.push(parent);
                parent = parents[parent];
                //console.log(parent);
            }
            optimalPath.reverse();
            
            const results = {
                cost: costs.finish,
                path: optimalPath
            };
            //console.log(JSON.stringify(parents));
            return results;
        }
        
        this.serialize = function() {
            var obj = {};
            this.nodes.forEach((key,val) => obj[val] = key.adjacents.map((a) => a.value))
            return {
                isDirected: this.edgeDirection,
                graph: obj
            }
        }
        this.deserialize = function(data) {
            this.edgeDirection = data.isDirected;
            for (let vert_id in data.graph) {
                //console.log(vert_id);
                //let vertex = this.addVertex(regions.ids[vert_id]);
                //data.graph[vert_id].forEach((adj) => {
                //    vertex.addAdjacent(regions.ids[adj]);
                //});
                data.graph[vert_id].forEach((adj) => {
                    this.addEdge(Number(vert_id),Number(adj));    
                });
            }
            //this.nodes = data.nodes;
        }
    }
    
    this.serialize = function() {
        regions.memory.graph = this.graph.serialize();
        Memory.Regions[roomName].graph.validation = Memory.Regions[roomName].data.validation;
        //regions.memory.graph.validation = regions.memory.validation;
    }
    this.deserialize = function() {
        var data = Object.assign({},this.memory);
        this.graph.deserialize(data);
    }
    
    this.regionCost = (reg,graph,parent) => {
        
        wallCost = (reg,child,parent) => {
            let region = regions.ids[reg];
            //console.log(reg);
            //console.log(Object.keys(regions.ids));
            //console.log(JSON.stringify(region));
            //console.log(child,parent);
            if (child == 'finish') {
                return{cost: 1}
            }
            let data = region.getAdjacentList([child,parent],regions);
            let wallGraph = new Graph();
            wallGraph.deserialize(data);
            
            for (let idx of data.borders[parent]) {
                wallGraph.addEdge('start',idx);
            }
            for (let idx of data.borders[child]) {
                wallGraph.addEdge('finish',idx);
            }
            let results = wallGraph.dijkstra(wallGraph.serialize().graph,(spot,graph,parent) => {
                var val = {};
                var cost = 1;
                if (spot == 'start' || spot == 'finish') {
                    cost = 1;
                } else {
                    let [x,y] = [Math.floor(spot / 50), spot % 50];
                    let Nav = new Navigation.CombatNav(regions.roomName);
                    let heals = Math.ceil(Nav.towerMap().get(x,y) / HEAL_POWER);
                    let works = Math.ceil(Nav.towerMap().get(x,y) * 4 / 3 / DISMANTLE_POWER);
                    let hits = Game.rooms[regions.roomName].lookForAt(LOOK_STRUCTURES,x,y).reduce((total,s) => {
                        if (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) {
                            total += s.hits;
                        }
                        return total;
                    },0);
                    works += hits / (DISMANTLE_POWER * 1500);
                    let moves = works + heals;
                    cost = works * BODYPART_COST[WORK] + heals * BODYPART_COST[HEAL] + moves * BODYPART_COST[MOVE];
                }
                for (let child of graph[spot]) {
                    val[child] = cost;
                }
                return val;
            });
            //console.log('results',JSON.stringify(results));
            this.wallGraphs[reg] = this.wallGraphs[reg] || {};
            this.wallGraphs[reg][parent] = this.wallGraphs[reg][parent] || {};
            this.wallGraphs[reg][child] = this.wallGraphs[reg][child] || {};
            this.wallGraphs[reg][parent][child] = results;
            this.wallGraphs[reg][child][parent] = results;
            //console.log('\n',JSON.stringify(this.wallGraphs),'\n\n');
            return results;
        }
        
        
        let results = {};
        
        //console.log(reg,JSON.stringify(graph));
        //console.log('\n\n',regions.wallRegions.map(reg => typeof reg.id));
        if (regions.wallRegions.map(reg => reg.id).includes(Number(reg))) {
            //console.log('WALL!');
            for (let child of graph[reg]) {
                //console.log(child);
                results[child] = wallCost(reg,child,parent).cost;
            }
        } else {
            //console.log('Not Wall.');
            //console.log(reg);
            //console.log(JSON.stringify(graph));
            for (let child of graph[reg]) {
                //console.log(child);
                results[child] = 1;
            }
        }
        //console.log(reg,'children',JSON.stringify(results));
        return results;
    }
    
    
    this.test = function() {
        regions.exitRegions.forEach((reg) => {
            this.graph.addEdge('start',reg.id);    
        });
        this.graph.addEdge('finish',regions.spots[(Game.rooms[roomName].controller.pos.x * 50 + Game.rooms[roomName].controller.pos.y) + 1]);
        //this.graph.addEdge(regions.spots[(Game.rooms[roomName].controller.pos.x * 50 + Game.rooms[roomName].controller.pos.y) + 1]'finish');
        //console.log('finish reg',regions.spots[(Game.rooms[roomName].controller.pos.x * 50 + Game.rooms[roomName].controller.pos.y) + 1]);
        //console.log(JSON.stringify(this.graph.serialize().graph));
        return this.graph.dijkstra(this.graph.serialize().graph,this.regionCost);
    }
    
    this.navigate = function(targetPos,exit) {
        regions.exitRegions.forEach((reg) => {
            let idx = reg.internal[0];
            let pos = {x: Math.floor(idx / 50), y: idx % 50};
            let exitDir;
            if (pos.y == 0) {
                exitDir = 1;
            } else if (pos.x == 49) {
                exitDir = 3;
            } else if (pos.y == 49) {
                exitDir = 5;
            } else if (pos.x == 0) {
                exitDir = 7;
            }
            //console.log('exit', exit, exitDir);
            if (!exit) {
                console.log('There isnt exit');
            }
            if (exit == exitDir) {
                //console.log('They Equal!');
                this.graph.addEdge('start',reg.id);
            }
            //console.log(this.graph.addEdge('start',reg.id));
        });
        let targetIdx = targetPos.x * 50 + targetPos.y;
        if (this.regions.spots[targetIdx] == 0) {
            for (let x = -50; x <= 50; x+= 50) {
                for (let y = -1; y <= 1; y++) {
                    let adjIdx = targetIdx + x + y;
                    if (this.regions.spots[adjIdx] > 0 && this.regions.regions.map(reg => reg.id).includes(this.regions.spots[adjIdx])) {
                        this.graph.addEdge('finish',this.regions.spots[adjIdx]);
                    }
                }
            }
        } else {
            this.graph.addEdge('finish',this.regions.spots[targetPos.x * 50 + targetPos.y]);
        }
        //this.graph.addEdge(regions.spots[(Game.rooms[roomName].controller.pos.x * 50 + Game.rooms[roomName].controller.pos.y) + 1]'finish');
        //console.log('finish reg',regions.spots[(Game.rooms[roomName].controller.pos.x * 50 + Game.rooms[roomName].controller.pos.y)]);
        console.log('Graph: ', JSON.stringify(this.graph.serialize().graph));
        //this.wallGraphs = wallGraphs;
        console.log('Nav:', JSON.stringify(this.graph.dijkstra(this.graph.serialize().graph,this.regionCost)));
        return this.graph.dijkstra(this.graph.serialize().graph,this.regionCost);
    }
    
    this.graph = new Graph();
    if (Memory.Regions[roomName] && Memory.Regions[roomName].graph && regions.isValid(Memory.Regions[roomName].graph)) {
        //console.log('deserialize');
        this.deserialize();
        let obj = {};
        this.graph.nodes.forEach((key,val) => obj[val] = key.adjacents.map((a) => a.value));
        //console.log(JSON.stringify(obj));
    } else {
        //console.log('serialize');
        for (let reg of regions.regions) {
            //console.log('reg',reg.id);
            for (let adj in reg.edges) {
                this.graph.addEdge(reg.id,regions.spots[reg.edges[adj]]);
            }
        }
        for (let reg of regions.exitRegions) {
            //console.log('exit',reg.id);
            for (let adj in reg.edges) {
                this.graph.addEdge(reg.id,regions.spots[reg.edges[adj]]);
            }
        }
        for (let reg of regions.wallRegions) {
            //console.log('wall',reg.id);
            for (let adj in reg.edges) {
                this.graph.addEdge(reg.id,regions.spots[reg.edges[adj]]);
                //console.log(reg.edges[adj],regions.spots[reg.edges[adj]]);
            }
        }
        let obj = {};
        this.graph.nodes.forEach((key,val) => obj[val] = key.adjacents.map((a) => a.value));
        //console.log(JSON.stringify(obj));
        this.serialize();
    }
    /*
    this.graph = new Graph();
    for (let n = 1; n <= 22; n++) {
        this.graph.addVertex(n);
    }
    this.graph.addEdge(1,7);
    this.graph.addEdge(2,7);
    this.graph.addEdge(3,7);
    this.graph.addEdge(4,8);
    this.graph.addEdge(5,11);
    this.graph.addEdge(6,12);
    this.graph.addEdge(7,13);
    this.graph.addEdge(7,14);
    this.graph.addEdge(7,15);
    this.graph.addEdge(7,16);
    this.graph.addEdge(7,18);
    this.graph.addEdge(8,13);
    this.graph.addEdge(9,14);
    this.graph.addEdge(9,15);
    this.graph.addEdge(9,18);
    this.graph.addEdge(9,19);
    this.graph.addEdge(9,20);
    this.graph.addEdge(9,21);
    this.graph.addEdge(9,22);
    this.graph.addEdge(10,16);
    this.graph.addEdge(10,17);
    this.graph.addEdge(10,19);
    this.graph.addEdge(11,17);
    this.graph.addEdge(12,22);
    */
    //console.log(this.graph.nodes.get(7).getAdjacents().length);
    //console.log('size ',this.graph.nodes.size);
    
}; 