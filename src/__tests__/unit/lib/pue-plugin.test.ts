import {PUE} from '../../../lib/pue';
import {ERRORS} from '../../../util/errors';
const {InputValidationError} = ERRORS;


describe('lib/pue: ', () => {
  describe('PUE(): ', () => {
    it('has metadata field.', () => {
      const pluginInstance = PUE({});

      expect(pluginInstance).toHaveProperty('metadata');
      expect(pluginInstance).toHaveProperty('execute');
      expect(pluginInstance.metadata).toHaveProperty('kind');
      expect(typeof pluginInstance.execute).toBe('function');
    });

    describe('execute(): ', () => {
      it('applies logic on simplest input array.', async () => {
        const pluginInstance = PUE({});
        const inputs = [{'cpu/energy': 2.00}];

        const expectedResult = [{
          'cpu/energy': 2,
          'pue': 1.58,
          'pue_energy': 3.16,
        }]

        const response = await pluginInstance.execute(inputs, {});
        expect(response).toEqual(expectedResult);
      });

      it('throws an error on missing params in input.', async () => {
        const pluginInstance = PUE({});
        const inputs = [{}];

        const expectedMessage = '"cpu/energy" parameter is required. Error code: invalid_type.';

        try {
          await pluginInstance.execute(inputs, {});
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(expectedMessage)
          );
        }
      });

      it('applies logic on input array, pue given in config.', async () => {
        const pluginInstance = PUE({});
        const inputs = [{'cpu/energy': 2.00}];

        const expectedResult = [{
          'cpu/energy': 2,
          'pue': 3,
          'pue_energy': 6,
        }]

        const response = await pluginInstance.execute(inputs, {pue: 3.0});
        expect(response).toEqual(expectedResult);
      });

      it('applies logic on input array, cloud-vendor given.', async () => {
        const pluginInstance = PUE({});
        const inputs = [{'cpu/energy': 2.00, 'cloud/vendor': 'gcp'}];

        const expectedResult = [{
          'cpu/energy': 2,
          'cloud/vendor': 'gcp',
          'pue': 1.100,
          'pue_energy': 2.200,
        }]

        const response = await pluginInstance.execute(inputs, {pue: 3.0});
        expect(response).toEqual(expectedResult);
      });

      it('applies logic on input array, cloud-vendor and region given.', async () => {
        const pluginInstance = PUE({});
        const inputs = [{'cpu/energy': 2.00, 'cloud/vendor': 'aws', 'cloud/region': 'us-east-2'}];

        const expectedResult = [{
          'cpu/energy': 2,
          'cloud/vendor': 'aws',
          'cloud/region': 'us-east-2',
          'pue': 1.200,
          'pue_energy': 2.400,
        }]

        const response = await pluginInstance.execute(inputs, {pue: 3.0});
        expect(response).toEqual(expectedResult);
      });

      it('applies logic on input array, cloud-vendor given but region wrong.', async () => {
        const pluginInstance = PUE({});
        const inputs = [{'cpu/energy': 2.00, 'cloud/vendor': 'azure', 'cloud/region': 'useast2'}];

        const expectedResult = [{
          'cpu/energy': 2,
          'cloud/vendor': 'azure',
          'cloud/region': 'useast2',
          'pue': 1.18,
          'pue_energy': 2.36,
        }]

        const response = await pluginInstance.execute(inputs, {});
        expect(response).toEqual(expectedResult);
      });

      it('applies logic on input array, cloud-vendor given but region wrong.', async () => {
        const pluginInstance = PUE({});
        const inputs = [{'cpu/energy': 2.00, 'cloud/vendor': 'aws'}];

        const expectedResult = [{
          'cpu/energy': 2,
          'cloud/vendor': 'aws',
          'pue': 1.2,
          'pue_energy': 2.4,
        }]

        const response = await pluginInstance.execute(inputs, {});
        expect(response).toEqual(expectedResult);
      });
    });
  });

  //test PUE with global-config
  describe('PUE({pue: 5.0}): ', () => {
    it('has metadata field.', () => {
      const pluginInstance = PUE({pue: 5.0});
  
      expect(pluginInstance).toHaveProperty('metadata');
      expect(pluginInstance).toHaveProperty('execute');
      expect(pluginInstance.metadata).toHaveProperty('kind');
      expect(typeof pluginInstance.execute).toBe('function');
    });

    describe('execute(): ', () => {
      it('applies logic on simplest input array.', async () => {
        const pluginInstance = PUE({pue: 5.0});
        const inputs = [{'cpu/energy': 2.00}];
  
        const expectedResult = [{
          'cpu/energy': 2,
          'pue': 5.0,
          'pue_energy': 10,
        }]
  
        const response = await pluginInstance.execute(inputs, {});
        expect(response).toEqual(expectedResult);
      });
    });
  });
});
