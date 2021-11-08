import Statistics, { FarmZone } from "../index.js";


const statistics = Statistics.fromJSON('example.json');
const pp = statistics.psychicPower;

statistics.farmAt(FarmZone.psychicPower.bridge);

console.log(pp.amountTo('1Qa', true)); // 420.0T
console.log(pp.timeTo('1Qa')); // 3d 13h 26m 57.1875s

pp.setAmount('1Qa');
pp.setDelay(1.05) // autoclicker boost
pp.setMultiplier(4096);
statistics.farmAt(FarmZone.psychicPower.waterfall);

console.log(pp.amountPer('1h', true)); // 1.404Qa
console.log(pp.amountAfter('1d 15h 48m 8s', true)); // 56.90Qa
console.log(pp.timeTo('1Qi')); // 29d 15h 21m 53.0859375s

statistics.leaveFarmZone();