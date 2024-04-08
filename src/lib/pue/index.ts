import * as fs from 'fs';

import {z} from 'zod';
import * as Papa from 'papaparse';

import {PluginInterface, PluginParams} from '../types/interface';

import {validate, allDefined} from '../../util/validations';

import {PUEConfig, VendorRegionInstance} from './types';

export const PUE = (globalConfig?: PUEConfig): PluginInterface => {
  const SUPPORTED_CLOUDS: string[] = ['aws', 'azure', 'gcp'];
  const metadata = {
    kind: 'execute',
  };

  /**
   * Get PUE into input and apply it as factor. Adapt behaviour depending on input.
   */
  const execute = async (inputs: PluginParams[], config?: PUEConfig): Promise<PluginParams[]> => {
    return inputs.map(function(input) {

      const safeInput = Object.assign({}, input, validateInput(input));

      let pue: number = 1.58; //default value, average world-wide pue in large datacenters

      // if input includes cloud/vendor
      if (SUPPORTED_CLOUDS.includes(safeInput['cloud/vendor'])) {
        const vendor = input['cloud/vendor'];

        // if input includes cloud/region
        if (safeInput['cloud/region'] != undefined) {
          const region = input['cloud/region'];

          // processRegionData returns a VendorRegionInput
          // in case that the region is not supported by the vendor, pue is set to 0
          // error-handling needs improvement!!!
          const regionData: Record<string, any> = {};
          Object.assign(regionData, processRegionData(vendor, region));

          pue = Number(regionData['pue']);

          // in case of error, only process vendor-data
          if (pue === 0) {
            pue = getCloudPUE(vendor);
          };
        }

        // returns (assumed) vendor-average if no region is given
        else {
          pue = getCloudPUE(vendor);
        }
      }

      // if no cloud-data is given, look for config-data
      else if (config && config['pue'] != undefined){
        pue = config['pue'];
      }

      // in the end look for global-config
      else if (globalConfig && globalConfig['pue'] != undefined) {
        pue = globalConfig['pue'];
      }

      const result = {
        ...input,
        'pue': pue,
        'pue_energy': calculatePueEnergy(input['cpu/energy'], pue),
      };

      return result;
    });
  };

  /**
  * Checks for required fields in input.
  */
  const validateInput = (input: PluginParams) => {
    const schema = z
      .object({
       'cpu/energy': z.number(),
      })
      .refine(allDefined, {
        message: '`cpu/energy` should be present.',
      });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  /**
   * returns pue value, zero if region could not be found for the vendor
   */
  const processRegionData = (vendor: string, region: string) => {

    const regionInput = getVendorRegion(vendor, region);

    if (regionInput === undefined) {
     return {
      pue: '0',
     }
    }

    else {
      let realRegion: VendorRegionInstance = regionInput;

      return {
        pue: realRegion['pue'],
      };
    }
  }

  /**
   * returns an average vendor-pue
   * note: only gcp publishes their pue-data regularly, for aws it is only assumed and azure is outdated
   */
  const getCloudPUE = (vendor: string) => {
    
    let pue: number;
    
    if (vendor == 'aws') {
      pue = 1.2
    }
    else if (vendor == 'azure') {
      pue = 1.18
    }
    else {
      pue = 1.1 //gcp
    }

    return pue
  };


  const calculatePueEnergy = (energy: number, pue: number) => {
    return energy * pue;    
  };

  /**
   * opens the file and parses the objects
   */
  const readCSVFile = (filePath: string) => {
    const result: any = [];

    const file = fs.readFileSync(filePath, 'utf-8');
    Papa.parse<VendorRegionInstance>(file, {
      delimiter: ',',
      header: true,
      step: (results) => {
        result.push(results.data);
      }
    });
    
    result.shift();

    return result;
  };

  /**
   * looks for vendor and region in the cloud_pue_data.csv
   * returns a VendorRegionInstance if there is one, else undefined
   */
  const getVendorRegion = (vendor: string, region: string) => {
    const cloudProvider: {[key: string]: string} = {
      aws: 'Amazon Web Services',
      azure: 'Microsoft Azure',
      gcp: 'Google Cloud',
    };

    const result = readCSVFile('..\\pue\\src\\lib\\pue\\cloud_pue_data.csv') as VendorRegionInstance[];

    const filteredResult = result.find(
      (item) =>
        item['cloud-provider'] === cloudProvider[vendor] &&
        (item['cloud-region'] === region || item['cfe-region'] === region)
    );

    return filteredResult;
  };


  return {
    metadata,
    execute,
  };
};
