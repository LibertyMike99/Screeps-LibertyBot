//Import dependencies here

module.exports = {
    run: function(creep) {
        
    
    },
    
    spawnInfo: {
        /*creep spawning instructions here
         *head is FIRST, least protected
         *torso fills in body
         *tail is LAST, most protected
         memory is the initial creep memory
         */
        'head': [],
        'torso': [WORK],
        'tail': [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE],
        'numberOfHeads': 0,
        'numberOfTails': 1,
        'maxEnergy': Infinity,
        'maxTorsos': 280,
        'maxBodyParts': 50,
        'memory': {role: 'depositMiner', transit: false, earlyReplace: true},
        'boosts': {
            work: ['XUHO2'],
            carry: ['KH']
        }
    },
    
    spawnInstructions: function(info) {
        return {...module.exports.spawnInfo, ...{adtlBoosts: {'XUHO2':0}}};
    }
};