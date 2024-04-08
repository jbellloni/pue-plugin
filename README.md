# pue-plugin

Applies a PUE factor to cpu/energy.

## Implementation

Papaparse is used to parse the csv-file. Also the external zod-package is required.

## Input

cpu/energy is the only required input

1. default: set to 1.58 (global average of large data-centers)
2. config or global-config: simply add 'pue: 1.3' or whatever you want as config or global-config (demonstrated in the sample manifest)
3. cloud/vendor: uses average pue values
    * GCP: 1.1 (should be accurate and up-to-date)
    * Microsoft Azure: 1.18 (data from 2022 but was accurate)
    * AWS: 1.2 (suggested by 'internal data', outdated and unreliable)
4. cloud/vendor and cloud/region: the corresponding PUE is imported from src/pue/cloud_pue_data.csv
    * GCP: the average 1.1 is used for every region -- needs adaptation
    * Microsoft Azure: pue depends by continent, thats the only data available right now
    * AWS: the hypothetical average 1.2 is used everywhere

## Usage

Clone the repository locally. In this directory run

```shell
npm install typescript
npm install papaparse
npm install zod
npm run build
npm link
```

Switch to the if directory and run
```shell
npm link ../pue-plugin
```

Now you can use the method _PUE_ with path _pue-plugin_ in your manifest. **A sample manifest can be found in inputs.**
