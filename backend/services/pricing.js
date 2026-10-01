export const roundMoney = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export const calculateOrderTotals = (subtotal) => {
  const roundedSubtotal = roundMoney(subtotal);
  const shippingFee =
    roundedSubtotal === 0 ||
    roundedSubtotal >= Number(process.env.FREE_SHIPPING_THRESHOLD_ETB)
      ? 0
      : Number(process.env.SHIPPING_FEE_ETB);
  const vat = roundMoney(roundedSubtotal * 0.15);

  return {
    subtotal: roundedSubtotal,
    shippingFee,
    vat,
    totalAmount: roundMoney(roundedSubtotal + shippingFee + vat),
    currency: "ETB",
  };
};
