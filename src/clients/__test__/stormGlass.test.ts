//import { StormGlass } from '@src/clients/stromGlass';
//import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';

import { StormGlass } from '../stormGlass';
import * as stormglassWeatherPointFixture from '../../../test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponseFixture from '../../../test/fixtures/stormglass_normalized_response_3_hours.json';

import * as HTTPUtil from '../../util/request';

jest.mock('../../util/request');

describe('StormGlass client', () => {
    const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>
    const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
    it('should return the normalized forecast from the stormglass service', async () => {
        const lat = -33.123;
        const lng = 151.287;

        mockedRequest.get.mockResolvedValue({data: stormglassWeatherPointFixture} as HTTPUtil.Response);

        const stormGlass = new StormGlass(mockedRequest);
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
        mockedRequest.get.mockResolvedValue({data: incompleteResponse} as HTTPUtil.Response);

        const stormGlass = new StormGlass(mockedRequest);
        const response = await stormGlass.fetchPoints(lat, lng);
        
        expect(response).toEqual([]);
    });
    /*
    it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
        const lat = -33.123;
        const lng = 151.287;
        
        mockedRequest.get.mockResolvedValue({message: 'Network Error'} as HTTPUtil.Response);
        const stormGlass = new StormGlass(mockedRequest);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error when trying to communicate to StormGlass: Network Error'
        );
    });
*/
    it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
        const lat = -33.123;
        const lng = 151.287;

        MockedRequestClass.isRequestError.mockResolvedValue(true);

        mockedRequest.get.mockRejectedValue({
            response: {
                status: 429,
                data: { 
                    errors: ['Rate Limit reached']
                },
            },
        });

        const stormGlass = new StormGlass(mockedRequest);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error returned by the StormGlass service : Error: {"errors":["Rate Limit reached"]} Code: 429'
        );
    });

});