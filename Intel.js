module.exports = {
    segmentManager: function(segment) {
        this.segment = segment;
        this.store = function(alias,data) {
            /*
            Stores data under alias
            */
            this.memory[alias] = data;
        }
        this.retrieve = function(alias) {
            /*
            Retrieves stored object under alias
            */
            return this.memory[alias];
        }
        this.delete = function(alias) {
            delete this.memory[alias];
        }
        this.parse = function() {
            this.memory = RawMemory.segments[this.segment] ? 
            JSON.parse(RawMemory.segments[this.segment]) : {};
        }
        this.stringify = function() {
            console.log(JSON.stringify(this.memory));
            RawMemory.segments[this.segment] = JSON.stringify(this.memory);
        }
        
        this.parse();
    },
    roomSet: function(roomName) {
        let room = Game.rooms[roomName];
        if (room == undefined) {
            return ERR_NOT_FOUND;
        }
        
        let data = {};
        
        let aliasMap = {
            source: 's',
            controller: 'c',
            spawn: 'sp',
            storage: 'st',
            terminal: 'te',
            tower: 't',
            link: 'li',
            mineral: 'm',
            //extension: 'e',
            lab: 'l',
            //road: 'r',
            rampart: 'ra',
            constructedWall: 'w',
            extractor: 'er',
            nuker: 'n',
            powerSpawn: 'ps',
            factory: 'f',
            container: 'co',
            powerBank: 'pb',
            observer: 'o',
            portal: 'p',
            keeperLair: 'k',
            deposit: 'd',
            nuke: 'nk'
        }
        let uniqueStructures = [
            STRUCTURE_CONTROLLER,
            STRUCTURE_STORAGE,
            STRUCTURE_TERMINAL,
            STRUCTURE_EXTRACTOR,
            STRUCTURE_NUKER,
            STRUCTURE_POWER_SPAWN,
            STRUCTURE_FACTORY,
            STRUCTURE_OBSERVER
        ]
        
        let addStructure = function(structure) {
            let alias = aliasMap[structure.structureType];
            if (!alias) {
                return;
            }
            if (uniqueStructures.includes(structure.structureType)) {
                data[alias] = structure.pos.index;
                return;
            }
            data[alias] = data[alias] || [];
            data[alias].push(structure.pos.index);
        }
        
        room.find(FIND_STRUCTURES).forEach(s => addStructure(s));
        
        data['time'] = Game.time;
        
        return data;
    },
    roomGet: function(roomName) {
        
    }
}