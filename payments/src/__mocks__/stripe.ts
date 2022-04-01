const stripeIdRes = 'abracaddabra';
const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: stripeIdRes }),
  },
};

export { stripeIdRes, stripe };
