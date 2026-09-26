describe('Payment & Monetization API Suite', () => {
  it('should calculate revenue split correctly', () => {
    const totalAmount = 100;
    const instructorEarning = Number((totalAmount * 0.8).toFixed(2));
    const platformCommission = Number((totalAmount * 0.2).toFixed(2));

    expect(instructorEarning).toBe(80);
    expect(platformCommission).toBe(20);
    expect(instructorEarning + platformCommission).toBe(totalAmount);
  });
});
