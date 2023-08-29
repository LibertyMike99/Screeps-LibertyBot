//Import dependencies here

module.exports = {
    run: function(creep) {
        //creep logic here
    
    },
    
    spawnInfo: {
        /*creep spawning instructions here
         *head is FIRST, least protected
         *torso fills in body
         *tail is LAST, most protected
         memory is the initial creep memory
         */
        'head': [],
        'torso': [],
        'tail': [],
        'numberOfHeads': 1,
        'numberOfTails': 1,
        'maxEnergy': Infinity,
        'maxTorsos': Infinity,
        'maxBodyParts': 50,
        'memory': {role: 'TEMPLATE', transit: false}
    }
};