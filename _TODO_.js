Make RoomPlanner
Make RequestGroup
Make Administrators
Make FillerManager?
Make LabManager
Make Mineral Miners/Haulers // Done 3/27/23
Make Intel/Recon module, plus implement into existing pathfinding and planning 
Make Map and normalize inter-room navigatition
Make Tasks, for creeps/admins

Administrator: {

/*The idea of the Administator is to seperate the powers and responsibilities of tasks into distinct parts,
allowing for simple modification, a more clear structure, as well as extensibilty.
Additionally, by abstracting tasks out, code can be understood and modified at the granularity desired.
Presently, logic/structure code is mingled with implementation code.

For example, the code currently runs each creep independently of the rest. While for most creeps, 
this is acceptable for their simple behavior, but for creeps of the same role and function, 
they fail to coordinate with each other. Fillers all run separate calculations for the same room,
wasting precious CPU and diminishing efficient filling, which would be saved if they had tasks assigned.
For many types of creeps, they will target the same object, either for filling or picking up, when ideally only one is needed.
Military creeps all act independent of each other, causing tactical issues.

Another core principle is to enforce interfacing with specific elements of the game through a dedicated system.
Each type of Administrator would extend the base admin and control it's own runtime logic and memory.
Additionally, there could be methods that could be called by other parts of the code when necessary.

Many adminstrators could require a same-tick 'dialogue' so to speak with admins/creeps
above and below it hierarchically. I'm unsure of the implementation details of this, looking into callbacks/async
*/

// Here is a list of the Administrators that I can foresee a need to implement
Master,
HomeRooms,
Network,
Spawning,
Military,
Labs,
Harvesting,
Fillers,
Links,
etc,

// Here are the types of properties each Administrator may have at minimum 
operators, //creeps, other administrators, etc
providers, //energy sources, storage, containers, links, terminal, labs, extractors, etc
requestors, //terminal, labs, storage, controller, links, towers, walls/ramparts, etc 
tasks, //??unsure of the implementation of this, but presumably this would be assigned by superior
superior, //the administrator answers to or interfaces with the superior administrator. For example, the Labs admin may request from or provide to the Room admin.
run, //the runtime function to be called by the superior. It is called run, so that both creeps or admins may be called with the same method. 
debug/benchmark, //Ideally, admins should be able to track their expenses, efficiency, cpu usage, etc for reporting and analysis.
memory, //each admin should have it's own memory address.
}

Master:
    Military
    Intel
    Market
    Terminal Network