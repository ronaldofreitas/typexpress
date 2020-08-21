//import { StormGlass } from '@src/clients/stromGlass';
//import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';

import { StormGlass } from '../stormGlass';
import * as stormglassWeatherPointFixture from '../../../test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponseFixture from '../../../test/fixtures/stormglass_normalized_response_3_hours.json';

import axios from 'axios';
jest.mock('axios');

describe('StormGlass client', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    it('should return the normalized forecast from the stormglass service', async () => {
        const lat = -33.123;
        const lng = 151.287;

        mockedAxios.get.mockResolvedValue({data: stormglassWeatherPointFixture});

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual(stormglassNormalizedResponseFixture);
    });

    it('should exclude incomplete data points', async () => {
        const lat = -33.123;
        const lng = 151.287;
        const incompleteResponse = {
            hours: [
                {
                    windDirection: {
                        noaa: 300,
                    },
                    time: '2020-04-26T00:00:00-00:00',
                }
            ]
        }
        mockedAxios.get.mockResolvedValue({data: incompleteResponse});

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);
        
        expect(response).toEqual([]);
    });
    /*    it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
        const lat = -33.123;
        const lng = 151.287;
        
        mockedAxios.get.mockResolvedValue({message: 'Network Error'});
        const stormGlass = new StormGlass(mockedAxios);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error when trying to communicate to StormGlass: Network Error'
        );
    });
    */

    it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
        const lat = -33.123;
        const lng = 151.287;

        mockedAxios.get.mockRejectedValue({
            response: {
                status: 429,
                data: { 
                    errors: ['Rate Limit reached']
                },
            },
        });

        const stormGlass = new StormGlass(mockedAxios);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error returned by the StormGlass service : Error: {"errors":["Rate Limit reached"]} Code: 429'
        );
    });

});