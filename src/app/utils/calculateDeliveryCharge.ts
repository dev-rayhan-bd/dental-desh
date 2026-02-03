export const calculateDeliveryCharge = (dropOffs: any[]): number => {
  const BASE_CHARGE = 20; 
  const PER_KG = 10;
  const PER_QTY = 5;
  let total = BASE_CHARGE;
  dropOffs.forEach(d => {
    total += (parseFloat(d.weight) || 0) * PER_KG + (d.quantity || 0) * PER_QTY;
  });
  return parseFloat(total.toFixed(2));
};