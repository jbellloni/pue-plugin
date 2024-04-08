export type PUEConfig = Record<string, any>;

export type VendorRegionInstance = {
    year: string;
    'cloud-provider': string;
    'cloud-region': string;
    'cfe-region': string;
    'em-zone-id': string;
    'wt-region-id': string;
    location: string;
    geolocation: string;
    pue: string;
}