function classifyGameType(payoffAA, payoffAB, payoffBA, payoffBB) {
    if (payoffAB > payoffBA && payoffAB > payoffAA && payoffAB > payoffBB) {
      return 'Dominance A';
    }
  
    if (payoffBA > payoffAB && payoffBA > payoffAA && payoffBA > payoffBB) {
      return 'Dominance B';
    }
  
    if (payoffBA > payoffAB && payoffBB > payoffAA) {
      return 'Mutual Chicken';
    }
  
    if (payoffAA > payoffBB && payoffAB > payoffBA) {
      return 'Mutual Aggressive';
    }
  
    if (payoffAB > payoffAA && payoffBB > payoffBA) {
      return 'Asymmetric Mix (A уступает)';
    }
  
    if (payoffBA > payoffBB && payoffAA > payoffAB) {
      return 'Asymmetric Mix (B уступает)';
    }
  
    return 'Unknown';
  }
  
  module.exports = classifyGameType;
  